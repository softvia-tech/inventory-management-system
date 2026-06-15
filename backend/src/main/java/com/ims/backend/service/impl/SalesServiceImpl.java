package com.ims.backend.service.impl;

import com.ims.backend.dto.SalesCreateRequest;
import com.ims.backend.dto.SalesItemRequest;
import com.ims.backend.dto.SalesItemResponse;
import com.ims.backend.dto.SalesResponse;
import com.ims.backend.dto.BrandSalesReportResponse;
import com.ims.backend.dto.SalesReportSummaryResponse;
import com.ims.backend.entity.ActionType;
import com.ims.backend.entity.InventoryAuditLog;
import com.ims.backend.entity.Product;
import com.ims.backend.entity.SalesItem;
import com.ims.backend.entity.SalesTransaction;
import com.ims.backend.entity.User;
import com.ims.backend.exception.ResourceNotFoundException;
import com.ims.backend.repository.InventoryAuditLogRepository;
import com.ims.backend.repository.ProductRepository;
import com.ims.backend.repository.SalesTransactionRepository;
import com.ims.backend.repository.UserRepository;
import com.ims.backend.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesServiceImpl implements SalesService {

        private final SalesTransactionRepository salesTransactionRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final InventoryAuditLogRepository auditLogRepository;

        @Override
        @Transactional
        public SalesResponse processSale(SalesCreateRequest request) {
                String currentMobileNumber = org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication().getName();
                User user = userRepository.findByMobileNumber(currentMobileNumber)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Authenticated user not found in database"));

                SalesTransaction transaction = SalesTransaction.builder()
                                .invoiceNumber(generateInvoiceNumber())
                                .paymentMode(request.paymentMode())
                                .createdBy(user)
                                .isSynced(false)
                                .build();

                BigDecimal totalAmount = BigDecimal.ZERO;

                for (SalesItemRequest itemRequest : request.items()) {
                        Product product = productRepository.findById(itemRequest.productId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product not found with id: " + itemRequest.productId()));

                        if (product.getCurrentStock() < itemRequest.quantity()) {
                                throw new IllegalStateException("Insufficient stock for product: " + product.getName()
                                                + ". Available: " + product.getCurrentStock() + ", Requested: "
                                                + itemRequest.quantity());
                        }

                        int previousStock = product.getCurrentStock();
                        product.setCurrentStock(previousStock - itemRequest.quantity());
                        productRepository.save(product);

                        SalesItem salesItem = SalesItem.builder()
                                        .product(product)
                                        .quantitySold(itemRequest.quantity())
                                        .unitPriceAtSale(product.getSellingPrice())
                                        .build();

                        transaction.addItem(salesItem);

                        BigDecimal lineTotal = product.getSellingPrice()
                                        .multiply(BigDecimal.valueOf(itemRequest.quantity()));
                        totalAmount = totalAmount.add(lineTotal);

                        InventoryAuditLog auditLog = InventoryAuditLog.builder()
                                        .product(product)
                                        .actionType(ActionType.STOCK_REDUCTION_SALE)
                                        .previousQuantity(previousStock)
                                        .newQuantity(product.getCurrentStock())
                                        .transaction(transaction)
                                        .updatedBy(user)
                                        .isSynced(false)
                                        .build();
                        auditLogRepository.save(auditLog);
                }

                transaction.setTotalAmount(totalAmount);
                SalesTransaction savedTransaction = salesTransactionRepository.save(transaction);

                return mapToResponse(savedTransaction);
        }

        @Override
        @Transactional(readOnly = true)
        public List<SalesResponse> getAllSales() {
                return salesTransactionRepository.findAll().stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public SalesResponse getSaleById(UUID id) {
                SalesTransaction transaction = salesTransactionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Sales transaction not found with id: " + id));
                return mapToResponse(transaction);
        }

        private String generateInvoiceNumber() {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                return "INV-" + LocalDateTime.now().format(formatter);
        }

        private SalesResponse mapToResponse(SalesTransaction transaction) {
                List<SalesItemResponse> itemResponses = transaction.getItems().stream()
                                .map(item -> new SalesItemResponse(
                                                item.getId(),
                                                item.getProduct().getId(),
                                                item.getProduct().getName(),
                                                item.getQuantitySold(),
                                                item.getUnitPriceAtSale(),
                                                item.getUnitPriceAtSale()
                                                                .multiply(BigDecimal.valueOf(item.getQuantitySold()))))
                                .collect(Collectors.toList());

                return new SalesResponse(
                                transaction.getId(),
                                transaction.getInvoiceNumber(),
                                transaction.getPaymentMode(),
                                transaction.getTotalAmount(),
                                transaction.getCreatedBy().getId(),
                                transaction.getTimestamp(),
                                itemResponses);
        }

        @Override
        @Transactional(readOnly = true)
        public SalesReportSummaryResponse getSalesReport(String frequency) {
                List<SalesTransaction> allTransactions = salesTransactionRepository.findAll();

                BigDecimal cumulativeBasePrice = BigDecimal.ZERO;

                OffsetDateTime now = OffsetDateTime.now();
                OffsetDateTime startDate;

                switch (frequency != null ? frequency.toUpperCase() : "ALL_TIME") {
                        case "TODAY":
                                startDate = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
                                break;
                        case "THIS_WEEK":
                                startDate = now.minusDays(now.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0)
                                                .withSecond(0).withNano(0);
                                break;
                        case "THIS_MONTH":
                                startDate = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                                break;
                        case "THIS_YEAR":
                                startDate = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                                break;
                        case "ALL_TIME":
                        default:
                                startDate = OffsetDateTime.MIN;
                                break;
                }

                Map<String, BrandSalesReportResponse> brandReportsMap = new HashMap<>();

                for (SalesTransaction tx : allTransactions) {
                        for (SalesItem item : tx.getItems()) {
                                BigDecimal basePrice = item.getProduct().getCostPrice() != null
                                                ? item.getProduct().getCostPrice()
                                                : BigDecimal.ZERO;
                                BigDecimal itemBasePriceTotal = basePrice
                                                .multiply(BigDecimal.valueOf(item.getQuantitySold()));

                                // Add to global cumulative base price
                                cumulativeBasePrice = cumulativeBasePrice.add(itemBasePriceTotal);

                                // Check if within frequency range for the chart report
                                if (tx.getTimestamp() != null && !tx.getTimestamp().isBefore(startDate)) {
                                        String brand = item.getProduct().getBrand();
                                        if (brand == null || brand.isEmpty()) {
                                                brand = "Unbranded";
                                        }

                                        BigDecimal itemSellingPriceTotal = item.getUnitPriceAtSale()
                                                        .multiply(BigDecimal.valueOf(item.getQuantitySold()));

                                        BrandSalesReportResponse brandReport = brandReportsMap.getOrDefault(brand,
                                                        new BrandSalesReportResponse(brand, BigDecimal.ZERO,
                                                                        BigDecimal.ZERO));

                                        brandReportsMap.put(brand, new BrandSalesReportResponse(
                                                        brand,
                                                        brandReport.totalBasePrice().add(itemBasePriceTotal),
                                                        brandReport.totalSellingPrice().add(itemSellingPriceTotal)));
                                }
                        }
                }

                return new SalesReportSummaryResponse(
                                cumulativeBasePrice,
                                new ArrayList<>(brandReportsMap.values()));
        }
}

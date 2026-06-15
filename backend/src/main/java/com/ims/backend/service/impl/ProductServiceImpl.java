package com.ims.backend.service.impl;

import com.ims.backend.dto.*;
import com.ims.backend.entity.Product;
import com.ims.backend.exception.DuplicateResourceException;
import com.ims.backend.exception.ResourceNotFoundException;
import com.ims.backend.repository.ProductRepository;
import com.ims.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("Product with SKU '" + request.sku() + "' already exists");
        }
        if (request.barcode() != null && productRepository.existsByBarcode(request.barcode())) {
            throw new DuplicateResourceException("Product with barcode '" + request.barcode() + "' already exists");
        }

        Product product = Product.builder()
                .sku(request.sku())
                .barcode(request.barcode())
                .name(request.name())
                .category(request.category())
                .brand(request.brand())
                .attributes(request.attributes())
                .costPrice(request.costPrice())
                .profitPercentage(request.profitPercentage())
                .currentStock(request.initialStock() != null ? request.initialStock() : 0)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductListResponse> getAllProductsAndQuantities() {
        return productRepository.findAll().stream()
                .map(p -> new ProductListResponse(
                        p.getId(),
                        p.getSku(),
                        p.getBarcode(),
                        p.getName(),
                        p.getCategory(),
                        p.getBrand(),
                        p.getAttributes(),
                        p.getCostPrice(),
                        p.getSellingPrice(),
                        p.getCurrentStock()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductResponse updateProductDetails(UUID id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setName(request.name());
        product.setCategory(request.category());
        product.setBrand(request.brand());
        product.setAttributes(request.attributes());
        product.setCostPrice(request.costPrice());
        product.setProfitPercentage(request.profitPercentage());

        // Price calculations are handled automatically in @PreUpdate inside the entity
        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    @Override
    @Transactional
    public ProductResponse adjustStock(UUID id, StockAdjustmentRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        int newStock = product.getCurrentStock() + request.quantity();
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative. Current stock: " + product.getCurrentStock());
        }

        product.setCurrentStock(newStock);
        
        // Note: For Phase 1 we just update stock. Later, this should also log to inventory_audit_logs.

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getBarcode(),
                product.getName(),
                product.getCategory(),
                product.getBrand(),
                product.getAttributes(),
                product.getCostPrice(),
                product.getProfitPercentage(),
                product.getSellingPrice(),
                product.getCurrentStock(),
                product.getUpdatedAt(),
                product.getIsSynced()
        );
    }
}

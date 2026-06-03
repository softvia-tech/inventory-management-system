package com.ims.backend.controller;

import com.ims.backend.dto.*;
import com.ims.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "Endpoints for managing products and inventory")
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Create a new product", description = "Adds a new product to the inventory")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get all products", description = "Retrieves a summary list of all products and their quantities")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'POS_ADMIN', 'SUPER_ADMIN')")
    @GetMapping
    public ResponseEntity<List<ProductListResponse>> getAllProductsAndQuantities() {
        List<ProductListResponse> response = productService.getAllProductsAndQuantities();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get product by barcode", description = "Fetches complete details of a specific product using its barcode")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'POS_ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductResponse> getProductByBarcode(@PathVariable String barcode) {
        ProductResponse response = productService.getProductByBarcode(barcode);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update product details", description = "Modifies existing product details (name, cost price, profit percentage)")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProductDetails(
            @PathVariable UUID id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductResponse response = productService.updateProductDetails(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Adjust stock quantity", description = "Manually adjust stock level up or down by providing the quantity to adjust")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'SUPER_ADMIN')")
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> adjustStock(
            @PathVariable UUID id,
            @Valid @RequestBody StockAdjustmentRequest request) {
        ProductResponse response = productService.adjustStock(id, request);
        return ResponseEntity.ok(response);
    }
}

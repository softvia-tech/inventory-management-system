package com.ims.backend.controller;

import com.ims.backend.dto.SalesCreateRequest;
import com.ims.backend.dto.SalesResponse;
import com.ims.backend.service.SalesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Tag(name = "Sales Transactions", description = "Endpoints for processing sales and checkout operations")
public class SalesController {

    private final SalesService salesService;

    @Operation(summary = "Process a new sale", description = "Creates a new sales transaction, deducts inventory, and records audit logs")
    @PreAuthorize("hasAnyRole('POS_ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<SalesResponse> createSale(@Valid @RequestBody SalesCreateRequest request) {
        SalesResponse response = salesService.processSale(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get all sales", description = "Retrieves a history of all sales transactions")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'POS_ADMIN', 'SUPER_ADMIN')")
    @GetMapping
    public ResponseEntity<List<SalesResponse>> getAllSales() {
        return ResponseEntity.ok(salesService.getAllSales());
    }

    @Operation(summary = "Get sale details", description = "Retrieves the full receipt/details for a specific sales transaction")
    @PreAuthorize("hasAnyRole('INVENTORY_ADMIN', 'POS_ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<SalesResponse> getSaleById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesService.getSaleById(id));
    }
}

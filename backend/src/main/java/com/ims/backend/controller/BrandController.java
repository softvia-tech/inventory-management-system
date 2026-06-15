package com.ims.backend.controller;

import com.ims.backend.dto.BrandDto;
import com.ims.backend.dto.BrandRequest;
import com.ims.backend.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@Tag(name = "Brand Management", description = "APIs for managing brands and logos")
public class BrandController {

    private final BrandService brandService;

    @Operation(summary = "Get all brands", description = "Retrieves a list of all brands")
    @GetMapping
    public ResponseEntity<List<BrandDto>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @Operation(summary = "Get brand by ID", description = "Retrieves a specific brand by ID")
    @GetMapping("/{id}")
    public ResponseEntity<BrandDto> getBrandById(@PathVariable UUID id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @Operation(summary = "Create brand", description = "Creates a new brand. Only accessible to SUPER_ADMIN")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<BrandDto> createBrand(@RequestBody BrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(request));
    }

    @Operation(summary = "Update brand", description = "Updates an existing brand. Only accessible to SUPER_ADMIN")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<BrandDto> updateBrand(@PathVariable UUID id, @RequestBody BrandRequest request) {
        return ResponseEntity.ok(brandService.updateBrand(id, request));
    }

    @Operation(summary = "Delete brand", description = "Deletes a brand. Only accessible to SUPER_ADMIN")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable UUID id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}

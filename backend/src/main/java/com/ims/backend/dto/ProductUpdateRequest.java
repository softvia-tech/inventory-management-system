package com.ims.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;

public record ProductUpdateRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 150, message = "Product name must not exceed 150 characters")
        String name,

        String category,

        String brand,

        Map<String, String> attributes,

        @NotNull(message = "Cost price is required")
        @DecimalMin(value = "0.01", message = "Cost price must be greater than zero")
        BigDecimal costPrice,

        @DecimalMin(value = "0.00", message = "Profit percentage must not be negative")
        BigDecimal profitPercentage
) {
}

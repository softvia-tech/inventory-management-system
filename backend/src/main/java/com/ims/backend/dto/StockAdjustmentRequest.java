package com.ims.backend.dto;

import jakarta.validation.constraints.NotNull;

public record StockAdjustmentRequest(
        @NotNull(message = "Quantity to adjust is required (positive to add, negative to reduce)")
        Integer quantity,
        
        String reason
) {
}

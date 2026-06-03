package com.ims.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SalesCreateRequest(
        @NotBlank(message = "Payment mode is required") String paymentMode,

        @NotEmpty(message = "At least one item is required for a sale") @Valid List<SalesItemRequest> items) {
}

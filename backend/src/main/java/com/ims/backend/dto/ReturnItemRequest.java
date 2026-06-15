package com.ims.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReturnItemRequest(
    @NotNull(message = "Sales Item ID is required")
    UUID salesItemId,

    @NotNull(message = "Quantity to return is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantityToReturn
) {}

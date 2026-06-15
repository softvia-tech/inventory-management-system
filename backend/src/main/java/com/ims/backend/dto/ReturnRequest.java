package com.ims.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ReturnRequest(
    @NotEmpty(message = "Items to return cannot be empty")
    @Valid
    List<ReturnItemRequest> items
) {}

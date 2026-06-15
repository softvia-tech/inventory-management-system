package com.ims.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record SalesResponse(
    UUID id,
    String invoiceNumber,
    String paymentMode,
    BigDecimal totalAmount,
    UUID createdBy,
    OffsetDateTime timestamp,
    String status,
    BigDecimal refundedAmount,
    List<SalesItemResponse> items
) {}

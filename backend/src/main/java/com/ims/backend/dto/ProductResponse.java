package com.ims.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String sku,
        String barcode,
        String name,
        String category,
        String brand,
        Map<String, String> attributes,
        BigDecimal costPrice,
        BigDecimal profitPercentage,
        BigDecimal sellingPrice,
        Integer currentStock,
        OffsetDateTime updatedAt,
        Boolean isSynced
) {
}

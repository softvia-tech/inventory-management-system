package com.ims.backend.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record ProductListResponse(
        UUID id,
        String sku,
        String barcode,
        String name,
        String category,
        String brand,
        Map<String, String> attributes,
        BigDecimal sellingPrice,
        Integer currentStock
) {
}

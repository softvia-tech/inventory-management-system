package com.ims.backend.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record SalesItemResponse(
    UUID id,
    UUID productId,
    String productName,
    Integer quantitySold,
    BigDecimal unitPriceAtSale,
    BigDecimal subTotal,
    Integer quantityReturned,
    Map<String, String> attributes
) {}

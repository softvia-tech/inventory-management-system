package com.ims.backend.dto;

import java.math.BigDecimal;

public record BrandSalesReportResponse(
        String brand,
        BigDecimal totalBasePrice,
        BigDecimal totalSellingPrice
) {
}

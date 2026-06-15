package com.ims.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record SalesReportSummaryResponse(
        BigDecimal cumulativeSalesTillDateBasePrice,
        List<BrandSalesReportResponse> brandReports
) {
}

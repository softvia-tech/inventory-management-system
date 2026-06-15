package com.ims.backend.service;

import com.ims.backend.dto.SalesCreateRequest;
import com.ims.backend.dto.SalesResponse;

import com.ims.backend.dto.SalesReportSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface SalesService {
    SalesResponse processSale(SalesCreateRequest request);
    List<SalesResponse> getAllSales();
    SalesResponse getSaleById(UUID id);
    SalesReportSummaryResponse getSalesReport(String frequency);
}

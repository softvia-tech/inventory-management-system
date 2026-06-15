package com.ims.backend.service;

import com.ims.backend.dto.BrandDto;
import com.ims.backend.dto.BrandRequest;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    List<BrandDto> getAllBrands();
    BrandDto getBrandById(UUID id);
    BrandDto createBrand(BrandRequest request);
    BrandDto updateBrand(UUID id, BrandRequest request);
    void deleteBrand(UUID id);
}

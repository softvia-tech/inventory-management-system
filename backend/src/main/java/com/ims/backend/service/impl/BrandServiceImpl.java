package com.ims.backend.service.impl;

import com.ims.backend.dto.BrandDto;
import com.ims.backend.dto.BrandRequest;
import com.ims.backend.entity.Brand;
import com.ims.backend.exception.ResourceNotFoundException;
import com.ims.backend.repository.BrandRepository;
import com.ims.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BrandDto> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDto getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return mapToDto(brand);
    }

    @Override
    @Transactional
    public BrandDto createBrand(BrandRequest request) {
        if (brandRepository.existsByNameIgnoreCase(request.name())) {
            throw new IllegalArgumentException("Brand with name " + request.name() + " already exists.");
        }
        
        Brand brand = Brand.builder()
                .name(request.name())
                .logoBase64(request.logoBase64())
                .build();
                
        return mapToDto(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandDto updateBrand(UUID id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
                
        if (!brand.getName().equalsIgnoreCase(request.name()) && brandRepository.existsByNameIgnoreCase(request.name())) {
            throw new IllegalArgumentException("Brand with name " + request.name() + " already exists.");
        }
        
        brand.setName(request.name());
        brand.setLogoBase64(request.logoBase64());
        
        return mapToDto(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void deleteBrand(UUID id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand not found with id: " + id);
        }
        brandRepository.deleteById(id);
    }
    
    private BrandDto mapToDto(Brand brand) {
        return new BrandDto(
                brand.getId(),
                brand.getName(),
                brand.getLogoBase64()
        );
    }
}

package com.ims.backend.dto;

import java.util.UUID;

public record BrandDto(
        UUID id,
        String name,
        String logoBase64
) {}

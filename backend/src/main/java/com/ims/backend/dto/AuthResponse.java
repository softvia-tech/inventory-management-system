package com.ims.backend.dto;

public record AuthResponse(
    String token,
    String refreshToken,
    String mobileNumber,
    String role
) {}

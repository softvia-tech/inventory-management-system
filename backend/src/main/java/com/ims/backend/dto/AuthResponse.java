package com.ims.backend.dto;

public record AuthResponse(
    String token,
    String mobileNumber,
    String role
) {}

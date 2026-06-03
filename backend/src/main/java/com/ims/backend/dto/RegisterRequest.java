package com.ims.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    String mobileNumber,

    @NotBlank(message = "Password is required")
    String password
) {}

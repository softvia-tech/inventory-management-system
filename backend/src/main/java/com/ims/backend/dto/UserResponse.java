package com.ims.backend.dto;

import com.ims.backend.entity.ApprovalStatus;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String mobileNumber,
    String role,
    ApprovalStatus status
) {}

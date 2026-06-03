package com.ims.backend.controller;

import com.ims.backend.dto.UserResponse;
import com.ims.backend.entity.ApprovalStatus;
import com.ims.backend.entity.User;
import com.ims.backend.exception.ResourceNotFoundException;
import com.ims.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for Super Admins to approve/reject users")
public class UserController {

    private final UserRepository userRepository;

    @Operation(summary = "Get pending users", description = "Retrieves all users pending approval")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        List<UserResponse> pendingUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == ApprovalStatus.PENDING)
                .map(u -> new UserResponse(u.getId(), u.getMobileNumber(), u.getRole(), u.getStatus()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingUsers);
    }

    @Operation(summary = "Approve a user", description = "Approves a pending user and assigns a role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<UserResponse> approveUser(@PathVariable UUID id, @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setStatus(ApprovalStatus.APPROVED);
        user.setRole(role); // e.g. INVENTORY_ADMIN or POS_ADMIN
        userRepository.save(user);

        return ResponseEntity.ok(new UserResponse(user.getId(), user.getMobileNumber(), user.getRole(), user.getStatus()));
    }

    @Operation(summary = "Reject a user", description = "Rejects a pending user")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<UserResponse> rejectUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setStatus(ApprovalStatus.REJECTED);
        userRepository.save(user);

        return ResponseEntity.ok(new UserResponse(user.getId(), user.getMobileNumber(), user.getRole(), user.getStatus()));
    }
}

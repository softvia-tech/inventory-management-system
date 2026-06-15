package com.ims.backend.controller;

import com.ims.backend.dto.AuthResponse;
import com.ims.backend.dto.LoginRequest;
import com.ims.backend.dto.RegisterRequest;
import com.ims.backend.dto.RefreshTokenRequest;
import com.ims.backend.entity.ApprovalStatus;
import com.ims.backend.entity.User;
import com.ims.backend.exception.DuplicateResourceException;
import com.ims.backend.repository.UserRepository;
import com.ims.backend.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user login and registration")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Operation(summary = "User Login", description = "Authenticates a user and returns a JWT token")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.mobileNumber(), request.password())
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            return ResponseEntity.ok(new AuthResponse(token, refreshToken, user.getMobileNumber(), user.getRole()));
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Your account is pending approval by an administrator."));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid mobile number or password"));
        }
    }

    @Operation(summary = "User Registration", description = "Registers a new user with PENDING status")
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByMobileNumber(request.mobileNumber()).isPresent()) {
            throw new DuplicateResourceException("Mobile number is already registered.");
        }

        User newUser = User.builder()
                .mobileNumber(request.mobileNumber())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role("UNASSIGNED")
                .status(ApprovalStatus.PENDING)
                .isSynced(false)
                .build();

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Account created successfully. Please wait for administrator approval."));
    }

    @Operation(summary = "Refresh Token", description = "Generates a new access token using a valid refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();
        try {
            String mobileNumber = jwtService.extractUsername(refreshToken);
            if (mobileNumber != null) {
                User user = userRepository.findByMobileNumber(mobileNumber).orElse(null);

                if (user != null && jwtService.isTokenValid(refreshToken, user)) {
                    String newAccessToken = jwtService.generateToken(user);
                    return ResponseEntity.ok(new AuthResponse(newAccessToken, refreshToken, user.getMobileNumber(), user.getRole()));
                }
            }
        } catch (Exception e) {
            // Token is invalid or expired
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired refresh token"));
    }
}

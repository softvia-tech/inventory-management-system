package com.ims.backend.config;

import com.ims.backend.entity.User;
import com.ims.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .mobileNumber("9999999999")
                    .passwordHash(passwordEncoder.encode("admin"))
                    .role("SUPER_ADMIN")
                    .status(com.ims.backend.entity.ApprovalStatus.APPROVED)
                    .isSynced(false)
                    .build();
            userRepository.save(admin);
            System.out.println("Default SUPER_ADMIN created (Mobile: 9999999999, Password: admin)");
        }
    }
}

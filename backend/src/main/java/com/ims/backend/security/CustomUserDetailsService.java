package com.ims.backend.security;

import com.ims.backend.entity.User;
import com.ims.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // The username is the mobile_number in our system
        Optional<User> userOptional = userRepository.findByMobileNumber(username);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with mobile number: " + username);
        }
        return userOptional.get();
    }
}

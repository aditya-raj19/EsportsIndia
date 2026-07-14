package com.esportsbuzz.controller;

import com.esportsbuzz.dto.LoginRequest;
import com.esportsbuzz.dto.LoginResponse;
import com.esportsbuzz.model.User;
import com.esportsbuzz.repository.UserRepository;
import com.esportsbuzz.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping()
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Incorrect email or password.");
        }

        String token = jwtUtil.generateToken(userOpt.get().getEmail());

        ResponseCookie cookie = ResponseCookie.from("khelgg_token", token)
                .httpOnly(true)
                .secure(true)          // true in production (HTTPS only)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("None")        // "Lax" works for same-site; "None" needed if frontend/backend are different domains + secure(true)
                .build();


        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponse(token));

    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("Email already registered.");
        }

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hash before saving

        userRepository.save(user); // this is the actual "save one user" step

        return ResponseEntity.ok("User registered successfully.");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("khelgg_token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // deletes the cookie immediately
        response.addCookie(cookie);

        return ResponseEntity.ok().body("Logged out");
    }
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        // If this line is reached, JwtAuthFilter already validated the cookie
        // and set SecurityContextHolder — otherwise SecurityConfig would've blocked it with 403
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(Map.of("email", email));
    }
}

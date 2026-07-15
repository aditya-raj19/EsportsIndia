package com.esportsbuzz.controller;

import com.esportsbuzz.dto.LoginRequest;
import com.esportsbuzz.dto.LoginResponse;
import com.esportsbuzz.model.RefreshToken;
import com.esportsbuzz.model.User;
import com.esportsbuzz.repository.RefreshTokenRepository;
import com.esportsbuzz.repository.UserRepository;
import com.esportsbuzz.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping()
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    @Value("${cookie.secure}")
    private boolean cookieSecure;

    @Value("${cookie.samesite}")
    private String cookieSameSite;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Incorrect email or password.");
        }

        String token = jwtUtil.generateAccessToken(userOpt.get().getEmail());
        String refreshTokenValue = jwtUtil.generateRefreshToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUserEmail(userOpt.get().getEmail());
        refreshToken.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        ResponseCookie accessCookie = ResponseCookie.from("khelgg_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(15 * 60)
                .sameSite(cookieSameSite)
                .build();

        ResponseCookie refreshCookies = ResponseCookie.from("esportsbuzz_refreshtoken", refreshTokenValue)
                .httpOnly(true).secure(cookieSecure).path("/").maxAge(7 * 24 * 60 * 60)
                .sameSite(cookieSameSite).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookies.toString())
                .body(new LoginResponse(token));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "esportsbuzz_refreshtoken", required = false) String refreshTokenValue) {
        if (refreshTokenValue == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No refresh token."));
        }

        Optional<RefreshToken> stored = refreshTokenRepository.findByToken(refreshTokenValue);

        if (stored.isEmpty() || stored.get().isRevoked() || stored.get().getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token invalid or expired."));
        }

        String newAccessToken = jwtUtil.generateAccessToken(stored.get().getUserEmail());

        ResponseCookie accessCookie = ResponseCookie.from("khelgg_token", newAccessToken)
                .httpOnly(true).secure(cookieSecure).path("/").sameSite(cookieSameSite)
                .maxAge(15 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(Map.of("message", "Access token refreshed"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User signUprequest) {
        if (userRepository.findByEmail(signUprequest.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("Email already registered.");
        }

        User user = new User();
        user.setEmail(signUprequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUprequest.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok().body(Map.of("message", "User registered successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "esportsbuzz_refreshtoken", required = false) String refreshTokenValue) {
        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                    .ifPresent(rt -> { rt.setRevoked(true); refreshTokenRepository.save(rt); });
        }

        ResponseCookie clearAccess = ResponseCookie.from("khelgg_token", "")
                .httpOnly(true).secure(cookieSecure).path("/").sameSite(cookieSameSite).maxAge(0).build();
        ResponseCookie clearRefresh = ResponseCookie.from("esportsbuzz_refreshtoken", "")
                .httpOnly(true).secure(cookieSecure).path("/").sameSite(cookieSameSite).maxAge(0).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAccess.toString())
                .header(HttpHeaders.SET_COOKIE, clearRefresh.toString())
                .body(Map.of("message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(Map.of("email", email));
    }
}
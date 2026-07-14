package com.esportsbuzz.repository;


import com.esportsbuzz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository already gives you save(), findAll(), findById(), deleteById()
    Optional<User> findByEmail(String email);
}

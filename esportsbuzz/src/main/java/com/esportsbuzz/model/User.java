package com.esportsbuzz.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usersdata")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String name;

    private String password;
    public User() {}

    public User(String name, String email) {
        this.email = email;
    }

}
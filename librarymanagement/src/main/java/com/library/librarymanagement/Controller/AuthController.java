package com.library.librarymanagement.Controller;

import org.springframework.web.bind.annotation.RestController;

import com.library.librarymanagement.Entities.User;
import com.library.librarymanagement.Repositories.UserRepo;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepo userRepo;

    private final List<String> allowedAdminEmails = List.of(
            "admin@acxiom.com",
            "librarian@acxiom.com",
            "manager@library.com");

    @PostMapping("/login")
    public User login(@RequestBody User req) {
        User user = userRepo.findByUsernameAndPassword(
                req.getUsername(), req.getPassword());
        if (user == null)
            throw new RuntimeException("Invalid credentials");
        if (user.getRole().equals("ADMIN")) {
            if (!allowedAdminEmails.contains(user.getEmail())) {
                throw new RuntimeException("Admin access revoked");
            }
        }
        return user;
    }

    @PostMapping("/register")
    public User register(@RequestBody User req) {
        if (userRepo.findByUsername(req.getUsername()) != null) {
            throw new RuntimeException("User already exists");
        }
        if (userRepo.findByEmail(req.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        if (!req.getRole().equals("ADMIN") && !req.getRole().equals("USER")) {
            throw new RuntimeException("Invalid role");
        }
        if (req.getRole().equals("ADMIN")) {
            if (!allowedAdminEmails.contains(req.getEmail())) {
                throw new RuntimeException("You are not authorized to create admin account");
            }
        }

        return userRepo.save(req);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleException(RuntimeException ex) {
        return ResponseEntity
                .badRequest()
                .body(Map.of("message", ex.getMessage()));
    }
}

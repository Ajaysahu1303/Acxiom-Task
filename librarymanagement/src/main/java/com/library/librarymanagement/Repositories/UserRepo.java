package com.library.librarymanagement.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.library.librarymanagement.Entities.User;

public interface UserRepo extends JpaRepository<User, Long> {
    User findByUsernameAndPassword(String username, String password);

    User findByUsername(String username);

    User findByEmail(String email);
}

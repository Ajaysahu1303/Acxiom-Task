package com.library.librarymanagement.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.librarymanagement.Entities.Book;
import com.library.librarymanagement.Repositories.BookRepo;
import com.library.librarymanagement.Repositories.IssuedRepo;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    BookRepo bookRepo;
    @Autowired
    IssuedRepo issuedRepo;

    @GetMapping("/books")
    public List<Book> availableBooks() {
        return bookRepo.findByAvailableTrue();
    }

    @Autowired
    com.library.librarymanagement.Services.LibraryService libraryService;

    @GetMapping("/issued/{userId}")
    public List<com.library.librarymanagement.dto.IssuedBookDTO> issued(@PathVariable Long userId) {
        return libraryService.getIssuedBooksWithDetails(userId);
    }
}

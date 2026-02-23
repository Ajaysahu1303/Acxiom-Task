package com.library.librarymanagement.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.library.librarymanagement.Entities.Book;
import com.library.librarymanagement.Entities.IssuedBook;
import com.library.librarymanagement.Repositories.BookRepo;
import com.library.librarymanagement.Repositories.IssuedRepo;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    BookRepo bookRepo;
    @Autowired
    IssuedRepo issuedRepo;

    @PostMapping("/books")
    public Book addBook(@RequestBody Book book) {
        return bookRepo.save(book);
    }

    @GetMapping("/books")
    public List<Book> allBooks() {
        return bookRepo.findAll();
    }

    @PostMapping("/issue")
    public org.springframework.http.ResponseEntity<String> issue(@RequestParam String email,
            @RequestParam Long bookId) {

        com.library.librarymanagement.Entities.User u = userRepo.findByEmail(email);
        if (u == null) {
            return org.springframework.http.ResponseEntity.badRequest().body("Student with this email does not exist.");
        }

        Book b = bookRepo.findById(bookId).orElseThrow();
        if (!b.isAvailable()) {
            return org.springframework.http.ResponseEntity.badRequest()
                    .body("This book is already issued and not available.");
        }
        b.setAvailable(false);
        bookRepo.save(b);

        IssuedBook ib = new IssuedBook();
        ib.setUserId(u.getId());
        ib.setBookId(bookId);
        ib.setIssueDate(LocalDate.now());
        ib.setDueDate(LocalDate.now().plusDays(7));
        issuedRepo.save(ib);

        return org.springframework.http.ResponseEntity.ok("Issued");
    }

    @Autowired
    com.library.librarymanagement.Services.LibraryService libraryService;

    @Autowired
    com.library.librarymanagement.Repositories.UserRepo userRepo;

    @PostMapping("/return/{id}")
    public String returnBook(@PathVariable Long id) {
        libraryService.returnBook(id);
        return "Returned";
    }

    @GetMapping("/user")
    public com.library.librarymanagement.Entities.User searchUser(@RequestParam String query) {
        com.library.librarymanagement.Entities.User u = userRepo.findByEmail(query);
        if (u != null)
            return u;
        try {
            return userRepo.findById(Long.parseLong(query)).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/users")
    public List<com.library.librarymanagement.Entities.User> allUsers() {
        return userRepo.findAll();
    }

    @GetMapping("/issued/{userId}")
    public List<com.library.librarymanagement.dto.IssuedBookDTO> issued(@PathVariable Long userId) {
        return libraryService.getIssuedBooksWithDetails(userId);
    }

    @PostMapping("/fine/{id}")
    public String updateFine(@PathVariable Long id, @RequestParam Integer amount) {
        IssuedBook ib = issuedRepo.findById(id).orElseThrow();
        ib.setFine(amount);
        issuedRepo.save(ib);
        return "Fine updated";
    }
}
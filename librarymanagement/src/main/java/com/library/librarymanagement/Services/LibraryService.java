package com.library.librarymanagement.Services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.library.librarymanagement.Entities.Book;
import com.library.librarymanagement.Entities.IssuedBook;
import com.library.librarymanagement.Repositories.BookRepo;
import com.library.librarymanagement.Repositories.IssuedRepo;
import com.library.librarymanagement.dto.IssuedBookDTO;

@Service
public class LibraryService {

    @Autowired
    IssuedRepo issuedRepo;

    @Autowired
    BookRepo bookRepo;

    public void calculateFine(IssuedBook ib) {
        if (ib.getReturnDate() == null) {
            LocalDate today = LocalDate.now();
            LocalDate dueDate = ib.getIssueDate().plusDays(7);
            if (today.isAfter(dueDate)) {
                long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
                ib.setFine((int) (daysOverdue * 5));
                // Only save if it actually changes to avoid unnecessary DB hits?
                // Save is handled here simply. We can always save it.
                issuedRepo.save(ib);
            }
        }
    }

    public List<IssuedBookDTO> getIssuedBooksWithDetails(Long userId) {
        List<IssuedBook> issued = issuedRepo.findByUserId(userId);
        return issued.stream().map(ib -> {
            Book b = bookRepo.findById(ib.getBookId()).orElse(null);
            return new IssuedBookDTO(ib, b);
        }).collect(Collectors.toList());
    }

    public void returnBook(Long issuedId) {
        IssuedBook ib = issuedRepo.findById(issuedId).orElseThrow();
        if (ib.getReturnDate() == null) {
            ib.setReturnDate(LocalDate.now());
            // Calculate one last time precisely on return date
            LocalDate dueDate = ib.getIssueDate().plusDays(7);
            if (ib.getReturnDate().isAfter(dueDate)) {
                long daysOverdue = ChronoUnit.DAYS.between(dueDate, ib.getReturnDate());
                ib.setFine((int) (daysOverdue * 5));
            }
            issuedRepo.save(ib);

            Book b = bookRepo.findById(ib.getBookId()).orElseThrow();
            b.setAvailable(true);
            bookRepo.save(b);
        }
    }
}

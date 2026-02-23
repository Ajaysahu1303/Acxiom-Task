package com.library.librarymanagement.dto;

import com.library.librarymanagement.Entities.Book;
import com.library.librarymanagement.Entities.IssuedBook;
import lombok.Data;

@Data
public class IssuedBookDTO {
    private IssuedBook issuedBook;
    private Book book;

    public IssuedBookDTO(IssuedBook issuedBook, Book book) {
        this.issuedBook = issuedBook;
        this.book = book;
    }
}

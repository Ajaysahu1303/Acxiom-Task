package com.library.librarymanagement.Repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.library.librarymanagement.Entities.Book;

public interface BookRepo extends JpaRepository<Book, Long> {
    List<Book> findByAvailableTrue();
}
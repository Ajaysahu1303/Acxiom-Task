package com.library.librarymanagement.Repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.library.librarymanagement.Entities.IssuedBook;

public interface IssuedRepo extends JpaRepository<IssuedBook, Long> {
    List<IssuedBook> findByUserId(Long userId);
}
package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.ArFamille;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArFamilleRepository extends JpaRepository<ArFamille, Long> {

    @Query("SELECT f FROM ArFamille f WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(f.famille) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ArFamille> searchFamilles(@Param("search") String search, Pageable pageable);

    boolean existsByCode(String code);
    boolean existsByCodeAndIdArFamilleNot(String code, Long id);
}
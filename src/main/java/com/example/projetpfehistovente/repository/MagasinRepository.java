package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.Magasin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MagasinRepository extends JpaRepository<Magasin, Long> {

    @Query("SELECT m FROM Magasin m WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(m.magasin) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Magasin> searchMagasins(@Param("search") String search, Pageable pageable);

    boolean existsByCode(String code);
    boolean existsByCodeAndIdMagasinNot(String code, Long idMagasin);
}
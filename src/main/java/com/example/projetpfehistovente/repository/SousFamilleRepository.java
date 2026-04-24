package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.SousFamille;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SousFamilleRepository extends JpaRepository<SousFamille, Long> {

    List<SousFamille> findByIdArFamille(Long idArFamille);

    @Query("SELECT s FROM SousFamille s WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(s.sousFamille) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:idArFamille IS NULL OR s.idArFamille = :idArFamille)")
    Page<SousFamille> searchSousFamilles(
            @Param("search") String search,
            @Param("idArFamille") Long idArFamille,
            Pageable pageable);

    boolean existsByCode(String code);
    boolean existsByCodeAndIdArSousFamilleNot(String code, Long id);
}
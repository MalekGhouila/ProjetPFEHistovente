package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.HistoVenteStaging;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoVenteStagingRepository extends JpaRepository<HistoVenteStaging, Long> {

    Page<HistoVenteStaging> findByStagingStatus(String status, Pageable pageable);

    @Query("SELECT h FROM HistoVenteStaging h WHERE " +
            "(:status IS NULL OR h.stagingStatus = :status) AND " +
            "(:codeMag IS NULL OR h.codeMag = :codeMag) AND " +
            "(:famille IS NULL OR h.famille = :famille)")
    Page<HistoVenteStaging> findWithFilters(
            @Param("status") String status,
            @Param("codeMag") String codeMag,
            @Param("famille") String famille,
            Pageable pageable);

    long countByStagingStatus(String status);

    // In HistoVenteStagingRepository.java

    // Count PENDING rows that have problems
    @Query("SELECT COUNT(s) FROM HistoVenteStaging s WHERE s.stagingStatus = 'PENDING' " +
            "AND (s.quantite IS NULL OR s.quantite <= 0 OR s.prix IS NULL OR s.prix <= 0 " +
            "OR s.dateVente IS NULL OR s.famille IS NULL OR s.codeMag IS NULL)")
    long countPendingWithProblems();

    // Count PENDING rows that are auto-valid (no problems)
    @Query("SELECT COUNT(s) FROM HistoVenteStaging s WHERE s.stagingStatus = 'PENDING' " +
            "AND s.quantite IS NOT NULL AND s.quantite > 0 " +
            "AND s.prix IS NOT NULL AND s.prix > 0 " +
            "AND s.dateVente IS NOT NULL AND s.famille IS NOT NULL AND s.codeMag IS NOT NULL")
    long countPendingAutoValid();

    // Get PENDING rows with problems (paginated)
    @Query("SELECT s FROM HistoVenteStaging s WHERE s.stagingStatus = 'PENDING' " +
            "AND (s.quantite IS NULL OR s.quantite <= 0 OR s.prix IS NULL OR s.prix <= 0 " +
            "OR s.dateVente IS NULL OR s.famille IS NULL OR s.codeMag IS NULL)")
    Page<HistoVenteStaging> findPendingWithProblems(Pageable pageable);

    // Find all auto-valid PENDING (for bulk approve)
    @Query("SELECT s FROM HistoVenteStaging s WHERE s.stagingStatus = 'PENDING' " +
            "AND s.quantite IS NOT NULL AND s.quantite > 0 " +
            "AND s.prix IS NOT NULL AND s.prix > 0 " +
            "AND s.dateVente IS NOT NULL AND s.famille IS NOT NULL AND s.codeMag IS NOT NULL")
    List<HistoVenteStaging> findAllAutoValid();
}


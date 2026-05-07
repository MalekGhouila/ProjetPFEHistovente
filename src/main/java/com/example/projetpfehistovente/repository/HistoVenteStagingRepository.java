package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.HistoVenteStaging;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
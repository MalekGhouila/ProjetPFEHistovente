package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.HistoVente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoVenteRepository extends JpaRepository<HistoVente, Long> {

    // ===== GLOBAL KPIs =====
    @Query(value = "SELECT COUNT(*) FROM histovente WHERE TypeVente = 'VENTE'",
            nativeQuery = true)
    Long countTotalTransactions();

    @Query(value = "SELECT SUM(Total) FROM histovente WHERE TypeVente = 'VENTE'",
            nativeQuery = true)
    Double sumTotalRevenue();

    @Query(value = "SELECT AVG(PrixVente) FROM histovente WHERE TypeVente = 'VENTE' AND PrixVente > 0",
            nativeQuery = true)
    Double avgSaleValue();

    // ===== MONTHLY SALES =====
    @Query(value = "SELECT CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) as month, " +
            "COUNT(*) as totalSales, SUM(Total) as totalRevenue " +
            "FROM histovente " +
            "WHERE TypeVente = 'VENTE' AND YEAR(Date) = 2024 " +
            "GROUP BY YEAR(Date), MONTH(Date) " +
            "ORDER BY YEAR(Date), MONTH(Date)",
            nativeQuery = true)
    List<Object[]> getMonthlySalesNative();

    // ===== TOP STORES =====
    @Query(value = "SELECT CodeMag as storeName, COUNT(*) as totalSales, SUM(Total) as totalRevenue " +
            "FROM histovente " +
            "WHERE TypeVente = 'VENTE' " +
            "GROUP BY CodeMag " +
            "ORDER BY totalSales DESC " +
            "LIMIT 10",
            nativeQuery = true)
    List<Object[]> getTopStoresNative();

    // ===== SALES BY FAMILY =====
    @Query(value = "SELECT Famille as famille, COUNT(*) as totalSales " +
            "FROM histovente " +
            "WHERE TypeVente = 'VENTE' AND Famille IS NOT NULL AND Famille != '' " +
            "GROUP BY Famille " +
            "ORDER BY totalSales DESC " +
            "LIMIT 6",
            nativeQuery = true)
    List<Object[]> getSalesByFamilyNative();

    // ===== DATA QUALITY =====
    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Couleur IS NULL OR Couleur = ''",
            nativeQuery = true)
    Long countMissingCouleur();

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Famille IS NULL OR Famille = ''",
            nativeQuery = true)
    Long countMissingFamille();

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Quantite > 100 OR PrixVente = 0",
            nativeQuery = true)
    Long countOutliers();

    // ===== STORE KPIs =====
    @Query(value = "SELECT COUNT(*) FROM histovente WHERE IDMagasin = :storeId AND TypeVente = 'VENTE'",
            nativeQuery = true)
    Long countByMagasin(Long storeId);

    @Query(value = "SELECT SUM(Total) FROM histovente WHERE IDMagasin = :storeId AND TypeVente = 'VENTE'",
            nativeQuery = true)
    Double sumRevenueByMagasin(Long storeId);

    @Query(value = "SELECT AVG(PrixVente) FROM histovente WHERE IDMagasin = :storeId AND TypeVente = 'VENTE' AND PrixVente > 0",
            nativeQuery = true)
    Double avgSaleByMagasin(Long storeId);
}

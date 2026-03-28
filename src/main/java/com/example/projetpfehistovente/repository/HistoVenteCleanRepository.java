package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.HistoVenteClean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoVenteCleanRepository extends JpaRepository<HistoVenteClean, Long> {

    // ===== GLOBAL KPIs =====
    @Query(value = "SELECT COUNT(*) FROM histovente_clean_v1 WHERE TypeVente = 'VENTE'",
            nativeQuery = true)
    Long countTotalTransactions();

    @Query(value = "SELECT SUM(Total) FROM histovente_clean_v1 WHERE TypeVente = 'VENTE'",
            nativeQuery = true)
    Double sumTotalRevenue();

    @Query(value = "SELECT AVG(PrixVente) FROM histovente_clean_v1 WHERE TypeVente = 'VENTE' AND PrixVente > 0",
            nativeQuery = true)
    Double avgSaleValue();

    // ===== MONTHLY SALES (GLOBAL) =====
    @Query(value = "SELECT CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) as month, " +
            "COUNT(*) as totalSales, SUM(Total) as totalRevenue " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' AND YEAR(Date) = 2024 " +
            "GROUP BY YEAR(Date), MONTH(Date) " +
            "ORDER BY YEAR(Date), MONTH(Date)",
            nativeQuery = true)
    List<Object[]> getMonthlySalesNative();

    // ===== TOP STORES =====
    @Query(value = "SELECT CodeMag as storeName, COUNT(*) as totalSales, SUM(Total) as totalRevenue " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' " +
            "GROUP BY CodeMag " +
            "ORDER BY totalSales DESC " +
            "LIMIT 10",
            nativeQuery = true)
    List<Object[]> getTopStoresNative();

    // ===== SALES BY FAMILY (GLOBAL) =====
    @Query(value = "SELECT Famille as famille, COUNT(*) as totalSales " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' AND Famille IS NOT NULL AND Famille != '' " +
            "GROUP BY Famille " +
            "ORDER BY totalSales DESC " +
            "LIMIT 6",
            nativeQuery = true)
    List<Object[]> getSalesByFamilyNative();

    // ===== STORE KPIs =====
    @Query(value = "SELECT COUNT(*) FROM histovente_clean_v1 WHERE IDMagasin = :storeId AND TypeVente = 'VENTE'",
            nativeQuery = true)
    Long countByMagasin(@Param("storeId") Long storeId);

    @Query(value = "SELECT SUM(Total) FROM histovente_clean_v1 WHERE IDMagasin = :storeId AND TypeVente = 'VENTE'",
            nativeQuery = true)
    Double sumRevenueByMagasin(@Param("storeId") Long storeId);

    @Query(value = "SELECT AVG(PrixVente) FROM histovente_clean_v1 WHERE IDMagasin = :storeId AND TypeVente = 'VENTE' AND PrixVente > 0",
            nativeQuery = true)
    Double avgSaleByMagasin(@Param("storeId") Long storeId);

    @Query(value = "SELECT CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) as month, " +
            "COUNT(*) as totalSales, SUM(Total) as totalRevenue " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' AND IDMagasin = :storeId AND YEAR(Date) = 2024 " +
            "GROUP BY YEAR(Date), MONTH(Date), CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) " +
            "ORDER BY YEAR(Date), MONTH(Date)",
            nativeQuery = true)
    List<Object[]> getMonthlySalesByStoreNative(@Param("storeId") Long storeId);

    // ===== SALES BY FAMILY BY STORE =====
    @Query(value = "SELECT Famille as famille, COUNT(*) as totalSales " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' AND IDMagasin = :storeId " +
            "AND Famille IS NOT NULL AND Famille != '' " +
            "GROUP BY Famille " +
            "ORDER BY totalSales DESC " +
            "LIMIT 6",
            nativeQuery = true)
    List<Object[]> getSalesByFamilyByStoreNative(@Param("storeId") Long storeId);
}
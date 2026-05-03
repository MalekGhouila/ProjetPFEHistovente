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
            "GROUP BY YEAR(Date), MONTH(Date), CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) " +
            "ORDER BY YEAR(Date), MONTH(Date)",
            nativeQuery = true)
    List<Object[]> getMonthlySalesNative();

    // ===== TOP STORES =====
    @Query(value = "SELECT h.CodeMag as storeCode, COALESCE(m.Magasin, h.CodeMag) as storeName, " +
            "COUNT(*) as totalSales, SUM(h.Total) as totalRevenue " +
            "FROM histovente_clean_v1 h " +
            "LEFT JOIN magasin m ON m.Code = h.CodeMag " +
            "WHERE h.TypeVente = 'VENTE' " +
            "GROUP BY h.CodeMag, m.Magasin " +
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

    // ===== FILTERED QUERIES =====
    @Query(value = "SELECT COUNT(*) FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' " +
            "AND (:famille IS NULL OR Famille = :famille) " +
            "AND (:saison IS NULL OR Saison = :saison) " +
            "AND (:codeMag IS NULL OR CodeMag = :codeMag)",
            nativeQuery = true)
    Long countFiltered(@Param("famille") String famille,
                       @Param("saison") String saison,
                       @Param("codeMag") String codeMag);

    @Query(value = "SELECT SUM(Total) FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' " +
            "AND (:famille IS NULL OR Famille = :famille) " +
            "AND (:saison IS NULL OR Saison = :saison) " +
            "AND (:codeMag IS NULL OR CodeMag = :codeMag)",
            nativeQuery = true)
    Double sumFiltered(@Param("famille") String famille,
                       @Param("saison") String saison,
                       @Param("codeMag") String codeMag);

    @Query(value = "SELECT Famille, COUNT(*) as sales " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' " +
            "AND (:famille IS NULL OR Famille = :famille) " +
            "AND (:saison IS NULL OR Saison = :saison) " +
            "AND (:codeMag IS NULL OR CodeMag = :codeMag) " +
            "GROUP BY Famille ORDER BY sales DESC LIMIT 6",
            nativeQuery = true)
    List<Object[]> getSalesByFamilyFiltered(@Param("famille") String famille,
                                            @Param("saison") String saison,
                                            @Param("codeMag") String codeMag);

    @Query(value = "SELECT CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) as month, " +
            "COUNT(*) as totalSales, SUM(Total) as totalRevenue " +
            "FROM histovente_clean_v1 " +
            "WHERE TypeVente = 'VENTE' AND YEAR(Date) = 2024 " +
            "AND (:famille IS NULL OR Famille = :famille) " +
            "AND (:saison IS NULL OR Saison = :saison) " +
            "AND (:codeMag IS NULL OR CodeMag = :codeMag) " +
            "GROUP BY YEAR(Date), MONTH(Date), CONCAT(YEAR(Date), '-', LPAD(MONTH(Date), 2, '0')) " +
            "ORDER BY YEAR(Date), MONTH(Date)",
            nativeQuery = true)
    List<Object[]> getMonthlySalesFiltered(@Param("famille") String famille,
                                           @Param("saison") String saison,
                                           @Param("codeMag") String codeMag);

    // ===== STOCK FORECAST =====
    @Query(value = "SELECT CodeArticle, MAX(Designation) as Designation, MAX(Famille) as Famille, " +
            "ROUND(SUM(CASE WHEN Date >= DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 30 DAY) THEN Quantite ELSE 0 END)/30.0,2) as avgDailySales, " +
            "ROUND(SUM(CASE WHEN Date BETWEEN DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 60 DAY) AND DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 30 DAY) THEN Quantite ELSE 0 END)/30.0,2) as avgDailySalesPrev, " +
            "MAX(Date) as lastSaleDate " +
            "FROM histovente_clean_v1 " +
            "WHERE IDMagasin = :storeId " +
            "AND Date >= DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 60 DAY) " +
            "AND Quantite > 0 AND TypeVente NOT IN ('RETOUR','AVOIR') " +
            "GROUP BY CodeArticle HAVING avgDailySales > 0 " +
            "ORDER BY avgDailySales DESC LIMIT 50",
            nativeQuery = true)
    List<Object[]> getStockForecast(@Param("storeId") Long storeId);

    // ===== AT RISK =====
    @Query(value = "SELECT CodeArticle, MAX(Designation) as Designation, MAX(Famille) as Famille, " +
            "SUM(CASE WHEN Date >= DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 4 WEEK) THEN Quantite ELSE 0 END) as recentSales, " +
            "SUM(CASE WHEN Date BETWEEN DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 8 WEEK) AND DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 4 WEEK) THEN Quantite ELSE 0 END) as previousSales " +
            "FROM histovente_clean_v1 " +
            "WHERE IDMagasin = :storeId " +
            "AND Date >= DATE_SUB((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), INTERVAL 8 WEEK) " +
            "AND Quantite > 0 AND TypeVente NOT IN ('RETOUR','AVOIR') " +
            "GROUP BY CodeArticle HAVING previousSales > 5 AND recentSales < previousSales * 0.6 " +
            "ORDER BY (recentSales - previousSales) / previousSales ASC LIMIT 50",
            nativeQuery = true)
    List<Object[]> getAtRisk(@Param("storeId") Long storeId);

    // ===== DORMANT =====
    @Query(value = "SELECT CodeArticle, MAX(Designation) as Designation, MAX(Famille) as Famille, " +
            "MAX(Date) as lastSaleDate, " +
            "DATEDIFF((SELECT MAX(Date) FROM histovente_clean_v1 WHERE IDMagasin = :storeId), MAX(Date)) as daysDormant, " +
            "SUM(Quantite) as totalSold " +
            "FROM histovente_clean_v1 " +
            "WHERE IDMagasin = :storeId " +
            "AND Quantite > 0 AND TypeVente NOT IN ('RETOUR','AVOIR') " +
            "GROUP BY CodeArticle HAVING daysDormant >= 90 " +
            "ORDER BY daysDormant DESC LIMIT 50",
            nativeQuery = true)
    List<Object[]> getDormant(@Param("storeId") Long storeId);

    // ===== DATA QUALITY =====
    @Query(value = "SELECT COUNT(*) FROM histovente_clean_v1",
            nativeQuery = true)
    Long countTotalRawRecords();

    @Query(value = "SELECT COUNT(*) FROM histovente_clean_v1 WHERE Quantite <= 0 OR Prix <= 0",
            nativeQuery = true)
    Long countOutliers();

    @Query(value = """
            SELECT
              SUM(CASE WHEN IDArCouleur IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
              SUM(CASE WHEN IDVille IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
              SUM(CASE WHEN IDRegion IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
              SUM(CASE WHEN Saison IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
              SUM(CASE WHEN CodeArticle IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
              SUM(CASE WHEN Famille IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
              COUNT(*),
              SUM(CASE WHEN IDArCouleur IS NULL OR IDVille IS NULL OR IDRegion IS NULL
                       OR Saison IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
            FROM histovente_clean_v1
            """, nativeQuery = true)
    List<Object[]> getMissingValuesStats();

    @Query(value = """
            SELECT MONTH(Date) as month, COUNT(*) as recordCount
            FROM histovente_clean_v1
            WHERE YEAR(Date) = 2024
            GROUP BY MONTH(Date)
            ORDER BY MONTH(Date)
            """, nativeQuery = true)
    List<Object[]> getRecordsPerMonth2024();
}
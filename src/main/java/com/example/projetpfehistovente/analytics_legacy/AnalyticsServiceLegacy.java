package com.example.projetpfehistovente.analytics_legacy;

import com.example.projetpfehistovente.dto.*;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.example.projetpfehistovente.repository.MagasinRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ========================================
 * LEGACY Analytics Service
 * ========================================
 * STATUS: NOT IN USE - Kept for reference
 * REPLACED BY: analytics.AnalyticsService
 * DATE: March 24, 2026
 *
 * REASON FOR REPLACEMENT:
 * Direct queries on histovente_clean_v1 (11.8M records)
 * were too slow for real-time API calls:
 *
 * Performance test results (March 24, 2026):
 * - Monthly sales query : 1m 20s ❌
 * - Top stores query    : 2m 51s ❌
 * - Sales by family     : 2m 43s ❌
 * - Total revenue SUM   : 1m 44s ❌
 * - Data quality query  : 43s    ❌
 * - Yearly completeness : 47s    ❌
 *
 * SOLUTION:
 * Pre-computed analytics_summary table
 * All queries now return in < 100ms ✅
 * ========================================
 */
public class AnalyticsServiceLegacy {

    // NOTE: No @Autowired - this class is not managed by Spring
    private HistoVenteCleanRepository histoVenteCleanRepository;
    private MagasinRepository magasinRepository;

    public Long getTestCount() {
        return histoVenteCleanRepository.count();
    }

    public KpiResponse getGlobalKpis() {
        Long totalTransactions = histoVenteCleanRepository.countTotalTransactions();
        Double totalRevenue = histoVenteCleanRepository.sumTotalRevenue();
        Double avgSaleValue = histoVenteCleanRepository.avgSaleValue();
        Long totalStores = magasinRepository.count();

        return new KpiResponse(
                totalTransactions,
                totalRevenue != null ? totalRevenue : 0.0,
                avgSaleValue != null ? avgSaleValue : 0.0,
                totalStores
        );
    }

    public List<MonthlySalesResponse> getMonthlySales() {
        List<Object[]> results = histoVenteCleanRepository.getMonthlySalesNative();
        return results.stream().map(row -> new MonthlySalesResponse(
                (String) row[0],
                ((Number) row[1]).longValue(),
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }
/*
    public List<TopStoreResponse> getTopStores() {
        List<Object[]> results = histoVenteCleanRepository.getTopStoresNative();
        return results.stream().map(row -> new TopStoreResponse(
                (String) row[0],
                ((Number) row[1]).longValue(),
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }   */

    public List<FamilySalesResponse> getSalesByFamily() {
        List<Object[]> results = histoVenteCleanRepository.getSalesByFamilyNative();
        long total = results.stream()
                .mapToLong(r -> ((Number) r[1]).longValue())
                .sum();
        return results.stream().map(row -> {
            long sales = ((Number) row[1]).longValue();
            double percentage = total > 0 ? (sales * 100.0) / total : 0.0;
            return new FamilySalesResponse(
                    (String) row[0],
                    sales,
                    percentage
            );
        }).collect(Collectors.toList());
    }

    public DataQualityResponse getDataQuality() {
        Long totalRecords = histoVenteCleanRepository.countTotalTransactions();
        Long outliersCount = 0L;
        Double missingPercentage = 26.0;
        Double qualityScore = 74.0;

        return new DataQualityResponse(
                totalRecords,
                qualityScore,
                missingPercentage,
                outliersCount
        );
    }

    public KpiResponse getStoreKpis(Long storeId) {
        Long totalTransactions = histoVenteCleanRepository.countByMagasin(storeId);
        Double totalRevenue = histoVenteCleanRepository.sumRevenueByMagasin(storeId);
        Double avgSaleValue = histoVenteCleanRepository.avgSaleByMagasin(storeId);

        return new KpiResponse(
                totalTransactions,
                totalRevenue != null ? totalRevenue : 0.0,
                avgSaleValue != null ? avgSaleValue : 0.0,
                1L
        );
    }
}

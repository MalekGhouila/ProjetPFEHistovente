package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.*;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.example.projetpfehistovente.repository.MagasinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private HistoVenteCleanRepository histoVenteCleanRepository;

    @Autowired
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

    public List<TopStoreResponse> getTopStores() {
        List<Object[]> results = histoVenteCleanRepository.getTopStoresNative();
        return results.stream().map(row -> new TopStoreResponse(
                (String) row[0],
                ((Number) row[1]).longValue(),
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }

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

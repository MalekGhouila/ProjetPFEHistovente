package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.*;
import com.example.projetpfehistovente.repository.HistoVenteRepository;
import com.example.projetpfehistovente.repository.MagasinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private HistoVenteRepository histoVenteRepository;

    @Autowired
    private MagasinRepository magasinRepository;

    public Long getTestCount() {
        return histoVenteRepository.count();
    }

    public KpiResponse getGlobalKpis() {
        Long totalTransactions = histoVenteRepository.countTotalTransactions();
        Double totalRevenue = histoVenteRepository.sumTotalRevenue();
        Double avgSaleValue = histoVenteRepository.avgSaleValue();
        Long totalStores = magasinRepository.count();

        return new KpiResponse(
                totalTransactions,
                totalRevenue != null ? totalRevenue : 0.0,
                avgSaleValue != null ? avgSaleValue : 0.0,
                totalStores
        );
    }

    public List<MonthlySalesResponse> getMonthlySales() {
        List<Object[]> results = histoVenteRepository.getMonthlySalesNative();
        return results.stream().map(row -> new MonthlySalesResponse(
                (String) row[0],
                ((Number) row[1]).longValue(),
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }

    public List<TopStoreResponse> getTopStores() {
        List<Object[]> results = histoVenteRepository.getTopStoresNative();
        return results.stream().map(row -> new TopStoreResponse(
                (String) row[0],
                ((Number) row[1]).longValue(),
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO
        )).collect(Collectors.toList());
    }

    public List<FamilySalesResponse> getSalesByFamily() {
        List<Object[]> results = histoVenteRepository.getSalesByFamilyNative();
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
        Long totalRecords = histoVenteRepository.countTotalTransactions();
        Long missingCouleur = histoVenteRepository.countMissingCouleur();
        Long missingFamille = histoVenteRepository.countMissingFamille();
        Long totalMissing = missingCouleur + missingFamille;
        Double missingPercentage = (totalMissing * 100.0) / totalRecords;
        Double qualityScore = 100.0 - missingPercentage;
        Long outliersCount = histoVenteRepository.countOutliers();

        return new DataQualityResponse(
                totalRecords,
                qualityScore,
                missingPercentage,
                outliersCount
        );
    }

    public KpiResponse getStoreKpis(Long storeId) {
        Long totalTransactions = histoVenteRepository.countByMagasin(storeId);
        Double totalRevenue = histoVenteRepository.sumRevenueByMagasin(storeId);
        Double avgSaleValue = histoVenteRepository.avgSaleByMagasin(storeId);

        return new KpiResponse(
                totalTransactions,
                totalRevenue != null ? totalRevenue : 0.0,
                avgSaleValue != null ? avgSaleValue : 0.0,
                1L
        );
    }
    // In service:
    public Double testSum() {
        return histoVenteRepository.sumTotalRevenue();
    }

}

package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.entity.StoreAnalytics;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.example.projetpfehistovente.repository.StoreAnalyticsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StoreAnalyticsService {

    @Autowired
    private StoreAnalyticsRepository storeAnalyticsRepository;

    @Autowired
    private HistoVenteCleanRepository histoVenteCleanRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final java.util.Set<Long> calculatingStores =
            java.util.Collections.synchronizedSet(new java.util.HashSet<>());

    public static boolean isCalculating(Long storeId) {
        return calculatingStores.contains(storeId);
    }

    // ===== GET DATA =====
    public Double getValue(Long storeId, String metricName) {
        return storeAnalyticsRepository
                .findByIdMagasinAndMetricName(storeId, metricName)
                .map(StoreAnalytics::getMetricValue)
                .orElse(null);
    }

    public String getText(Long storeId, String metricName) {
        return storeAnalyticsRepository
                .findByIdMagasinAndMetricName(storeId, metricName)
                .map(StoreAnalytics::getMetricText)
                .orElse(null);
    }

    public LocalDateTime getLastUpdated(Long storeId) {
        return storeAnalyticsRepository
                .findByIdMagasin(storeId)
                .stream()
                .map(StoreAnalytics::getComputedAt)
                .findFirst()
                .orElse(null);
    }

    public boolean hasData(Long storeId) {
        return !storeAnalyticsRepository.findByIdMagasin(storeId).isEmpty();
    }

    // ===== CALCULATE AND SAVE =====
    @Transactional
    public void calculateStoreAnalytics(Long storeId) {
        calculatingStores.add(storeId); // ← MOVE HERE (start of method)
        try {
            // Delete old data for this store
            storeAnalyticsRepository.deleteByIdMagasin(storeId);

            // Calculate and save KPIs
            saveValue(storeId, "total_transactions",
                    histoVenteCleanRepository.countByMagasin(storeId).doubleValue());

            Double revenue = histoVenteCleanRepository.sumRevenueByMagasin(storeId);
            saveValue(storeId, "total_revenue",
                    revenue != null ? revenue : 0.0);

            Double avg = histoVenteCleanRepository.avgSaleByMagasin(storeId);
            saveValue(storeId, "avg_sale_value",
                    avg != null ? avg : 0.0);

            // Monthly sales
            List<Object[]> monthlySales = histoVenteCleanRepository
                    .getMonthlySalesByStoreNative(storeId);
            try {
                String json = objectMapper.writeValueAsString(
                        monthlySales.stream().map(row -> java.util.Map.of(
                                "month", row[0].toString(),
                                "totalSales", ((Number) row[1]).longValue(),
                                "totalRevenue", row[2] != null ? row[2].toString() : "0"
                        )).collect(java.util.stream.Collectors.toList())
                );
                saveText(storeId, "monthly_sales", json);
            } catch (Exception e) {
                e.printStackTrace();
            }

            // Sales by family
            List<Object[]> familySales = histoVenteCleanRepository
                    .getSalesByFamilyByStoreNative(storeId);
            try {
                long total = familySales.stream()
                        .mapToLong(r -> ((Number) r[1]).longValue()).sum();
                String json = objectMapper.writeValueAsString(
                        familySales.stream().map(row -> {
                            long sales = ((Number) row[1]).longValue();
                            return java.util.Map.of(
                                    "famille", row[0].toString(),
                                    "totalSales", sales,
                                    "percentage", total > 0 ? (sales * 100.0) / total : 0.0
                            );
                        }).collect(java.util.stream.Collectors.toList())
                );
                saveText(storeId, "sales_by_family", json);
            } catch (Exception e) {
                e.printStackTrace();
            }

        } finally {
            calculatingStores.remove(storeId); // ← ALWAYS runs at end
        }
    }

    // ===== HELPER METHODS =====
    private void saveValue(Long storeId, String metricName, Double value) {
        StoreAnalytics analytics = new StoreAnalytics();
        analytics.setIdMagasin(storeId);
        analytics.setMetricName(metricName);
        analytics.setMetricValue(value);
        analytics.setComputedAt(LocalDateTime.now());
        storeAnalyticsRepository.save(analytics);
    }

    private void saveText(Long storeId, String metricName, String text) {
        StoreAnalytics analytics = new StoreAnalytics();
        analytics.setIdMagasin(storeId);
        analytics.setMetricName(metricName);
        analytics.setMetricText(text);
        analytics.setComputedAt(LocalDateTime.now());
        storeAnalyticsRepository.save(analytics);
    }

}
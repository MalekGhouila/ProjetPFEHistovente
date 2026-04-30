package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.AtRiskDTO;
import com.example.projetpfehistovente.dto.DormantDTO;
import com.example.projetpfehistovente.dto.StockForecastDTO;
import com.example.projetpfehistovente.entity.StoreAnalytics;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.example.projetpfehistovente.repository.StoreAnalyticsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    // ===== STOCK FORECAST =====
    // Columns: [0]CodeArticle [1]Designation [2]Famille [3]avgDailySales [4]avgDailySalesPrev [5]lastSaleDate
    public List<StockForecastDTO> getStockForecast(Long storeId) {
        List<Object[]> rows = histoVenteCleanRepository.getStockForecast(storeId);
        return rows.stream().map(row -> {
            double avg     = toDouble(row[3]);
            double avgPrev = toDouble(row[4]);
            String status  = avg == 0       ? "critical"
                    : avg < avgPrev * 0.4 ? "critical"
                    : avg < avgPrev * 0.7 ? "warning"
                    : "good";
            return new StockForecastDTO(
                    str(row[0]),
                    str(row[1]),
                    str(row[2]),
                    avg,
                    avgPrev,
                    str(row[5]),
                    status
            );
        }).collect(Collectors.toList());
    }

    // ===== AT RISK =====
    // Columns: [0]CodeArticle [1]Designation [2]Famille [3]recentSales [4]previousSales
    public List<AtRiskDTO> getAtRisk(Long storeId) {
        List<Object[]> rows = histoVenteCleanRepository.getAtRisk(storeId);
        return rows.stream().map(row -> {
            long recent  = toLong(row[3]);
            long prev    = toLong(row[4]);
            double decline = prev > 0 ? ((double)(recent - prev) / prev) * 100 : 0;
            String risk  = decline <= -60 ? "high"
                    : decline <= -40 ? "medium"
                    : "low";
            return new AtRiskDTO(
                    str(row[0]),
                    str(row[1]),
                    str(row[2]),
                    recent,
                    prev,
                    Math.round(decline * 10.0) / 10.0,
                    risk
            );
        }).collect(Collectors.toList());
    }

    // ===== DORMANT =====
    // Columns: [0]CodeArticle [1]Designation [2]Famille [3]lastSaleDate [4]daysDormant [5]totalSold
    public List<DormantDTO> getDormant(Long storeId) {
        List<Object[]> rows = histoVenteCleanRepository.getDormant(storeId);
        return rows.stream().map(row -> {
            long days = toLong(row[4]);
            return new DormantDTO(
                    str(row[0]),
                    str(row[1]),
                    str(row[2]),
                    str(row[3]),
                    days,
                    toLong(row[5]),
                    days > 180 ? "remove" : "discount"
            );
        }).collect(Collectors.toList());
    }

    // ===== CALCULATE AND SAVE =====
    @Transactional
    public void calculateStoreAnalytics(Long storeId) {
        calculatingStores.add(storeId);
        try {
            storeAnalyticsRepository.deleteByIdMagasin(storeId);

            saveValue(storeId, "total_transactions",
                    histoVenteCleanRepository.countByMagasin(storeId).doubleValue());

            Double revenue = histoVenteCleanRepository.sumRevenueByMagasin(storeId);
            saveValue(storeId, "total_revenue", revenue != null ? revenue : 0.0);

            Double avg = histoVenteCleanRepository.avgSaleByMagasin(storeId);
            saveValue(storeId, "avg_sale_value", avg != null ? avg : 0.0);

            // Monthly sales
            List<Object[]> monthlySales = histoVenteCleanRepository
                    .getMonthlySalesByStoreNative(storeId);
            try {
                String json = objectMapper.writeValueAsString(
                        monthlySales.stream().map(row -> java.util.Map.of(
                                "month", row[0].toString(),
                                "totalSales", ((Number) row[1]).longValue(),
                                "totalRevenue", row[2] != null ? row[2].toString() : "0"
                        )).collect(Collectors.toList())
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
                        }).collect(Collectors.toList())
                );
                saveText(storeId, "sales_by_family", json);
            } catch (Exception e) {
                e.printStackTrace();
            }

        } finally {
            calculatingStores.remove(storeId);
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

    private String str(Object o)    { return o == null ? "" : o.toString(); }
    private double toDouble(Object o) { return o == null ? 0 : Double.parseDouble(o.toString()); }
    private long toLong(Object o)   { return o == null ? 0 : ((Number) o).longValue(); }
}
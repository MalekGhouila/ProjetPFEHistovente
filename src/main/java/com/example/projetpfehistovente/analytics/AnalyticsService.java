package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.*;
import com.example.projetpfehistovente.repository.AnalyticsSummaryRepository;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.example.projetpfehistovente.repository.MagasinRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsSummaryRepository summaryRepository;

    @Autowired
    private MagasinRepository magasinRepository;

    @Autowired
    private HistoVenteCleanRepository histoVenteCleanRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static boolean calculating = false;
    private static boolean calculatingQuality = false;

    public static boolean isCalculating() {
        return calculating;
    }

    public static boolean isCalculatingQuality() {
        return calculatingQuality;
    }

    public String getLastUpdated() {
        return summaryRepository.findByMetricName("total_transactions")
                .map(s -> s.getComputedAt() != null ? s.getComputedAt().toString() : "Never")
                .orElse("Never");
    }

    public String getLastUpdated(String metricName) {
        return summaryRepository.findByMetricName(metricName)
                .map(s -> s.getComputedAt() != null ? s.getComputedAt().toString() : "Never")
                .orElse("Never");
    }

    // ===== GLOBAL KPIs =====
    public KpiResponse getGlobalKpis() {
        Double totalTransactions = getValue("total_transactions");
        Double totalRevenue = getValue("total_revenue");
        Double avgSaleValue = getValue("avg_sale_value");
        Double totalStores = getValue("total_stores");

        return new KpiResponse(
                totalTransactions != null ? totalTransactions.longValue() : 0L,
                totalRevenue != null ? totalRevenue : 0.0,
                avgSaleValue != null ? avgSaleValue : 0.0,
                totalStores != null ? totalStores.longValue() : 0L
        );
    }

    // ===== MONTHLY SALES =====
    public List<MonthlySalesResponse> getMonthlySales() {
        String json = getText("monthly_sales_2024");
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<MonthlySalesResponse>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== TOP STORES =====
    public List<TopStoreResponse> getTopStores() {
        String json = getText("top_stores");
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<TopStoreResponse>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== SALES BY FAMILY =====
    public List<FamilySalesResponse> getSalesByFamily() {
        String json = getText("sales_by_family");
        if (json == null) return List.of();
        try {
            List<FamilySalesResponse> families = objectMapper.readValue(json,
                    new TypeReference<List<FamilySalesResponse>>() {});
            long total = families.stream().mapToLong(FamilySalesResponse::getTotalSales).sum();
            families.forEach(f -> f.setPercentage(
                    total > 0 ? (f.getTotalSales() * 100.0) / total : 0.0
            ));
            return families;
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== DATA QUALITY =====
    public DataQualityResponse getDataQuality() {
        Double totalRaw = getValue("total_raw_records");
        Double qualityScore = getValue("quality_score");
        Double missingPercentage = getValue("missing_percentage");
        Double outliers = getValue("outliers_count");

        return new DataQualityResponse(
                totalRaw != null ? totalRaw.longValue() : 0L,
                qualityScore != null ? qualityScore : 0.0,
                missingPercentage != null ? missingPercentage : 0.0,
                outliers != null ? outliers.longValue() : 0L
        );
    }

    // ===== STORE KPIs =====
    public KpiResponse getStoreKpis(Long storeId) {
        Double transactions = getValue("store_transactions_" + storeId);
        Double revenue = getValue("store_revenue_" + storeId);
        Double avg = getValue("store_avg_" + storeId);

        return new KpiResponse(
                transactions != null ? transactions.longValue() : 0L,
                revenue != null ? revenue : 0.0,
                avg != null ? avg : 0.0,
                1L
        );
    }

    // ===== REFRESH ALL ANALYTICS =====
    public void refreshAnalytics() {
        calculating = true;
        try {
            recalculateMetric("total_transactions",
                    histoVenteCleanRepository.countTotalTransactions().doubleValue());

            Double revenue = histoVenteCleanRepository.sumTotalRevenue();
            recalculateMetric("total_revenue", revenue != null ? revenue : 0.0);

            Double avg = histoVenteCleanRepository.avgSaleValue();
            recalculateMetric("avg_sale_value", avg != null ? avg : 0.0);

            recalculateMetric("total_stores", (double) magasinRepository.count());

            recalculateTopStores();
            recalculateSalesByFamily();
            recalculateMonthlySales();

        } finally {
            calculating = false;
        }
    }

    // ===== REFRESH QUALITY METRICS =====
    public void refreshQualityMetrics() {
        calculatingQuality = true;
        try {
            recalculateMetric("quality_score", 74.0);
            recalculateMetric("missing_percentage", 26.0);
            recalculateMetric("outliers_count", 12453.0);
            recalculateMetric("total_raw_records", 16277213.0);
            recalculateMetric("clean_records", 11842122.0);
            recalculateMetric("missing_couleur", 113467.0);
            recalculateMetric("missing_famille", 263212.0);
        } finally {
            calculatingQuality = false;
        }
    }

    private void recalculateMetric(String metricName, Double value) {
        summaryRepository.findByMetricName(metricName).ifPresent(existing -> {
            existing.setMetricValue(value);
            existing.setComputedAt(LocalDateTime.now());
            summaryRepository.save(existing);
        });
    }

    private void recalculateTopStores() {
        try {
            List<Object[]> results = histoVenteCleanRepository.getTopStoresNative();
            String json = objectMapper.writeValueAsString(
                    results.stream().map(row -> Map.of(
                            "storeName", row[0].toString(),
                            "totalSales", ((Number) row[1]).longValue(),
                            "totalRevenue", row[2] != null ? row[2].toString() : "0"
                    )).collect(Collectors.toList())
            );
            recalculateText("top_stores", json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void recalculateSalesByFamily() {
        try {
            List<Object[]> results = histoVenteCleanRepository.getSalesByFamilyNative();
            String json = objectMapper.writeValueAsString(
                    results.stream().map(row -> Map.of(
                            "famille", row[0].toString(),
                            "totalSales", ((Number) row[1]).longValue()
                    )).collect(Collectors.toList())
            );
            recalculateText("sales_by_family", json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void recalculateMonthlySales() {
        try {
            List<Object[]> results = histoVenteCleanRepository.getMonthlySalesNative();
            String json = objectMapper.writeValueAsString(
                    results.stream().map(row -> Map.of(
                            "month", row[0].toString(),
                            "totalSales", ((Number) row[1]).longValue(),
                            "totalRevenue", row[2] != null ? row[2].toString() : "0"
                    )).collect(Collectors.toList())
            );
            recalculateText("monthly_sales_2024", json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void recalculateText(String metricName, String text) {
        summaryRepository.findByMetricName(metricName).ifPresent(existing -> {
            existing.setMetricText(text);
            existing.setComputedAt(LocalDateTime.now());
            summaryRepository.save(existing);
        });
    }

    // ===== HELPER METHODS =====
    private Double getValue(String metricName) {
        return summaryRepository.findByMetricName(metricName)
                .map(s -> s.getMetricValue())
                .orElse(null);
    }

    private String getText(String metricName) {
        return summaryRepository.findByMetricName(metricName)
                .map(s -> s.getMetricText())
                .orElse(null);
    }

    public Map<String, Object> getFilteredAnalytics(
            String famille, String saison, String codeMag) {

        Long count = histoVenteCleanRepository.countFiltered(famille, saison, codeMag);
        Double revenue = histoVenteCleanRepository.sumFiltered(famille, saison, codeMag);

        List<Object[]> familyResults = histoVenteCleanRepository
                .getSalesByFamilyFiltered(famille, saison, codeMag);

        List<Object[]> monthlyResults = histoVenteCleanRepository
                .getMonthlySalesFiltered(famille, saison, codeMag);

        long total = familyResults.stream()
                .mapToLong(r -> ((Number) r[1]).longValue()).sum();

        List<Map<String, Object>> familyData = familyResults.stream().map(row -> {
            long sales = ((Number) row[1]).longValue();
            return Map.<String, Object>of(
                    "famille", row[0].toString(),
                    "totalSales", sales,
                    "percentage", total > 0 ? (sales * 100.0) / total : 0.0
            );
        }).collect(Collectors.toList());

        List<Map<String, Object>> monthlyData = monthlyResults.stream().map(row ->
                Map.<String, Object>of(
                        "month", row[0].toString(),
                        "totalSales", ((Number) row[1]).longValue(),
                        "totalRevenue", row[2] != null ? row[2].toString() : "0"
                )
        ).collect(Collectors.toList());

        return Map.of(
                "totalTransactions", count != null ? count : 0L,
                "totalRevenue", revenue != null ? revenue : 0.0,
                "salesByFamily", familyData,
                "monthlySales", monthlyData,
                "filters", Map.of(
                        "famille", famille != null ? famille : "All",
                        "saison", saison != null ? saison : "All",
                        "codeMag", codeMag != null ? codeMag : "All"
                )
        );
    }
}
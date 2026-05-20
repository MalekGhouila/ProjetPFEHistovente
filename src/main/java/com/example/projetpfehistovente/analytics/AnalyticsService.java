package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.*;
import com.example.projetpfehistovente.entity.AnalyticsSummary;
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

    // ===== MISSING VALUES BY COLUMN =====
    public Map<String, Double> getMissingValuesByColumn() {
        Double couleur = getValue("missing_couleur");
        Double ville   = getValue("missing_ville");
        Double region  = getValue("missing_region");
        Double saison  = getValue("missing_saison");
        Double article = getValue("missing_article");
        Double famille = getValue("missing_famille");

        return Map.of(
                "IDArCouleur", couleur  != null ? couleur  : 0.0,
                "IDVille",     ville    != null ? ville    : 0.0,
                "IDRegion",    region   != null ? region   : 0.0,
                "Saison",      saison   != null ? saison   : 0.0,
                "CodeArticle", article  != null ? article  : 0.0,
                "Famille",     famille  != null ? famille  : 0.0
        );
    }

    // ===== RECORDS PER MONTH =====
    // Returns cached JSON for the requested year (defaults to most recent available)
    public List<Map<String, Object>> getRecordsPerMonth(Integer year) {
        String key;
        if (year != null) {
            key = "records_per_month_" + year;
        } else {
            // Fall back to the most recent cached year
            List<Integer> years = histoVenteCleanRepository.getDistinctYears();
            if (years.isEmpty()) return List.of();
            key = "records_per_month_" + years.get(0);
        }
        String json = getText(key);
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== AVAILABLE YEARS =====
    public List<Integer> getAvailableYears() {
        return histoVenteCleanRepository.getDistinctYears();
    }

    // ===== RECORDS PER YEAR (data completeness by year) =====
    public List<Map<String, Object>> getRecordsPerYear() {
        String json = getText("records_per_year");
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return List.of();
        }
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
            Long total = histoVenteCleanRepository.countTotalRawRecords();
            recalculateMetric("total_raw_records", total != null ? total.doubleValue() : 0.0);

            Long outliers = histoVenteCleanRepository.countOutliers();
            recalculateMetric("outliers_count", outliers != null ? outliers.doubleValue() : 0.0);

            List<Object[]> statsList = histoVenteCleanRepository.getMissingValuesStats();
            if (statsList != null && !statsList.isEmpty()) {
                Object[] stats = statsList.get(0);

                double missingCouleur = stats[0] != null ? ((Number) stats[0]).doubleValue() : 0.0;
                double missingVille   = stats[1] != null ? ((Number) stats[1]).doubleValue() : 0.0;
                double missingRegion  = stats[2] != null ? ((Number) stats[2]).doubleValue() : 0.0;
                double missingSaison  = stats[3] != null ? ((Number) stats[3]).doubleValue() : 0.0;
                double missingArticle = stats[4] != null ? ((Number) stats[4]).doubleValue() : 0.0;
                double missingFamille = stats[5] != null ? ((Number) stats[5]).doubleValue() : 0.0;
                double overallMissing = stats[7] != null ? ((Number) stats[7]).doubleValue() : 0.0;

                recalculateMetric("missing_couleur",    missingCouleur);
                recalculateMetric("missing_ville",      missingVille);
                recalculateMetric("missing_region",     missingRegion);
                recalculateMetric("missing_saison",     missingSaison);
                recalculateMetric("missing_article",    missingArticle);
                recalculateMetric("missing_famille",    missingFamille);
                recalculateMetric("missing_percentage", overallMissing);
                recalculateMetric("quality_score",      100.0 - overallMissing);
            }

            recalculateRecordsPerMonth();  // now stores one entry per year
            recalculateRecordsPerYear();

        } finally {
            calculatingQuality = false;
        }
    }

    // ===== RECALCULATE RECORDS PER MONTH (all years) =====
    private void recalculateRecordsPerMonth() {
        try {
            List<Integer> years = histoVenteCleanRepository.getDistinctYears();
            String[] monthNames = {"Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"};
            for (int year : years) {
                List<Object[]> results = histoVenteCleanRepository.getRecordsPerMonthByYear(year);
                String json = objectMapper.writeValueAsString(
                        results.stream().map(row -> Map.of(
                                "month",       monthNames[((Number) row[0]).intValue() - 1],
                                "year",        year,
                                "recordCount", ((Number) row[1]).longValue()
                        )).collect(Collectors.toList())
                );
                recalculateText("records_per_month_" + year, json);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ===== RECALCULATE RECORDS PER YEAR =====
    private void recalculateRecordsPerYear() {
        try {
            List<Object[]> results = histoVenteCleanRepository.getDistributionByYear();
            String json = objectMapper.writeValueAsString(
                    results.stream().map(row -> Map.of(
                            "year",        ((Number) row[0]).intValue(),
                            "recordCount", ((Number) row[1]).longValue(),
                            "percentage",  row[2] != null ? ((Number) row[2]).doubleValue() : 0.0
                    )).collect(Collectors.toList())
            );
            recalculateText("records_per_year", json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void recalculateMetric(String metricName, Double value) {
        var existing = summaryRepository.findByMetricName(metricName);
        if (existing.isPresent()) {
            existing.get().setMetricValue(value);
            existing.get().setComputedAt(LocalDateTime.now());
            summaryRepository.save(existing.get());
        } else {
            AnalyticsSummary newRow = new AnalyticsSummary();
            newRow.setMetricName(metricName);
            newRow.setMetricValue(value);
            newRow.setComputedAt(LocalDateTime.now());
            summaryRepository.save(newRow);
        }
    }

    private void recalculateTopStores() {
        try {
            List<Object[]> results = histoVenteCleanRepository.getTopStoresNative();
            String json = objectMapper.writeValueAsString(
                    results.stream().map(row -> Map.of(
                            "storeCode",    row[0].toString(),
                            "storeName",    row[1].toString(),
                            "totalSales",   ((Number) row[2]).longValue(),
                            "totalRevenue", row[3] != null ? row[3].toString() : "0"
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
                            "famille",    row[0].toString(),
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
                            "month",        row[0].toString(),
                            "totalSales",   ((Number) row[1]).longValue(),
                            "totalRevenue", row[2] != null ? row[2].toString() : "0"
                    )).collect(Collectors.toList())
            );
            recalculateText("monthly_sales_2024", json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void recalculateText(String metricName, String text) {
        var existing = summaryRepository.findByMetricName(metricName);
        if (existing.isPresent()) {
            existing.get().setMetricText(text);
            existing.get().setComputedAt(LocalDateTime.now());
            summaryRepository.save(existing.get());
        } else {
            AnalyticsSummary newRow = new AnalyticsSummary();
            newRow.setMetricName(metricName);
            newRow.setMetricText(text);
            newRow.setComputedAt(LocalDateTime.now());
            summaryRepository.save(newRow);
        }
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
                    "famille",    row[0].toString(),
                    "totalSales", sales,
                    "percentage", total > 0 ? (sales * 100.0) / total : 0.0
            );
        }).collect(Collectors.toList());

        List<Map<String, Object>> monthlyData = monthlyResults.stream().map(row ->
                Map.<String, Object>of(
                        "month",        row[0].toString(),
                        "totalSales",   ((Number) row[1]).longValue(),
                        "totalRevenue", row[2] != null ? row[2].toString() : "0"
                )
        ).collect(Collectors.toList());

        return Map.of(
                "totalTransactions", count != null ? count : 0L,
                "totalRevenue",      revenue != null ? revenue : 0.0,
                "salesByFamily",     familyData,
                "monthlySales",      monthlyData,
                "filters", Map.of(
                        "famille",  famille  != null ? famille  : "All",
                        "saison",   saison   != null ? saison   : "All",
                        "codeMag",  codeMag  != null ? codeMag  : "All"
                )
        );
    }
}
package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.entity.AnalyticsFiltered;
import com.example.projetpfehistovente.repository.AnalyticsFilteredRepository;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FilteredAnalyticsService {

    @Autowired
    private AnalyticsFilteredRepository filteredRepository;

    @Autowired
    private HistoVenteCleanRepository histoVenteCleanRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final java.util.Set<String> calculatingKeys =
            java.util.Collections.synchronizedSet(new java.util.HashSet<>());

    // ===== Build filter key =====
    public String buildFilterKey(String famille, String saison, String codeMag) {
        return (famille != null ? famille : "ALL") + "_" +
                (saison != null ? saison : "ALL") + "_" +
                (codeMag != null ? codeMag : "ALL");
    }

    // ===== Check status =====
    public boolean isCalculating(String filterKey) {
        return calculatingKeys.contains(filterKey);
    }

    public boolean hasData(String filterKey) {
        return filteredRepository.existsByFilterKey(filterKey);
    }

    public LocalDateTime getLastUpdated(String filterKey) {
        return filteredRepository.findByFilterKey(filterKey)
                .stream()
                .map(AnalyticsFiltered::getComputedAt)
                .findFirst()
                .orElse(null);
    }

    // ===== Get data =====
    public Double getValue(String filterKey, String metricName) {
        return filteredRepository.findByFilterKeyAndMetricName(filterKey, metricName)
                .map(AnalyticsFiltered::getMetricValue)
                .orElse(null);
    }

    public String getText(String filterKey, String metricName) {
        return filteredRepository.findByFilterKeyAndMetricName(filterKey, metricName)
                .map(AnalyticsFiltered::getMetricText)
                .orElse(null);
    }

    // ===== Calculate =====
    @Transactional
    public void calculate(String famille, String saison, String codeMag) {
        String filterKey = buildFilterKey(famille, saison, codeMag);
        calculatingKeys.add(filterKey);

        try {
            // Delete old data
            filteredRepository.deleteByFilterKey(filterKey);

            // Calculate KPIs
            Long count = histoVenteCleanRepository.countFiltered(famille, saison, codeMag);
            saveValue(filterKey, famille, saison, codeMag, "total_transactions",
                    count != null ? count.doubleValue() : 0.0);

            Double revenue = histoVenteCleanRepository.sumFiltered(famille, saison, codeMag);
            saveValue(filterKey, famille, saison, codeMag, "total_revenue",
                    revenue != null ? revenue : 0.0);

            // Calculate monthly sales
            List<Object[]> monthlyResults = histoVenteCleanRepository
                    .getMonthlySalesFiltered(famille, saison, codeMag);
            try {
                String json = objectMapper.writeValueAsString(
                        monthlyResults.stream().map(row -> Map.of(
                                "month", row[0].toString(),
                                "totalSales", ((Number) row[1]).longValue(),
                                "totalRevenue", row[2] != null ? row[2].toString() : "0"
                        )).collect(Collectors.toList())
                );
                saveText(filterKey, famille, saison, codeMag, "monthly_sales", json);
            } catch (Exception e) {
                e.printStackTrace();
            }

            // Calculate family sales
            List<Object[]> familyResults = histoVenteCleanRepository
                    .getSalesByFamilyFiltered(famille, saison, codeMag);
            try {
                long total = familyResults.stream()
                        .mapToLong(r -> ((Number) r[1]).longValue()).sum();
                String json = objectMapper.writeValueAsString(
                        familyResults.stream().map(row -> {
                            long sales = ((Number) row[1]).longValue();
                            return Map.of(
                                    "famille", row[0].toString(),
                                    "totalSales", sales,
                                    "percentage", total > 0 ? (sales * 100.0) / total : 0.0
                            );
                        }).collect(Collectors.toList())
                );
                saveText(filterKey, famille, saison, codeMag, "sales_by_family", json);
            } catch (Exception e) {
                e.printStackTrace();
            }

        } finally {
            calculatingKeys.remove(filterKey);
        }
    }

    // ===== Helpers =====
    private void saveValue(String filterKey, String famille, String saison,
                           String codeMag, String metricName, Double value) {
        AnalyticsFiltered af = new AnalyticsFiltered();
        af.setFilterKey(filterKey);
        af.setFamille(famille);
        af.setSaison(saison);
        af.setCodeMag(codeMag);
        af.setMetricName(metricName);
        af.setMetricValue(value);
        af.setComputedAt(LocalDateTime.now());
        filteredRepository.save(af);
    }

    private void saveText(String filterKey, String famille, String saison,
                          String codeMag, String metricName, String text) {
        AnalyticsFiltered af = new AnalyticsFiltered();
        af.setFilterKey(filterKey);
        af.setFamille(famille);
        af.setSaison(saison);
        af.setCodeMag(codeMag);
        af.setMetricName(metricName);
        af.setMetricText(text);
        af.setComputedAt(LocalDateTime.now());
        filteredRepository.save(af);
    }
}
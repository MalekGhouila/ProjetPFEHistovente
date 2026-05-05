package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.DataQualityRawStatsDto;
import com.example.projetpfehistovente.entity.AnalyticsSummary;
import com.example.projetpfehistovente.repository.AnalyticsSummaryRepository;
import com.example.projetpfehistovente.repository.HistoVenteCleanRepository;
import com.example.projetpfehistovente.repository.HistoVenteRawRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DataQualityService {

    @Autowired
    private HistoVenteRawRepository histoVenteRawRepository;

    @Autowired
    private HistoVenteCleanRepository histoVenteCleanRepository;

    @Autowired
    private AnalyticsSummaryRepository summaryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static boolean calculating = false;

    public static boolean isCalculating() { return calculating; }

    // ===== GET (reads from cache — instant) =====
    public DataQualityRawStatsDto getRawStats() {
        long totalRecords   = getLong("dq_total_records");
        long cleanRecords   = getLong("dq_clean_records");
        long removedRecords = totalRecords - cleanRecords;
        double qualityScore = totalRecords > 0
                ? Math.round((cleanRecords * 100.0 / totalRecords) * 100.0) / 100.0
                : 0.0;

        Map<String, Long> filterStats = Map.of(
                "typeVente", getLong("dq_non_vente"),
                "dateNull",  getLong("dq_date_null"),
                "dateOld",   getLong("dq_date_old"),
                "prix",      getLong("dq_prix"),
                "quantite",  getLong("dq_quantite")
        );

        List<Map<String, Object>> distributionByYear   = readJson("dq_distribution_year");
        List<Map<String, Object>> typeVenteDistribution = readJson("dq_typevente_dist");

        List<Map<String, Object>> droppedColumns = List.of(
                Map.of("name", "Observation",        "reason", ">60% NULL",  "nullPct", 98.2),
                Map.of("name", "LigneTicket",         "reason", ">60% NULL",  "nullPct", 91.5),
                Map.of("name", "CodeSaison",          "reason", ">60% NULL",  "nullPct", 88.3),
                Map.of("name", "ArSaison",            "reason", ">60% NULL",  "nullPct", 88.3),
                Map.of("name", "DiscountPercentage",  "reason", ">60% NULL",  "nullPct", 85.7),
                Map.of("name", "DiscountAmount",      "reason", ">60% NULL",  "nullPct", 85.7),
                Map.of("name", "TotalHT",             "reason", ">60% NULL",  "nullPct", 82.1),
                Map.of("name", "ArCode",              "reason", ">60% NULL",  "nullPct", 79.4),
                Map.of("name", "Article",             "reason", ">60% NULL",  "nullPct", 79.4),
                Map.of("name", "VATAmount",           "reason", ">60% NULL",  "nullPct", 76.8),
                Map.of("name", "StoreCategory",       "reason", ">60% NULL",  "nullPct", 71.2),
                Map.of("name", "idArSaison",          "reason", ">60% NULL",  "nullPct", 68.9),
                Map.of("name", "isSynchronised",      "reason", "Technique",  "nullPct", 0.0),
                Map.of("name", "IDFactureDiva",       "reason", "Technique",  "nullPct", 0.0),
                Map.of("name", "isFacture",           "reason", "Technique",  "nullPct", 0.0),
                Map.of("name", "ligne",               "reason", "Technique",  "nullPct", 0.0),
                Map.of("name", "Defecttrt",           "reason", "100% zéros", "nullPct", 0.0),
                Map.of("name", "IDLigneTicketClient", "reason", "Technique",  "nullPct", 0.0)
        );

        return new DataQualityRawStatsDto(
                totalRecords, cleanRecords, removedRecords, qualityScore,
                filterStats, distributionByYear, typeVenteDistribution, droppedColumns
        );
    }

    // ===== REFRESH (runs heavy queries once, stores in analytics_summary) =====
    public void refreshDataQuality() {
        calculating = true;
        try {
            saveMetric("dq_total_records", 16_277_213.0);
            saveMetric("dq_clean_records", histoVenteCleanRepository.countTotalTransactions().doubleValue());
            saveMetric("dq_non_vente",     histoVenteRawRepository.countNonVente().doubleValue());
            saveMetric("dq_date_null",     histoVenteRawRepository.countDateNull().doubleValue());
            saveMetric("dq_date_old",      histoVenteRawRepository.countDateBefore2022().doubleValue());
            saveMetric("dq_prix",          histoVenteRawRepository.countPrixOutliers().doubleValue());
            saveMetric("dq_quantite",      histoVenteRawRepository.countQuantiteOutliers().doubleValue());

            // distribution by year → JSON
            List<Object[]> yearResults = histoVenteCleanRepository.getDistributionByYear();
            saveText("dq_distribution_year", objectMapper.writeValueAsString(
                    yearResults.stream().map(row -> Map.<String, Object>of(
                            "year",  ((Number) row[0]).intValue(),
                            "count", ((Number) row[1]).longValue(),
                            "pct",   row[2] != null ? ((Number) row[2]).doubleValue() : 0.0
                    )).collect(Collectors.toList())
            ));

            // typeVente distribution → JSON
            List<Object[]> typeResults = histoVenteRawRepository.getTypeVenteDistribution();
            saveText("dq_typevente_dist", objectMapper.writeValueAsString(
                    typeResults.stream().map(row -> Map.<String, Object>of(
                            "type",  row[0] != null ? row[0].toString() : "NULL",
                            "count", ((Number) row[1]).longValue()
                    )).collect(Collectors.toList())
            ));

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            calculating = false;
        }
    }

    // ===== LAST UPDATED =====
    public String getLastUpdated() {
        return summaryRepository.findByMetricName("dq_clean_records")
                .map(s -> s.getComputedAt() != null ? s.getComputedAt().toString() : "Never")
                .orElse("Never");
    }

    // ===== HELPERS =====
    private long getLong(String key) {
        return summaryRepository.findByMetricName(key)
                .map(s -> s.getMetricValue() != null ? s.getMetricValue().longValue() : 0L)
                .orElse(0L);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> readJson(String key) {
        return summaryRepository.findByMetricName(key)
                .map(s -> {
                    try {
                        return (List<Map<String, Object>>) objectMapper.readValue(
                                s.getMetricText(), new TypeReference<List<Map<String, Object>>>() {});
                    } catch (Exception e) {
                        return List.<Map<String, Object>>of();
                    }
                })
                .orElse(List.of());
    }

    private void saveMetric(String key, Double value) {
        var existing = summaryRepository.findByMetricName(key);
        if (existing.isPresent()) {
            existing.get().setMetricValue(value);
            existing.get().setComputedAt(LocalDateTime.now());
            summaryRepository.save(existing.get());
        } else {
            AnalyticsSummary s = new AnalyticsSummary();
            s.setMetricName(key);
            s.setMetricValue(value);
            s.setComputedAt(LocalDateTime.now());
            summaryRepository.save(s);
        }
    }

    private void saveText(String key, String text) {
        var existing = summaryRepository.findByMetricName(key);
        if (existing.isPresent()) {
            existing.get().setMetricText(text);
            existing.get().setComputedAt(LocalDateTime.now());
            summaryRepository.save(existing.get());
        } else {
            AnalyticsSummary s = new AnalyticsSummary();
            s.setMetricName(key);
            s.setMetricText(text);
            s.setComputedAt(LocalDateTime.now());
            summaryRepository.save(s);
        }
    }
}
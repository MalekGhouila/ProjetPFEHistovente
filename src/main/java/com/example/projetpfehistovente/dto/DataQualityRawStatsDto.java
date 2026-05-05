package com.example.projetpfehistovente.dto;

import java.util.List;
import java.util.Map;

public class DataQualityRawStatsDto {

    private long totalRecords;
    private long cleanRecords;
    private long removedRecords;
    private double qualityScore;
    private Map<String, Long> filterStats;
    private List<Map<String, Object>> distributionByYear;
    private List<Map<String, Object>> typeVenteDistribution;
    private List<Map<String, Object>> droppedColumns;

    public DataQualityRawStatsDto(long totalRecords, long cleanRecords, long removedRecords,
                                  double qualityScore, Map<String, Long> filterStats,
                                  List<Map<String, Object>> distributionByYear,
                                  List<Map<String, Object>> typeVenteDistribution,
                                  List<Map<String, Object>> droppedColumns) {
        this.totalRecords = totalRecords;
        this.cleanRecords = cleanRecords;
        this.removedRecords = removedRecords;
        this.qualityScore = qualityScore;
        this.filterStats = filterStats;
        this.distributionByYear = distributionByYear;
        this.typeVenteDistribution = typeVenteDistribution;
        this.droppedColumns = droppedColumns;
    }

    // Getters
    public long getTotalRecords() { return totalRecords; }
    public long getCleanRecords() { return cleanRecords; }
    public long getRemovedRecords() { return removedRecords; }
    public double getQualityScore() { return qualityScore; }
    public Map<String, Long> getFilterStats() { return filterStats; }
    public List<Map<String, Object>> getDistributionByYear() { return distributionByYear; }
    public List<Map<String, Object>> getTypeVenteDistribution() { return typeVenteDistribution; }
    public List<Map<String, Object>> getDroppedColumns() { return droppedColumns; }
}
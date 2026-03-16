package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DataQualityResponse {
    private Long totalRecords;
    private Double qualityScore;
    private Double missingValuesPercentage;
    private Long outliersCount;
}

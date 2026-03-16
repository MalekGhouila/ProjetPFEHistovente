package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KpiResponse {
    private Long totalTransactions;
    private Double totalRevenue;
    private Double avgSaleValue;
    private Long totalStores;
}

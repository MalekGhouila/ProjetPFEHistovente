package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlySalesResponse {
    private String month;
    private Long totalSales;
    private BigDecimal totalRevenue;
}

package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockForecastDTO {
    private String codeArticle;
    private String designation;
    private String famille;
    private double avgDailySales;
    private double avgDailySalesPrev;
    private String lastSaleDate;
    private String status;
}
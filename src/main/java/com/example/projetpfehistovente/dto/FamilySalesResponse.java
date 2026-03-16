package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FamilySalesResponse {
    private String famille;
    private Long totalSales;
    private Double percentage;
}

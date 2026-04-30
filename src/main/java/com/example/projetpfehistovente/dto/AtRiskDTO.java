package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtRiskDTO {
    private String codeArticle;
    private String designation;
    private String famille;
    private long recentSales;
    private long previousSales;
    private double declinePct;
    private String risk;
}
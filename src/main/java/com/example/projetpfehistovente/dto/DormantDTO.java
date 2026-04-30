package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DormantDTO {
    private String codeArticle;
    private String designation;
    private String famille;
    private String lastSaleDate;
    private long daysDormant;
    private long totalSold;
    private String action;
}
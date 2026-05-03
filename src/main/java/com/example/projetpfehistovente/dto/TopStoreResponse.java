package com.example.projetpfehistovente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopStoreResponse {
    private String storeCode;
    private String storeName;
    private Long totalSales;
    private BigDecimal totalRevenue;
}

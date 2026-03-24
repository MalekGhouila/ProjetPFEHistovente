package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.*;
import com.example.projetpfehistovente.repository.AnalyticsSummaryRepository;
import com.example.projetpfehistovente.repository.MagasinRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsSummaryRepository summaryRepository;

    @Autowired
    private MagasinRepository magasinRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // ===== GLOBAL KPIs =====
    public KpiResponse getGlobalKpis() {
        Double totalTransactions = getValue("total_transactions");
        Double totalRevenue = getValue("total_revenue");
        Double avgSaleValue = getValue("avg_sale_value");
        Double totalStores = getValue("total_stores");

        return new KpiResponse(
                totalTransactions != null ? totalTransactions.longValue() : 0L,
                totalRevenue != null ? totalRevenue : 0.0,
                avgSaleValue != null ? avgSaleValue : 0.0,
                totalStores != null ? totalStores.longValue() : 0L
        );
    }

    // ===== MONTHLY SALES =====
    public List<MonthlySalesResponse> getMonthlySales() {
        String json = getText("monthly_sales_2024");
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<MonthlySalesResponse>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== TOP STORES =====
    public List<TopStoreResponse> getTopStores() {
        String json = getText("top_stores");
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<TopStoreResponse>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== SALES BY FAMILY =====
    public List<FamilySalesResponse> getSalesByFamily() {
        String json = getText("sales_by_family");
        if (json == null) return List.of();
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<FamilySalesResponse>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    // ===== DATA QUALITY =====
    public DataQualityResponse getDataQuality() {
        Double totalRecords = getValue("total_transactions");
        return new DataQualityResponse(
                totalRecords != null ? totalRecords.longValue() : 0L,
                74.0,
                26.0,
                0L
        );
    }

    // ===== STORE KPIs =====
    public KpiResponse getStoreKpis(Long storeId) {
        Double transactions = getValue("store_transactions_" + storeId);
        Double revenue = getValue("store_revenue_" + storeId);
        Double avg = getValue("store_avg_" + storeId);

        return new KpiResponse(
                transactions != null ? transactions.longValue() : 0L,
                revenue != null ? revenue : 0.0,
                avg != null ? avg : 0.0,
                1L
        );
    }

    // ===== HELPER METHODS =====
    private Double getValue(String metricName) {
        return summaryRepository.findByMetricName(metricName)
                .map(s -> s.getMetricValue())
                .orElse(null);
    }

    private String getText(String metricName) {
        return summaryRepository.findByMetricName(metricName)
                .map(s -> s.getMetricText())
                .orElse(null);
    }
}

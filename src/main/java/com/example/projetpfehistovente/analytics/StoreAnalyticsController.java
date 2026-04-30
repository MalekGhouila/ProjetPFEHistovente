package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.AtRiskDTO;
import com.example.projetpfehistovente.dto.DormantDTO;
import com.example.projetpfehistovente.dto.StockForecastDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/store-analytics")
@CrossOrigin(origins = "http://localhost:4200")
public class StoreAnalyticsController {

    @Autowired
    private StoreAnalyticsService storeAnalyticsService;

    // Get KPIs for a store
    @GetMapping("/{storeId}/kpis")
    public ResponseEntity<Map<String, Object>> getStoreKpis(@PathVariable Long storeId) {
        Double transactions = storeAnalyticsService.getValue(storeId, "total_transactions");
        Double revenue = storeAnalyticsService.getValue(storeId, "total_revenue");
        Double avg = storeAnalyticsService.getValue(storeId, "avg_sale_value");
        LocalDateTime lastUpdated = storeAnalyticsService.getLastUpdated(storeId);

        return ResponseEntity.ok(Map.of(
                "totalTransactions", transactions != null ? transactions.longValue() : 0,
                "totalRevenue", revenue != null ? revenue : 0.0,
                "avgSaleValue", avg != null ? avg : 0.0,
                "lastUpdated", lastUpdated != null ? lastUpdated.toString() : "Never",
                "hasData", storeAnalyticsService.hasData(storeId)
        ));
    }

    // Get monthly sales for a store
    @GetMapping("/{storeId}/monthly-sales")
    public ResponseEntity<String> getMonthlySales(@PathVariable Long storeId) {
        String json = storeAnalyticsService.getText(storeId, "monthly_sales");
        return ResponseEntity.ok(json != null ? json : "[]");
    }

    // Get sales by family for a store
    @GetMapping("/{storeId}/sales-by-family")
    public ResponseEntity<String> getSalesByFamily(@PathVariable Long storeId) {
        String json = storeAnalyticsService.getText(storeId, "sales_by_family");
        return ResponseEntity.ok(json != null ? json : "[]");
    }

    // Trigger calculation for a store
    @PostMapping("/{storeId}/calculate")
    public ResponseEntity<Map<String, String>> calculateStore(@PathVariable Long storeId) {
        new Thread(() -> storeAnalyticsService.calculateStoreAnalytics(storeId)).start();
        return ResponseEntity.ok(Map.of(
                "message", "Calculation started! This may take a few minutes.",
                "status", "processing"
        ));
    }

    // Check if calculation is done
    @GetMapping("/{storeId}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable Long storeId) {
        boolean isCalculating = StoreAnalyticsService.isCalculating(storeId);
        boolean hasData = storeAnalyticsService.hasData(storeId);
        LocalDateTime lastUpdated = storeAnalyticsService.getLastUpdated(storeId);

        return ResponseEntity.ok(Map.of(
                "hasData", hasData,
                "isCalculating", isCalculating,
                "lastUpdated", lastUpdated != null ? lastUpdated.toString() : "Never"
        ));
    }

    // Get stock forecast for a store
    @GetMapping("/{storeId}/stock-forecast")
    public ResponseEntity<List<StockForecastDTO>> getStockForecast(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeAnalyticsService.getStockForecast(storeId));
    }

    // Get at-risk articles for a store
    @GetMapping("/{storeId}/at-risk")
    public ResponseEntity<List<AtRiskDTO>> getAtRisk(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeAnalyticsService.getAtRisk(storeId));
    }

    // Get dormant articles for a store
    @GetMapping("/{storeId}/dormant")
    public ResponseEntity<List<DormantDTO>> getDormant(@PathVariable Long storeId) {
        return ResponseEntity.ok(storeAnalyticsService.getDormant(storeId));
    }
}
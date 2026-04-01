package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:4200")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/kpis")
    public ResponseEntity<KpiResponse> getGlobalKpis() {
        return ResponseEntity.ok(analyticsService.getGlobalKpis());
    }

    @GetMapping("/monthly-sales")
    public ResponseEntity<List<MonthlySalesResponse>> getMonthlySales() {
        return ResponseEntity.ok(analyticsService.getMonthlySales());
    }

    @GetMapping("/top-stores")
    public ResponseEntity<List<TopStoreResponse>> getTopStores() {
        return ResponseEntity.ok(analyticsService.getTopStores());
    }

    @GetMapping("/sales-by-family")
    public ResponseEntity<List<FamilySalesResponse>> getSalesByFamily() {
        return ResponseEntity.ok(analyticsService.getSalesByFamily());
    }

    @GetMapping("/data-quality")
    public ResponseEntity<DataQualityResponse> getDataQuality() {
        return ResponseEntity.ok(analyticsService.getDataQuality());
    }

    @GetMapping("/store-kpis/{storeId}")
    public ResponseEntity<KpiResponse> getStoreKpis(@PathVariable Long storeId) {
        return ResponseEntity.ok(analyticsService.getStoreKpis(storeId));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh() {
        new Thread(() -> analyticsService.refreshAnalytics()).start();
        return ResponseEntity.ok(Map.of(
                "message", "Calculation started! This may take a few minutes.",
                "status", "processing"
        ));
    }

    @GetMapping("/refresh-status")
    public ResponseEntity<Map<String, Object>> getRefreshStatus() {
        return ResponseEntity.ok(Map.of(
                "isCalculating", AnalyticsService.isCalculating(),
                "lastUpdated", analyticsService.getLastUpdated()
        ));
    }

}

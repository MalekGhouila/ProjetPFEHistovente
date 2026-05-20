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

    // ===== GLOBAL KPIs =====
    @GetMapping("/kpis")
    public ResponseEntity<KpiResponse> getGlobalKpis() {
        return ResponseEntity.ok(analyticsService.getGlobalKpis());
    }

    // ===== MONTHLY SALES =====
    @GetMapping("/monthly-sales")
    public ResponseEntity<List<MonthlySalesResponse>> getMonthlySales() {
        return ResponseEntity.ok(analyticsService.getMonthlySales());
    }

    // ===== TOP STORES =====
    @GetMapping("/top-stores")
    public ResponseEntity<List<TopStoreResponse>> getTopStores() {
        return ResponseEntity.ok(analyticsService.getTopStores());
    }

    // ===== SALES BY FAMILY =====
    @GetMapping("/sales-by-family")
    public ResponseEntity<List<FamilySalesResponse>> getSalesByFamily() {
        return ResponseEntity.ok(analyticsService.getSalesByFamily());
    }

    // ===== DATA QUALITY =====
    @GetMapping("/data-quality")
    public ResponseEntity<DataQualityResponse> getDataQuality() {
        return ResponseEntity.ok(analyticsService.getDataQuality());
    }

    // ===== MISSING BY COLUMN =====
    @GetMapping("/missing-by-column")
    public ResponseEntity<Map<String, Double>> getMissingByColumn() {
        return ResponseEntity.ok(analyticsService.getMissingValuesByColumn());
    }

    // ===== RECORDS PER MONTH (optional ?year=YYYY param) =====
    @GetMapping("/records-per-month")
    public ResponseEntity<List<Map<String, Object>>> getRecordsPerMonth(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(analyticsService.getRecordsPerMonth(year));
    }

    // ===== AVAILABLE YEARS =====
    @GetMapping("/available-years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        return ResponseEntity.ok(analyticsService.getAvailableYears());
    }

    // ===== RECORDS PER YEAR =====
    @GetMapping("/records-per-year")
    public ResponseEntity<List<Map<String, Object>>> getRecordsPerYear() {
        return ResponseEntity.ok(analyticsService.getRecordsPerYear());
    }

    // ===== STORE KPIs =====
    @GetMapping("/store-kpis/{storeId}")
    public ResponseEntity<KpiResponse> getStoreKpis(@PathVariable Long storeId) {
        return ResponseEntity.ok(analyticsService.getStoreKpis(storeId));
    }

    // ===== FILTERED ANALYTICS =====
    @GetMapping("/filtered")
    public ResponseEntity<Map<String, Object>> getFilteredAnalytics(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String saison,
            @RequestParam(required = false) String codeMag) {
        return ResponseEntity.ok(
                analyticsService.getFilteredAnalytics(famille, saison, codeMag)
        );
    }

    // ===== REFRESH ANALYTICS =====
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh() {
        if (AnalyticsService.isCalculating()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Calculation already in progress.",
                    "status", "already_running"
            ));
        }
        new Thread(() -> analyticsService.refreshAnalytics()).start();
        return ResponseEntity.ok(Map.of(
                "message", "Calculation started! This may take a few minutes.",
                "status", "processing"
        ));
    }

    // ===== REFRESH STATUS =====
    @GetMapping("/refresh-status")
    public ResponseEntity<Map<String, Object>> getRefreshStatus() {
        return ResponseEntity.ok(Map.of(
                "isCalculating", AnalyticsService.isCalculating(),
                "lastUpdated",   analyticsService.getLastUpdated()
        ));
    }

    // ===== REFRESH QUALITY =====
    @PostMapping("/refresh-quality")
    public ResponseEntity<Map<String, String>> refreshQuality() {
        if (AnalyticsService.isCalculatingQuality()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Quality recalculation already in progress.",
                    "status", "already_running"
            ));
        }
        new Thread(() -> analyticsService.refreshQualityMetrics()).start();
        return ResponseEntity.ok(Map.of(
                "message", "Quality recalculation started!",
                "status", "processing"
        ));
    }

    // ===== QUALITY STATUS =====
    @GetMapping("/quality-status")
    public ResponseEntity<Map<String, Object>> getQualityStatus() {
        return ResponseEntity.ok(Map.of(
                "lastUpdated",   analyticsService.getLastUpdated("total_raw_records"),
                "isCalculating", AnalyticsService.isCalculatingQuality()
        ));
    }
}
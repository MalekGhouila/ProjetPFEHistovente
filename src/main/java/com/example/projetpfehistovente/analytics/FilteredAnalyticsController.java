package com.example.projetpfehistovente.analytics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/custom")
@CrossOrigin(origins = "http://localhost:4200")
public class FilteredAnalyticsController {

    @Autowired
    private FilteredAnalyticsService filteredAnalyticsService;

    // Get KPIs for filter combination
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKpis(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String saison,
            @RequestParam(required = false) String codeMag) {

        String filterKey = filteredAnalyticsService.buildFilterKey(famille, saison, codeMag);
        boolean hasData = filteredAnalyticsService.hasData(filterKey);
        boolean isCalculating = filteredAnalyticsService.isCalculating(filterKey);
        LocalDateTime lastUpdated = filteredAnalyticsService.getLastUpdated(filterKey);

        if (!hasData) {
            return ResponseEntity.ok(Map.of(
                    "hasData", false,
                    "isCalculating", isCalculating,
                    "lastUpdated", "Never"
            ));
        }

        Double transactions = filteredAnalyticsService.getValue(filterKey, "total_transactions");
        Double revenue = filteredAnalyticsService.getValue(filterKey, "total_revenue");

        return ResponseEntity.ok(Map.of(
                "hasData", true,
                "isCalculating", isCalculating,
                "totalTransactions", transactions != null ? transactions.longValue() : 0L,
                "totalRevenue", revenue != null ? revenue : 0.0,
                "lastUpdated", lastUpdated != null ? lastUpdated.toString() : "Never"
        ));
    }

    // Get monthly sales for filter combination
    @GetMapping("/monthly-sales")
    public ResponseEntity<String> getMonthlySales(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String saison,
            @RequestParam(required = false) String codeMag) {

        String filterKey = filteredAnalyticsService.buildFilterKey(famille, saison, codeMag);
        String json = filteredAnalyticsService.getText(filterKey, "monthly_sales");
        return ResponseEntity.ok(json != null ? json : "[]");
    }

    // Get sales by family for filter combination
    @GetMapping("/sales-by-family")
    public ResponseEntity<String> getSalesByFamily(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String saison,
            @RequestParam(required = false) String codeMag) {

        String filterKey = filteredAnalyticsService.buildFilterKey(famille, saison, codeMag);
        String json = filteredAnalyticsService.getText(filterKey, "sales_by_family");
        return ResponseEntity.ok(json != null ? json : "[]");
    }

    // Trigger calculation
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, String>> calculate(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String saison,
            @RequestParam(required = false) String codeMag) {

        new Thread(() ->
                filteredAnalyticsService.calculate(famille, saison, codeMag)
        ).start();

        return ResponseEntity.ok(Map.of(
                "message", "Calculation started! Please wait...",
                "filterKey", filteredAnalyticsService.buildFilterKey(famille, saison, codeMag)
        ));
    }

    // Check calculation status
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(
            @RequestParam(required = false) String famille,
            @RequestParam(required = false) String saison,
            @RequestParam(required = false) String codeMag) {

        String filterKey = filteredAnalyticsService.buildFilterKey(famille, saison, codeMag);
        boolean isCalculating = filteredAnalyticsService.isCalculating(filterKey);
        boolean hasData = filteredAnalyticsService.hasData(filterKey);
        LocalDateTime lastUpdated = filteredAnalyticsService.getLastUpdated(filterKey);

        return ResponseEntity.ok(Map.of(
                "filterKey", filterKey,
                "isCalculating", isCalculating,
                "hasData", hasData,
                "lastUpdated", lastUpdated != null ? lastUpdated.toString() : "Never"
        ));
    }
}
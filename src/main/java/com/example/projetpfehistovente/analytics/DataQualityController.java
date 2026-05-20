package com.example.projetpfehistovente.analytics;

import com.example.projetpfehistovente.dto.DataQualityRawStatsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/data-quality")
@CrossOrigin(origins = "http://localhost:4200")
public class DataQualityController {

    @Autowired
    private DataQualityService dataQualityService;

    @GetMapping("/raw-stats")
    public ResponseEntity<DataQualityRawStatsDto> getRawStats() {
        return ResponseEntity.ok(dataQualityService.getRawStats());
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh() {
        if (DataQualityService.isCalculating()) {
            return ResponseEntity.ok(Map.of(
                    "message", "Data quality calculation already in progress.",
                    "status", "already_running"
            ));
        }

        new Thread(() -> dataQualityService.refreshDataQuality()).start();

        return ResponseEntity.ok(Map.of(
                "message", "Data quality calculation started!",
                "status", "processing"
        ));
    }

    @PostMapping("/stop-refresh")
    public ResponseEntity<Map<String, String>> stopRefresh() {
        if (!DataQualityService.isCalculating()) {
            return ResponseEntity.ok(Map.of(
                    "message", "No data quality calculation is currently running.",
                    "status", "idle"
            ));
        }

        DataQualityService.requestStopCalculation();

        return ResponseEntity.ok(Map.of(
                "message", "Data quality calculation stop requested.",
                "status", "stopping"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "isCalculating", DataQualityService.isCalculating(),
                "lastUpdated", dataQualityService.getLastUpdated()
        ));
    }
}
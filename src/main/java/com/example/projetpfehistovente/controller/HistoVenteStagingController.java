package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.dto.HistoVenteStagingDTO;
import com.example.projetpfehistovente.service.HistoVenteStagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analyst/staging")
@CrossOrigin(origins = "http://localhost:4200")
public class HistoVenteStagingController {

    @Autowired
    private HistoVenteStagingService service;

    // GET paginated with filters
    // /api/analyst/staging?status=PENDING&codeMag=&famille=&page=0&size=50
    @GetMapping
    public ResponseEntity<Page<HistoVenteStagingDTO>> getStaging(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String codeMag,
            @RequestParam(required = false) String famille,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "50")  int size,
            @RequestParam(defaultValue = "idStaging") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(service.getStagingPaginated(status, codeMag, famille, page, size, sort, direction));
    }

    // GET status counts — used for the badge counters on the page
    // /api/analyst/staging/counts
    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getCounts() {
        return ResponseEntity.ok(service.getStatusCounts());
    }
}
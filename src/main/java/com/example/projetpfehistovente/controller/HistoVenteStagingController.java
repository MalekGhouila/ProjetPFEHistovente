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

    // ── Existing: paginated browse with filters ────────────────────────────────
    // GET /api/analyst/staging?status=PENDING&codeMag=&famille=&page=0&size=50
    @GetMapping
    public ResponseEntity<Page<HistoVenteStagingDTO>> getStaging(
            @RequestParam(required = false)          String status,
            @RequestParam(required = false)          String codeMag,
            @RequestParam(required = false)          String famille,
            @RequestParam(defaultValue = "0")        int page,
            @RequestParam(defaultValue = "50")       int size,
            @RequestParam(defaultValue = "idStaging") String sort,
            @RequestParam(defaultValue = "desc")     String direction) {
        return ResponseEntity.ok(service.getStagingPaginated(status, codeMag, famille, page, size, sort, direction));
    }

    // ── Existing: simple status counts ────────────────────────────────────────
    // GET /api/analyst/staging/counts
    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getCounts() {
        return ResponseEntity.ok(service.getStatusCounts());
    }

    // ── NEW: review counts (pending + autoValid + problems) ───────────────────
    // GET /api/analyst/staging/review-counts
    @GetMapping("/review-counts")
    public ResponseEntity<Map<String, Long>> getReviewCounts() {
        return ResponseEntity.ok(service.getReviewCounts());
    }

    // ── NEW: pending rows with problems ───────────────────────────────────────
    // GET /api/analyst/staging/problems?page=0&size=50
    @GetMapping("/problems")
    public ResponseEntity<Page<HistoVenteStagingDTO>> getProblems(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(service.getPendingWithProblems(page, size));
    }

    // ── NEW: approve single row ───────────────────────────────────────────────
    // POST /api/analyst/staging/{id}/approve
    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveOne(@PathVariable Long id) {
        service.approveOne(id);
        return ResponseEntity.ok().build();
    }

    // ── NEW: reject single row ────────────────────────────────────────────────
    // POST /api/analyst/staging/{id}/reject   body: {"reason":"..."}
    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectOne(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        service.rejectOne(id, body.getOrDefault("reason", ""));
        return ResponseEntity.ok().build();
    }

    // ── NEW: bulk approve all auto-valid PENDING rows ─────────────────────────
    // POST /api/analyst/staging/bulk-approve
    @PostMapping("/bulk-approve")
    public ResponseEntity<Map<String, Integer>> bulkApprove() {
        int count = service.bulkApproveValid();
        return ResponseEntity.ok(Map.of("approved", count));
    }
}
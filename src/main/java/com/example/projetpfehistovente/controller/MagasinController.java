package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.Magasin;
import com.example.projetpfehistovente.service.MagasinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/magasins")
@CrossOrigin(origins = "http://localhost:4200")
public class MagasinController {

    @Autowired
    private MagasinService magasinService;

    // ── Original endpoint (kept for backward compat, e.g. dropdowns) ──────────
    @GetMapping("/all")
    public List<Magasin> getAll() {
        return magasinService.findAll();
    }

    // ── Paginated + search (new, used by the manager page) ────────────────────
    @GetMapping
    public ResponseEntity<Page<Magasin>> getPaginated(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(magasinService.getMagasinsPaginated(search, page, size));
    }

    // ── GET single ────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Magasin> getById(@PathVariable Long id) {
        return magasinService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Magasin magasin) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(magasinService.create(magasin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Magasin magasin) {
        try {
            return ResponseEntity.ok(magasinService.update(id, magasin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── TOGGLE ETAT ───────────────────────────────────────────────────────────
    @PatchMapping("/{id}/toggle-etat")
    public ResponseEntity<?> toggleEtat(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(magasinService.toggleEtat(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            magasinService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.ArFamille;
import com.example.projetpfehistovente.service.ArFamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/familles")
@CrossOrigin(origins = "http://localhost:4200")
public class ArFamilleController {

    @Autowired
    private ArFamilleService arFamilleService;

    // ── keep existing: list all (used in dropdowns/filters elsewhere) ──
    @GetMapping("/all")
    public List<ArFamille> getAll() {
        return arFamilleService.findAll();
    }

    // ── NEW: paginated + searchable (used by manager table) ──
    @GetMapping
    public ResponseEntity<Page<ArFamille>> getPaginated(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idArFamille") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(arFamilleService.getPaginated(search, page, size, sort, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArFamille> getById(@PathVariable Long id) {
        return arFamilleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── updated: uses create() with code uniqueness check ──
    @PostMapping
    public ResponseEntity<ArFamille> create(@RequestBody ArFamille arFamille) {
        return ResponseEntity.ok(arFamilleService.create(arFamille));
    }

    // ── updated: uses update() with field-level merge ──
    @PutMapping("/{id}")
    public ResponseEntity<ArFamille> update(@PathVariable Long id, @RequestBody ArFamille arFamille) {
        return ResponseEntity.ok(arFamilleService.update(id, arFamille));
    }

    // ── NEW: toggle etat ──
    @PatchMapping("/{id}/toggle-etat")
    public ResponseEntity<ArFamille> toggleEtat(@PathVariable Long id) {
        return ResponseEntity.ok(arFamilleService.toggleEtat(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return arFamilleService.findById(id)
                .map(existing -> {
                    arFamilleService.deleteById(id);
                    return ResponseEntity.<Void>noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.SousFamille;
import com.example.projetpfehistovente.service.SousFamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sous-familles")
@CrossOrigin(origins = "http://localhost:4200")
public class SousFamilleController {

    @Autowired
    private SousFamilleService sousFamilleService;

    // all (for dropdowns)
    @GetMapping("/all")
    public List<SousFamille> getAll() {
        return sousFamilleService.findAll();
    }

    // by parent famille (for dropdowns filtered by famille)
    @GetMapping("/by-famille/{idArFamille}")
    public List<SousFamille> getByFamille(@PathVariable Long idArFamille) {
        return sousFamilleService.findByFamille(idArFamille);
    }

    // paginated + search + optional famille filter
    @GetMapping
    public ResponseEntity<Page<SousFamille>> getPaginated(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long idArFamille,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(sousFamilleService.getPaginated(search, idArFamille, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SousFamille> getById(@PathVariable Long id) {
        return sousFamilleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SousFamille> create(@RequestBody SousFamille sf) {
        return ResponseEntity.ok(sousFamilleService.create(sf));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SousFamille> update(@PathVariable Long id, @RequestBody SousFamille sf) {
        return ResponseEntity.ok(sousFamilleService.update(id, sf));
    }

    @PatchMapping("/{id}/toggle-etat")
    public ResponseEntity<SousFamille> toggleEtat(@PathVariable Long id) {
        return ResponseEntity.ok(sousFamilleService.toggleEtat(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return sousFamilleService.findById(id)
                .map(existing -> {
                    sousFamilleService.deleteById(id);
                    return ResponseEntity.<Void>noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.Saison;
import com.example.projetpfehistovente.service.SaisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saisons")
@CrossOrigin(origins = "http://localhost:4200")
public class SaisonController {

    @Autowired
    private SaisonService saisonService;

    @GetMapping
    public List<Saison> getAll() {
        return saisonService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Saison> getById(@PathVariable Long id) {
        return saisonService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Saison create(@RequestBody Saison saison) {
        return saisonService.save(saison);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Saison> update(@PathVariable Long id, @RequestBody Saison saison) {
        return saisonService.findById(id)
                .map(existing -> {
                    saison.setIdSaison(id);
                    return ResponseEntity.ok(saisonService.save(saison));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return saisonService.findById(id)
                .map(existing -> {
                    saisonService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }
}

package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.Magasin;
import com.example.projetpfehistovente.service.MagasinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/magasins")
@CrossOrigin(origins = "http://localhost:4200")
public class MagasinController {

    @Autowired
    private MagasinService magasinService;

    @GetMapping
    public List<Magasin> getAll() {
        return magasinService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Magasin> getById(@PathVariable Long id) {
        return magasinService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Magasin create(@RequestBody Magasin magasin) {
        return magasinService.save(magasin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Magasin> update(@PathVariable Long id, @RequestBody Magasin magasin) {
        return magasinService.findById(id)
                .map(existing -> {
                    magasin.setIdMagasin(id);
                    return ResponseEntity.ok(magasinService.save(magasin));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return magasinService.findById(id)
                .map(existing -> {
                    magasinService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }
}

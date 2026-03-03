package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.SousFamille;
import com.example.projetpfehistovente.service.SousFamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sousfamilles")
@CrossOrigin(origins = "http://localhost:4200")
public class SousFamilleController {

    @Autowired
    private SousFamilleService sousFamilleService;

    @GetMapping
    public List<SousFamille> getAll() {
        return sousFamilleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SousFamille> getById(@PathVariable Long id) {
        return sousFamilleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SousFamille create(@RequestBody SousFamille sousFamille) {
        return sousFamilleService.save(sousFamille);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SousFamille> update(@PathVariable Long id, @RequestBody SousFamille sousFamille) {
        return sousFamilleService.findById(id)
                .map(existing -> {
                    sousFamille.setIdArSousFamille(id);
                    return ResponseEntity.ok(sousFamilleService.save(sousFamille));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return sousFamilleService.findById(id)
                .map(existing -> {
                    sousFamilleService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }
}

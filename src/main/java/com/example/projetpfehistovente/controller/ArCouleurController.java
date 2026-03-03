package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.ArCouleur;
import com.example.projetpfehistovente.service.ArCouleurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/couleurs")
@CrossOrigin(origins = "http://localhost:4200")
public class ArCouleurController {

    @Autowired
    private ArCouleurService arCouleurService;

    @GetMapping
    public List<ArCouleur> getAll() {
        return arCouleurService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArCouleur> getById(@PathVariable Long id) {
        return arCouleurService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ArCouleur create(@RequestBody ArCouleur arCouleur) {
        return arCouleurService.save(arCouleur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArCouleur> update(@PathVariable Long id, @RequestBody ArCouleur arCouleur) {
        return arCouleurService.findById(id)
                .map(existing -> {
                    arCouleur.setIdArCouleur(id);
                    return ResponseEntity.ok(arCouleurService.save(arCouleur));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return arCouleurService.findById(id)
                .map(existing -> {
                    arCouleurService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }
}

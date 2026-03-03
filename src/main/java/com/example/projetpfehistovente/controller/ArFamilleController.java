package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.ArFamille;
import com.example.projetpfehistovente.service.ArFamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/familles")
@CrossOrigin(origins = "http://localhost:4200")
public class ArFamilleController {

    @Autowired
    private ArFamilleService arFamilleService;

    // GET all families
    @GetMapping
    public List<ArFamille> getAll() {
        return arFamilleService.findAll();
    }

    // GET one family by ID
    @GetMapping("/{id}")
    public ResponseEntity<ArFamille> getById(@PathVariable Long id) {
        return arFamilleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create new family
    @PostMapping
    public ArFamille create(@RequestBody ArFamille arFamille) {
        return arFamilleService.save(arFamille);
    }

    // PUT update existing family
    @PutMapping("/{id}")
    public ResponseEntity<ArFamille> update(@PathVariable Long id, @RequestBody ArFamille arFamille) {
        return arFamilleService.findById(id)
                .map(existing -> {
                    arFamille.setIdArFamille(id);
                    return ResponseEntity.ok(arFamilleService.save(arFamille));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE family
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return arFamilleService.findById(id)
                .map(existing -> {
                    arFamilleService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }

}

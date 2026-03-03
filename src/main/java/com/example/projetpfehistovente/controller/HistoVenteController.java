package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.HistoVente;
import com.example.projetpfehistovente.service.HistoVenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/histovente")
@CrossOrigin(origins = "http://localhost:4200")
public class HistoVenteController {

    @Autowired
    private HistoVenteService histoVenteService;

    @GetMapping
    public Page<HistoVente> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return histoVenteService.findAll(PageRequest.of(page, size));
    }


    @GetMapping("/{id}")
    public ResponseEntity<HistoVente> getById(@PathVariable Long id){
        return histoVenteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public HistoVente create(@RequestBody HistoVente histoVente){return histoVenteService.save(histoVente);}

    @PutMapping("/{id}")
    public ResponseEntity<HistoVente> update(@PathVariable Long id,@RequestBody HistoVente histoVente){
        return histoVenteService.findById(id)
                .map(existing-> {
                    histoVente.setIdHistoVente(id);
                    return ResponseEntity.ok(histoVenteService.save(histoVente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        return histoVenteService.findById(id)
                .map( existing -> {
                    histoVenteService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }
}

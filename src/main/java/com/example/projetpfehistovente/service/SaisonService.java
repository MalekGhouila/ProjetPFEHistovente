package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.Saison;
import com.example.projetpfehistovente.repository.SaisonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SaisonService {

    @Autowired
    private SaisonRepository saisonRepository;

    public List<Saison> findAll() {
        return saisonRepository.findAll();
    }

    public Optional<Saison> findById(Long id) {
        return saisonRepository.findById(id);
    }

    public Saison save(Saison saison) {
        return saisonRepository.save(saison);
    }

    public void deleteById(Long id) {
        saisonRepository.deleteById(id);
    }
}

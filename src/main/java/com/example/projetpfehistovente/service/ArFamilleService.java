package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.ArFamille;
import com.example.projetpfehistovente.repository.ArFamilleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArFamilleService {

    @Autowired
    private ArFamilleRepository arFamilleRepository;

    // Get all families
    public List<ArFamille> findAll() {
        return arFamilleRepository.findAll();
    }

    // Get one family by ID
    public Optional<ArFamille> findById(Long id) {
        return arFamilleRepository.findById(id);
    }

    // Create or Update
    public ArFamille save(ArFamille arFamille) {
        return arFamilleRepository.save(arFamille);
    }

    // Delete
    public void deleteById(Long id) {
        arFamilleRepository.deleteById(id);
    }
}

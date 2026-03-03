package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.ArCouleur;
import com.example.projetpfehistovente.repository.ArCouleurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArCouleurService {

    @Autowired
    private ArCouleurRepository arCouleurRepository;

    public List<ArCouleur> findAll() {
        return arCouleurRepository.findAll();
    }

    public Optional<ArCouleur> findById(Long id) {
        return arCouleurRepository.findById(id);
    }

    public ArCouleur save(ArCouleur arCouleur) {
        return arCouleurRepository.save(arCouleur);
    }

    public void deleteById(Long id) {
        arCouleurRepository.deleteById(id);
    }
}

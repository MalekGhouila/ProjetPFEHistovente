package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.SousFamille;
import com.example.projetpfehistovente.repository.SousFamilleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SousFamilleService {

    @Autowired
    private SousFamilleRepository sousFamilleRepository;

    public List<SousFamille> findAll() {
        return sousFamilleRepository.findAll();
    }

    public Optional<SousFamille> findById(Long id) {
        return sousFamilleRepository.findById(id);
    }

    public SousFamille save(SousFamille sousFamille) {
        return sousFamilleRepository.save(sousFamille);
    }

    public void deleteById(Long id) {
        sousFamilleRepository.deleteById(id);
    }
}

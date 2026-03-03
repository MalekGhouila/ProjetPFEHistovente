package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.Magasin;
import com.example.projetpfehistovente.repository.MagasinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MagasinService {

    @Autowired
    private MagasinRepository magasinRepository;

    public List<Magasin> findAll() {
        return magasinRepository.findAll();
    }

    public Optional<Magasin> findById(Long id) {
        return magasinRepository.findById(id);
    }

    public Magasin save(Magasin magasin) {
        return magasinRepository.save(magasin);
    }

    public void deleteById(Long id) {
        magasinRepository.deleteById(id);
    }
}

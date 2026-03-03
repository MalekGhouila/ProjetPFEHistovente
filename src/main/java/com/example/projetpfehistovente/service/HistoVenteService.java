package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.HistoVente;
import com.example.projetpfehistovente.repository.HistoVenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistoVenteService {

    @Autowired
    private HistoVenteRepository histoVenteRepository;

    public Page<HistoVente> findAll(PageRequest pageRequest) {
        return histoVenteRepository.findAll(pageRequest);
    }


    public Optional<HistoVente> findById(Long id){return histoVenteRepository.findById(id);}

    public HistoVente save(HistoVente histoVente){return histoVenteRepository.save(histoVente);}

    public void deleteById(Long id){ histoVenteRepository.deleteById(id);}
}

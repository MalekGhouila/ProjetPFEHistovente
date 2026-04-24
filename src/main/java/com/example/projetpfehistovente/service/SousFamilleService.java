package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.SousFamille;
import com.example.projetpfehistovente.repository.SousFamilleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    public List<SousFamille> findByFamille(Long idArFamille) {
        return sousFamilleRepository.findByIdArFamille(idArFamille);
    }

    public Page<SousFamille> getPaginated(String search, Long idArFamille, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("sousFamille").ascending());
        return sousFamilleRepository.searchSousFamilles(search, idArFamille, pageable);
    }

    public SousFamille create(SousFamille sf) {
        if (sf.getCode() != null && !sf.getCode().isBlank()
                && sousFamilleRepository.existsByCode(sf.getCode())) {
            throw new RuntimeException("Code already exists: " + sf.getCode());
        }
        if (sf.getEtat() == null) sf.setEtat(1);
        return sousFamilleRepository.save(sf);
    }

    public SousFamille update(Long id, SousFamille updated) {
        SousFamille existing = sousFamilleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SousFamille not found: " + id));
        if (updated.getCode() != null && !updated.getCode().isBlank()
                && sousFamilleRepository.existsByCodeAndIdArSousFamilleNot(updated.getCode(), id)) {
            throw new RuntimeException("Code already used: " + updated.getCode());
        }
        existing.setSousFamille(updated.getSousFamille());
        existing.setCode(updated.getCode());
        existing.setIdArFamille(updated.getIdArFamille());
        return sousFamilleRepository.save(existing);
    }

    public SousFamille toggleEtat(Long id) {
        SousFamille sf = sousFamilleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SousFamille not found: " + id));
        sf.setEtat(sf.getEtat() != null && sf.getEtat() == 1 ? 0 : 1);
        return sousFamilleRepository.save(sf);
    }

    public void deleteById(Long id) {
        sousFamilleRepository.deleteById(id);
    }
}
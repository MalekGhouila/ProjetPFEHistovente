package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.ArFamille;
import com.example.projetpfehistovente.repository.ArFamilleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArFamilleService {

    @Autowired
    private ArFamilleRepository arFamilleRepository;

    public List<ArFamille> findAll() {
        return arFamilleRepository.findAll();
    }

    public Optional<ArFamille> findById(Long id) {
        return arFamilleRepository.findById(id);
    }

    // ── NEW: paginated + searchable ──
    public Page<ArFamille> getPaginated(String search, int page, int size, String sort, String direction) {
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        return arFamilleRepository.searchFamilles(search, pageable);
    }

    // ── NEW: create with code uniqueness check ──
    public ArFamille create(ArFamille famille) {
        if (famille.getCode() != null && !famille.getCode().isBlank()
                && arFamilleRepository.existsByCode(famille.getCode())) {
            throw new RuntimeException("Code already exists: " + famille.getCode());
        }
        if (famille.getEtat() == null) famille.setEtat(true);
        return arFamilleRepository.save(famille);
    }

    // ── NEW: update with code uniqueness check ──
    public ArFamille update(Long id, ArFamille updated) {
        ArFamille existing = arFamilleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Famille not found: " + id));
        if (updated.getCode() != null && !updated.getCode().isBlank()
                && arFamilleRepository.existsByCodeAndIdArFamilleNot(updated.getCode(), id)) {
            throw new RuntimeException("Code already used: " + updated.getCode());
        }
        existing.setFamille(updated.getFamille());
        existing.setCode(updated.getCode());
        existing.setType(updated.getType());
        existing.setCodeDouane(updated.getCodeDouane());
        existing.setSaisonObligatoire(updated.getSaisonObligatoire());
        return arFamilleRepository.save(existing);
    }

    // ── NEW: toggle etat ──
    public ArFamille toggleEtat(Long id) {
        ArFamille f = arFamilleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Famille not found: " + id));
        f.setEtat(Boolean.TRUE.equals(f.getEtat()) ? false : true);
        return arFamilleRepository.save(f);
    }

    // keep old save for compatibility
    public ArFamille save(ArFamille arFamille) {
        return arFamilleRepository.save(arFamille);
    }

    public void deleteById(Long id) {
        arFamilleRepository.deleteById(id);
    }
}
package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.Magasin;
import com.example.projetpfehistovente.repository.MagasinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MagasinService {

    @Autowired
    private MagasinRepository magasinRepository;

    // ── Kept for dropdowns / backward compat ──────────────────────────────────
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

    // ── Paginated + search + sort ──────────────────────────────────────────────
    public Page<Magasin> getMagasinsPaginated(String search, int page, int size, String sortField, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortField).descending()
                : Sort.by(sortField).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        return magasinRepository.searchMagasins(search, pageable);
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    public Magasin create(Magasin magasin) {
        if (magasin.getCode() != null && !magasin.getCode().isBlank()
                && magasinRepository.existsByCode(magasin.getCode())) {
            throw new RuntimeException("Code already exists: " + magasin.getCode());
        }
        if (magasin.getEtat() == null) magasin.setEtat(1);
        return magasinRepository.save(magasin);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public Magasin update(Long id, Magasin updated) {
        Magasin existing = magasinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Magasin not found: " + id));

        if (updated.getCode() != null && !updated.getCode().isBlank()
                && magasinRepository.existsByCodeAndIdMagasinNot(updated.getCode(), id)) {
            throw new RuntimeException("Code already used: " + updated.getCode());
        }

        existing.setMagasin(updated.getMagasin());
        existing.setCode(updated.getCode());
        existing.setIsBoutique(updated.getIsBoutique());
        existing.setIdPays(updated.getIdPays());
        existing.setIdCategorie(updated.getIdCategorie());
        return magasinRepository.save(existing);
    }

    // ── TOGGLE ETAT ───────────────────────────────────────────────────────────
    public Magasin toggleEtat(Long id) {
        Magasin m = magasinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Magasin not found: " + id));
        m.setEtat(m.getEtat() != null && m.getEtat() == 1 ? 0 : 1);
        return magasinRepository.save(m);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    public void delete(Long id) {
        if (!magasinRepository.existsById(id)) {
            throw new RuntimeException("Magasin not found: " + id);
        }
        magasinRepository.deleteById(id);
    }
}
package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.dto.HistoVenteStagingDTO;
import com.example.projetpfehistovente.entity.HistoVenteStaging;
import com.example.projetpfehistovente.repository.HistoVenteStagingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HistoVenteStagingService {

    @Autowired
    private HistoVenteStagingRepository repository;

    // ── Existing: paginated browse ─────────────────────────────────────────────
    public Page<HistoVenteStagingDTO> getStagingPaginated(
            String status, String codeMag, String famille,
            int page, int size, String sort, String direction) {

        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        String statusParam  = (status   == null || status.isBlank())   ? null : status;
        String codeMagParam = (codeMag  == null || codeMag.isBlank())  ? null : codeMag;
        String familleParam = (famille  == null || famille.isBlank())  ? null : famille;

        return repository.findWithFilters(statusParam, codeMagParam, familleParam, pageable)
                .map(this::toDTO);
    }

    // ── Existing: status counts (extended) ────────────────────────────────────
    public Map<String, Long> getStatusCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("PENDING",  repository.countByStagingStatus("PENDING"));
        counts.put("CLEANED",  repository.countByStagingStatus("CLEANED"));
        counts.put("REJECTED", repository.countByStagingStatus("REJECTED"));
        return counts;
    }

    // ── NEW: review counts (pending + autoValid + problems) ───────────────────
    public Map<String, Long> getReviewCounts() {
        Map<String, Long> counts = getStatusCounts();
        counts.put("problems",  repository.countPendingWithProblems());
        counts.put("autoValid", repository.countPendingAutoValid());
        return counts;
    }

    // ── NEW: pending rows with problems (paginated) ───────────────────────────
    public Page<HistoVenteStagingDTO> getPendingWithProblems(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("idStaging").descending());
        return repository.findPendingWithProblems(pageable).map(this::toDTO);
    }

    // ── NEW: approve single row ───────────────────────────────────────────────
    @Transactional
    public void approveOne(Long id) {
        HistoVenteStaging row = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staging row not found: " + id));
        row.setStagingStatus("CLEANED");
        row.setStagingRejectReason(null);
        repository.save(row);
    }

    // ── NEW: reject single row ────────────────────────────────────────────────
    @Transactional
    public void rejectOne(Long id, String reason) {
        HistoVenteStaging row = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staging row not found: " + id));
        row.setStagingStatus("REJECTED");
        row.setStagingRejectReason(reason != null ? reason : "");
        repository.save(row);
    }

    // ── NEW: bulk approve all auto-valid PENDING rows ─────────────────────────
    @Transactional
    public int bulkApproveValid() {
        List<HistoVenteStaging> valid = repository.findAllAutoValid();
        valid.forEach(r -> {
            r.setStagingStatus("CLEANED");
            r.setStagingRejectReason(null);
        });
        repository.saveAll(valid);
        return valid.size();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────
    private HistoVenteStagingDTO toDTO(HistoVenteStaging e) {
        HistoVenteStagingDTO dto = new HistoVenteStagingDTO();
        dto.setIdStaging(e.getIdStaging());
        dto.setStagingImportedAt(e.getStagingImportedAt());
        dto.setStagingStatus(e.getStagingStatus());
        dto.setStagingRejectReason(e.getStagingRejectReason());
        dto.setIdHistoVente(e.getIdHistoVente());
        dto.setCodeMag(e.getCodeMag());
        dto.setDateVente(e.getDateVente());
        dto.setFamille(e.getFamille());
        dto.setDesignation(e.getDesignation());
        dto.setCouleur(e.getCouleur());
        dto.setLibTaille(e.getLibTaille());
        dto.setQuantite(e.getQuantite());
        dto.setPrixVente(e.getPrixVente());
        dto.setTotal(e.getTotal());
        dto.setTypeVente(e.getTypeVente());
        dto.setSaison(e.getSaison());
        dto.setPays(e.getPays());
        dto.setVille(e.getVille());
        dto.setRegion(e.getRegion());
        return dto;
    }
}
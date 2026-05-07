package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.dto.HistoVenteStagingDTO;
import com.example.projetpfehistovente.entity.HistoVenteStaging;
import com.example.projetpfehistovente.repository.HistoVenteStagingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class HistoVenteStagingService {

    @Autowired
    private HistoVenteStagingRepository repository;

    public Page<HistoVenteStagingDTO> getStagingPaginated(
            String status, String codeMag, String famille,
            int page, int size, String sort, String direction) {

        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        String statusParam = (status == null || status.isBlank()) ? null : status;
        String codeMagParam = (codeMag == null || codeMag.isBlank()) ? null : codeMag;
        String familleParam = (famille == null || famille.isBlank()) ? null : famille;

        Page<HistoVenteStaging> result = repository.findWithFilters(statusParam, codeMagParam, familleParam, pageable);
        return result.map(this::toDTO);
    }

    public Map<String, Long> getStatusCounts() {
        return Map.of(
                "PENDING",  repository.countByStagingStatus("PENDING"),
                "CLEANED",  repository.countByStagingStatus("CLEANED"),
                "REJECTED", repository.countByStagingStatus("REJECTED")
        );
    }

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
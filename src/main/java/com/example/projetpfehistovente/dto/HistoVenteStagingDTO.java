package com.example.projetpfehistovente.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class HistoVenteStagingDTO {
    private Long idStaging;
    private LocalDateTime stagingImportedAt;
    private String stagingStatus;
    private String stagingRejectReason;

    // Key columns for display in the table
    private Long idHistoVente;
    private String codeMag;
    private LocalDate dateVente;
    private String famille;
    private String designation;
    private String couleur;
    private String libTaille;
    private Integer quantite;
    private BigDecimal prixVente;
    private BigDecimal total;
    private String typeVente;
    private String saison;
    private String pays;
    private String ville;
    private String region;
}
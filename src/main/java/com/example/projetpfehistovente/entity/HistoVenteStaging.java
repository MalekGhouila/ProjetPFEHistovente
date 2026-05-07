package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "histovente_staging")
@Data
public class HistoVenteStaging {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDStaging")
    private Long idStaging;

    @Column(name = "staging_imported_at")
    private LocalDateTime stagingImportedAt;

    @Column(name = "staging_status", length = 20)
    private String stagingStatus = "PENDING"; // PENDING | CLEANED | REJECTED

    @Column(name = "staging_reject_reason", length = 255)
    private String stagingRejectReason;

    // === ORIGINAL COLUMNS ===

    @Column(name = "IDHistoVente")
    private Long idHistoVente;

    @Column(name = "CodeMag", length = 20)
    private String codeMag;

    @Column(name = "Reception")
    private LocalDate reception;

    @Column(name = "Famille", length = 50)
    private String famille;

    @Column(name = "Barcode", length = 50)
    private String barcode;

    @Column(name = "Designation", length = 100)
    private String designation;

    @Column(name = "Couleur", length = 50)
    private String couleur;

    @Column(name = "LibTaille", length = 50)
    private String libTaille;

    @Column(name = "PrixAchat", precision = 24, scale = 6)
    private BigDecimal prixAchat;

    @Column(name = "PrixVente", precision = 24, scale = 6)
    private BigDecimal prixVente;

    @Column(name = "Prix", precision = 38, scale = 2)
    private BigDecimal prix;

    @Column(name = "Quantite")
    private Integer quantite;

    @Column(name = "Remise")
    private Double remise;

    @Column(name = "Total", precision = 24, scale = 6)
    private BigDecimal total;

    @Column(name = "Saison", length = 30)
    private String saison;

    @Column(name = "Motif", length = 30)
    private String motif;

    @Column(name = "TVA")
    private Double tva;

    @Column(name = "DeviseML", length = 10)
    private String deviseML;

    @Column(name = "TauxDeviseML", precision = 24, scale = 6)
    private BigDecimal tauxDeviseML;

    @Column(name = "PrixAchatML", precision = 24, scale = 6)
    private BigDecimal prixAchatML;

    @Column(name = "PrixVenteML", precision = 24, scale = 6)
    private BigDecimal prixVenteML;

    @Column(name = "PrixML", precision = 24, scale = 6)
    private BigDecimal prixML;

    @Column(name = "TotalML", precision = 24, scale = 6)
    private BigDecimal totalML;

    @Column(name = "CodeArticle", length = 50)
    private String codeArticle;

    @Column(name = "CodeBarre", length = 20)
    private String codeBarre;

    @Column(name = "TypeVente", length = 20)
    private String typeVente;

    @Column(name = "IDTicket")
    private Long idTicket;

    @Column(name = "Observation", columnDefinition = "LONGTEXT")
    private String observation;

    @Column(name = "DateVente")
    private LocalDate dateVente;

    @Column(name = "isSynchronised")
    private Integer isSynchronised;

    @Column(name = "IDFactureDiva")
    private Long idFactureDiva;

    @Column(name = "isFacture")
    private Integer isFacture;

    @Column(name = "ligne", length = 45)
    private String ligne;

    @Column(name = "IDArticle")
    private Long idArticle;

    @Column(name = "IDArCouleur")
    private Long idArCouleur;

    @Column(name = "IDTaille")
    private Long idTaille;

    @Column(name = "IDArFamille")
    private Long idArFamille;

    @Column(name = "IDMagasin")
    private Long idMagasin;

    @Column(name = "IDVille")
    private Long idVille;

    @Column(name = "IDRegion")
    private Long idRegion;

    @Column(name = "IDSecteur")
    private Long idSecteur;

    @Column(name = "Pays", length = 50)
    private String pays;

    @Column(name = "Secteur", length = 50)
    private String secteur;

    @Column(name = "Region", length = 50)
    private String region;

    @Column(name = "Ville", length = 165)
    private String ville;

    @Column(name = "ArCouleur", length = 50)
    private String arCouleur;

    @Column(name = "ArFamille", length = 50)
    private String arFamille;

    @Column(name = "ArTaille", length = 50)
    private String arTaille;

    @Column(name = "IDPays")
    private Long idPays;

    @Column(name = "IDLigneTicketClient")
    private Long idLigneTicketClient;

    @Column(name = "CodeSaison", length = 50)
    private String codeSaison;

    @Column(name = "ArSaison", length = 50)
    private String arSaison;

    @Column(name = "DiscountPercentage")
    private Integer discountPercentage;

    @Column(name = "DiscountAmount")
    private Integer discountAmount;

    @Column(name = "TotalHT", precision = 24, scale = 6)
    private BigDecimal totalHT;

    @Column(name = "ArCode", length = 50)
    private String arCode;

    @Column(name = "Article", length = 100)
    private String article;

    @Column(name = "VATAmount")
    private Integer vatAmount;

    @Column(name = "StoreCategory", length = 50)
    private String storeCategory;

    @Column(name = "idArSaison")
    private Integer idArSaison;

    @Column(name = "Defect_trt")
    private Integer defectTrt;

    @Column(name = "LigneTicket", length = 50)
    private String ligneTicket;

    @PrePersist
    public void prePersist() {
        if (stagingImportedAt == null) stagingImportedAt = LocalDateTime.now();
        if (stagingStatus == null) stagingStatus = "PENDING";
    }
}
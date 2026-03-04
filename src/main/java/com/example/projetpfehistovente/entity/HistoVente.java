package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name="histovente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDHistoVente")
    private Long idHistoVente;

    @Column(name = "Date")
    private LocalDate date;

    @Column(name = "Reception")
    private LocalDate reception;

    @Column(name = "CodeMag", length = 20)
    private String codeMag;

    @Column(name = "CodeArticle", length = 50)
    private String codeArticle;

    @Column(name = "Famille", length = 50)
    private String famille;

    @Column(name = "Designation", length = 100)
    private String designation;

    @Column(name = "Couleur", length = 50)
    private String couleur;

    @Column(name = "LibTaille", length = 50)
    private String libTaille;

    @Column(name = "Quantite")
    private Integer quantite;

    @Column(name = "TypeVente", length = 20)
    private String typeVente;

    @Column(name = "Saison", length = 30)
    private String saison;

    @Column(name = "PrixAchat", precision = 24, scale = 6)
    private BigDecimal prixAchat;

    @Column(name = "PrixVente", precision = 24, scale = 6)
    private BigDecimal prixVente;

    @Column(name = "Prix", precision = 24, scale = 6)
    private BigDecimal prix;

    @Column(name = "Remise")
    private Double remise;

    @Column(name = "Total", precision = 24, scale = 6)
    private BigDecimal total;

    @Column(name = "TVA")
    private Double tva;

    @Column(name = "IDArticle")
    private Long idArticle;

    @Column(name = "IDArCouleur")
    private Long idArCouleur;

    @Column(name = "IDArFamille")
    private Long idArFamille;

    @Column(name = "IDMagasin")
    private Long idMagasin;

    @Column(name = "IDTaille")
    private Long idTaille;

    @Column(name = "IDVille")
    private Long idVille;

    @Column(name = "IDRegion")
    private Long idRegion;

    @Column(name = "IDPays")
    private Long idPays;

    @Column(name = "IDSecteur")
    private Long idSecteur;

    @Column(name = "ArFamille", length = 50)
    private String arFamille;

    @Column(name = "ArCouleur", length = 50)
    private String arCouleur;

    @Column(name = "ArTaille", length = 50)
    private String arTaille;

    @Column(name = "Region", length = 50)
    private String region;

    @Column(name = "Ville", length = 165)
    private String ville;

    @Column(name = "Pays", length = 50)
    private String pays;

    @Column(name = "StoreCategory", length = 50)
    private String storeCategory;

    @Column(name = "CodeSaison", length = 50)
    private String codeSaison;

    @Column(name = "ArSaison", length = 50)
    private String arSaison;



}

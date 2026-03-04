package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name="article")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDArticle")
    private Long idArticle;

    @Column(name="Code", length=50)
    private String code;

    @Column(name="Article", length=60)
    private String article;

    @Column(name="Etat")
    private Integer etat;

    @Column(name = "Prix", precision = 24, scale = 6)
    private BigDecimal prix;

    @Column(name = "PrixAchat", precision = 24, scale = 6)
    private BigDecimal prixAchat;

    @Column(name = "Reference", length = 50)
    private String reference;

    @Column(name = "IDGenre")
    private Long idGenre;

    @Column(name = "IDCategorie")
    private Long idCategorie;

    @Column(name = "IDSaison")
    private Long idSaison;

    @Column(name = "IDArFamille")
    private Long idArFamille;

    @Column(name = "IDAr_Couleur")
    private Long idArCouleur;

    @Column(name = "IDArSousFamille")
    private Long idArSousFamille;

    @Column(name = "PrixOutlet", precision = 24, scale = 6)
    private BigDecimal prixOutlet;
}
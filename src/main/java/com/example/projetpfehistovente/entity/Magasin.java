package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "magasin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Magasin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDMagasin")
    private Long idMagasin;

    @Column(name = "Magasin", length = 50)
    private String magasin;

    @Column(name = "Code", length = 20)
    private String code;

    @Column(name = "Etat")
    private Integer etat = 0;

    @Column(name = "IsMP")
    private Integer isMP = 0;

    @Column(name = "IsPF")
    private Integer isPF = 0;

    @Column(name = "IsTampon")
    private Integer isTampon = 0;

    @Column(name = "IsIndisponible")
    private Integer isIndisponible = 0;

    @Column(name = "IsImport")
    private Integer isImport = 0;

    @Column(name = "IsQuarantaine")
    private Integer isQuarantaine = 0;

    @Column(name = "IsSemiFini")
    private Integer isSemiFini = 0;

    @Column(name = "IsPcs")
    private Integer isPcs = 0;

    @Column(name = "parDefaut")
    private Integer parDefaut = 0;

    @Column(name = "IsCoupe")
    private Integer isCoupe = 0;

    @Column(name = "isBoutique")
    private Integer isBoutique = 0;

    @Column(name = "IDDestination")
    private Long idDestination;

    @Column(name = "IdParent")
    private Long idParent;

    @Column(name = "IDBoutique")
    private Long idBoutique;

    @Column(name = "IDPays")
    private Long idPays;

    @Column(name = "IDRegion")
    private Long idRegion;

    @Column(name = "IDVille")
    private Long idVille;

    @Column(name = "IDSecteur")
    private Long idSecteur;

    @Column(name = "IDCategorie")
    private Long idCategorie;
}

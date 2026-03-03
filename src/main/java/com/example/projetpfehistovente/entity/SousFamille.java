package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ar_sfamille")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SousFamille {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDArSousFamille")
    private Long idArSousFamille;

    @Column(name = "SousFamille", length = 50)
    private String sousFamille;

    @Column(name = "Etat")
    private Integer etat;

    @Column(name = "IDArFamille")
    private Long idArFamille;

    @Column(name = "Code", length = 10)
    private String code;

    @Column(name = "IDChaineMontage")
    private Long idChaineMontage;

    @Column(name = "IDCategorieOFpardefaut")
    private Long idCategorieOFpardefaut;
}

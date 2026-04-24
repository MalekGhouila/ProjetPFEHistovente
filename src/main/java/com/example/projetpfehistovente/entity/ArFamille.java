package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "arfamille")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArFamille {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idArFamille;

    @Column(length = 20)
    private String code;

    @Column(length = 100)
    private String famille;

    private Boolean etat = true;

    // ── fields that were missing ──
    @Column(name = "Type")
    private Integer type;

    @Column(name = "CodeDouane", length = 50)
    private String codeDouane;

    @Column(name = "SaisonObligatoire")
    private Integer saisonObligatoire;
}
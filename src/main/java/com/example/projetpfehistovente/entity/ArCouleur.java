package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ar_couleur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArCouleur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idArCouleur;

    @Column(length = 20)
    private String code;

    @Column(length = 100)
    private String couleur;
}

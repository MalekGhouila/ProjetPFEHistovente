package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "saison")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Saison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDSaison")
    private Long idSaison;

    @Column(name = "Saison", length = 50)
    private String saison;

    @Column(name = "Code", length = 20)
    private String code;

    @Column(name = "Etat")
    private Integer etat = 0;

    @Column(name = "Ordre", length = 50)
    private String ordre;

    @Column(name = "IDTypeSaison")
    private Long idTypeSaison;

    @Column(name = "DateDebut")
    private LocalDate dateDebut;

    @Column(name = "DateFin")
    private LocalDate dateFin;
}

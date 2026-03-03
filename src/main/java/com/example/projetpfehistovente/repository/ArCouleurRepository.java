package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.ArCouleur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArCouleurRepository extends JpaRepository<ArCouleur, Long> {
}

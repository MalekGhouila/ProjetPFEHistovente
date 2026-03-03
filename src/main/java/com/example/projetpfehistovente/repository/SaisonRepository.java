package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.Saison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaisonRepository extends JpaRepository<Saison, Long> {
}

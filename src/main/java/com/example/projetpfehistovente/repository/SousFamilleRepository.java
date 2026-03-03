package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.SousFamille;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SousFamilleRepository extends JpaRepository<SousFamille, Long> {
}

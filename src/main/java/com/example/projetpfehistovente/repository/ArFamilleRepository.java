package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.ArFamille;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArFamilleRepository extends JpaRepository<ArFamille, Long> {
}

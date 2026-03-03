package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.HistoVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoVenteRepository extends JpaRepository<HistoVente, Long> {
}

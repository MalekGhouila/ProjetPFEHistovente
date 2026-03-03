package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.Magasin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MagasinRepository extends JpaRepository<Magasin, Long> {
}

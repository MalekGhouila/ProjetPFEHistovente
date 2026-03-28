package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.StoreAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreAnalyticsRepository extends JpaRepository<StoreAnalytics, Long> {

    Optional<StoreAnalytics> findByIdMagasinAndMetricName(Long idMagasin, String metricName);

    List<StoreAnalytics> findByIdMagasin(Long idMagasin);

    void deleteByIdMagasin(Long idMagasin);
}
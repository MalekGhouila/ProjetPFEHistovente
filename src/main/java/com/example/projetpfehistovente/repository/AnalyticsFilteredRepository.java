package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.AnalyticsFiltered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsFilteredRepository extends JpaRepository<AnalyticsFiltered, Long> {

    Optional<AnalyticsFiltered> findByFilterKeyAndMetricName(
            String filterKey, String metricName);

    List<AnalyticsFiltered> findByFilterKey(String filterKey);

    void deleteByFilterKey(String filterKey);

    boolean existsByFilterKey(String filterKey);
}
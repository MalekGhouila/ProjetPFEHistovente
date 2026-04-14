package com.example.projetpfehistovente.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_filtered")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsFiltered {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filter_key")
    private String filterKey;

    @Column(name = "famille")
    private String famille;

    @Column(name = "saison")
    private String saison;

    @Column(name = "code_mag")
    private String codeMag;

    @Column(name = "metric_name")
    private String metricName;

    @Column(name = "metric_value")
    private Double metricValue;

    @Column(name = "metric_text", columnDefinition = "LONGTEXT")
    private String metricText;

    @Column(name = "computed_at")
    private LocalDateTime computedAt;
}
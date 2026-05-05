package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.HistoVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoVenteRawRepository extends JpaRepository<HistoVente, Long> {

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE TypeVente != 'VENTE' OR TypeVente IS NULL", nativeQuery = true)
    Long countNonVente();

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Date IS NULL", nativeQuery = true)
    Long countDateNull();

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Date IS NOT NULL AND Date < '2022-01-01'", nativeQuery = true)
    Long countDateBefore2022();

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Prix < 0 OR Prix > 500", nativeQuery = true)
    Long countPrixOutliers();

    @Query(value = "SELECT COUNT(*) FROM histovente WHERE Quantite < 1 OR Quantite > 100", nativeQuery = true)
    Long countQuantiteOutliers();

    // Top 8 meaningful TypeVente values — groups all transfer codes (-> xxx) into "TRANSFERT"
    @Query(value = """
        SELECT
            CASE
                WHEN TypeVente IN ('VENTE','AVOIR','MOUVEMENT','LIVRAISON','LIV_RETOUR',
                                   'REGUL_STK','ANNULATION','DEVIS')
                    THEN TypeVente
                WHEN TypeVente LIKE '->%'
                    THEN 'TRANSFERT'
                ELSE 'AUTRE'
            END as type,
            COUNT(*) as nb
        FROM histovente
        GROUP BY
            CASE
                WHEN TypeVente IN ('VENTE','AVOIR','MOUVEMENT','LIVRAISON','LIV_RETOUR',
                                   'REGUL_STK','ANNULATION','DEVIS')
                    THEN TypeVente
                WHEN TypeVente LIKE '->%'
                    THEN 'TRANSFERT'
                ELSE 'AUTRE'
            END
        ORDER BY nb DESC
        """, nativeQuery = true)
    List<Object[]> getTypeVenteDistribution();
}
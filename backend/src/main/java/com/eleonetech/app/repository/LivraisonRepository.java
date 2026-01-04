package com.eleonetech.app.repository;

import com.eleonetech.app.entity.Livraison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LivraisonRepository extends JpaRepository<Livraison, Long> {

    @Query("SELECT l FROM Livraison l " +
            "LEFT JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.client c " +
            "LEFT JOIN FETCH l.commande cmd " +
            "WHERE l.isActive = true " +
            "ORDER BY l.dateLivraison DESC, l.id DESC")
    List<Livraison> findAllActiveWithDetails();

    @Query("SELECT l FROM Livraison l " +
            "LEFT JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.client c " +
            "LEFT JOIN FETCH l.commande cmd " +
            "WHERE l.id = :id")
    Livraison findByIdWithDetails(@Param("id") Long id);

    // Générer le prochain numéro BL
    @Query("SELECT l.numeroBL FROM Livraison l " +
            "WHERE YEAR(l.dateLivraison) = :year " +
            "ORDER BY l.id DESC")
    List<String> findLastNumeroBLForYear(@Param("year") int year);

    // Recherche par article
    @Query("SELECT l FROM Livraison l " +
            "LEFT JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.client c " +
            "LEFT JOIN FETCH l.commande cmd " +
            "WHERE a.ref = :articleRef " +
            "AND l.isActive = true " +
            "ORDER BY l.dateLivraison DESC")
    List<Livraison> findByArticleRef(@Param("articleRef") String articleRef);

    // Recherche par client
    @Query("SELECT l FROM Livraison l " +
            "LEFT JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.client c " +
            "LEFT JOIN FETCH l.commande cmd " +
            "WHERE c.nomComplet = :clientNom " +
            "AND l.isActive = true " +
            "ORDER BY l.dateLivraison DESC")
    List<Livraison> findByClientNom(@Param("clientNom") String clientNom);

    // Recherche par commande
    @Query("SELECT l FROM Livraison l " +
            "LEFT JOIN FETCH l.article a " +
            "LEFT JOIN FETCH l.client c " +
            "LEFT JOIN FETCH l.commande cmd " +
            "WHERE cmd.numeroCommandeClient = :numeroCommande " +
            "AND l.isActive = true " +
            "ORDER BY l.dateLivraison DESC")
    List<Livraison> findByNumeroCommande(@Param("numeroCommande") String numeroCommande);

    // Somme des quantités livrées par commande
    @Query("SELECT COALESCE(SUM(l.quantiteLivree), 0) FROM Livraison l " +
            "WHERE l.commande.id = :commandeId AND l.isActive = true")
    Integer sumQuantiteLivreeByCommandeId(@Param("commandeId") Long commandeId);
}
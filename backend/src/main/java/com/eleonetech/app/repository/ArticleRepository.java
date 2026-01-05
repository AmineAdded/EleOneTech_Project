package com.eleonetech.app.repository;

import com.eleonetech.app.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findByRef(String ref);
    Boolean existsByRef(String ref);
    List<Article> findByIsActiveTrue();

    // ✅ SOLUTION : Charger d'abord avec articleClients
    @Query("SELECT DISTINCT a FROM Article a " +
            "LEFT JOIN FETCH a.articleClients ac " +
            "LEFT JOIN FETCH ac.client " +
            "WHERE a.isActive = true " +
            "ORDER BY a.ref ASC")
    List<Article> findAllActiveWithClients();

    // ✅ Ensuite charger articleProcesses séparément
    @Query("SELECT DISTINCT a FROM Article a " +
            "LEFT JOIN FETCH a.articleProcesses ap " +
            "LEFT JOIN FETCH ap.process " +
            "WHERE a IN :articles")
    List<Article> findArticlesWithProcesses(@Param("articles") List<Article> articles);

    // ✅ FIX: Charger les clients d'abord
    @Query("SELECT a FROM Article a " +
            "LEFT JOIN FETCH a.articleClients ac " +
            "LEFT JOIN FETCH ac.client " +
            "WHERE a.id = :id")
    Optional<Article> findByIdWithClients(@Param("id") Long id);

    // ✅ FIX: Charger les processes ensuite
    @Query("SELECT a FROM Article a " +
            "LEFT JOIN FETCH a.articleProcesses ap " +
            "LEFT JOIN FETCH ap.process " +
            "WHERE a.id = :id")
    Optional<Article> findByIdWithProcesses(@Param("id") Long id);


    @Query("SELECT DISTINCT a.ref FROM Article a WHERE a.isActive = true ORDER BY a.ref ASC")
    List<String> findDistinctRefs();

    @Query("SELECT DISTINCT a.article FROM Article a WHERE a.isActive = true ORDER BY a.article ASC")
    List<String> findDistinctNoms();

    @Query("SELECT DISTINCT a.famille FROM Article a WHERE a.famille IS NOT NULL AND a.famille != '' AND a.isActive = true ORDER BY a.famille ASC")
    List<String> findDistinctFamilles();

    @Query("SELECT DISTINCT a.typeProduit FROM Article a WHERE a.typeProduit IS NOT NULL AND a.typeProduit != '' AND a.isActive = true ORDER BY a.typeProduit ASC")
    List<String> findDistinctTypeProduits();

    @Query("SELECT DISTINCT a.typeProcess FROM Article a WHERE a.typeProcess IS NOT NULL AND a.typeProcess != '' AND a.isActive = true ORDER BY a.typeProcess ASC")
    List<String> findDistinctTypeProcess();

    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.articleClients ac LEFT JOIN FETCH ac.client WHERE a.ref = :ref AND a.isActive = true")
    List<Article> findByRefWithClients(@Param("ref") String ref);

    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.articleClients ac LEFT JOIN FETCH ac.client WHERE a.article = :nom AND a.isActive = true")
    List<Article> findByNomWithClients(@Param("nom") String nom);

    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.articleClients ac LEFT JOIN FETCH ac.client WHERE a.famille = :famille AND a.isActive = true")
    List<Article> findByFamilleWithClients(@Param("famille") String famille);

    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.articleClients ac LEFT JOIN FETCH ac.client WHERE a.typeProduit = :typeProduit AND a.isActive = true")
    List<Article> findByTypeProduitWithClients(@Param("typeProduit") String typeProduit);

    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.articleClients ac LEFT JOIN FETCH ac.client WHERE a.typeProcess = :typeProcess AND a.isActive = true")
    List<Article> findByTypeProcessWithClients(@Param("typeProcess") String typeProcess);
}
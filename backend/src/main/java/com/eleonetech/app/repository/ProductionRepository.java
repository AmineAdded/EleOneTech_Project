// backend/src/main/java/com/eleonetech/app/repository/ProductionRepository.java
package com.eleonetech.app.repository;

import com.eleonetech.app.entity.Production;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductionRepository extends JpaRepository<Production, Long> {

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article " +
            "WHERE p.isActive = true " +
            "ORDER BY p.dateProduction DESC, p.id DESC")
    List<Production> findAllActiveWithArticle();

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article a " +
            "WHERE p.id = :id")
    Production findByIdWithArticle(@Param("id") Long id);

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article a " +
            "WHERE a.ref = :articleRef " +
            "AND p.isActive = true " +
            "ORDER BY p.dateProduction DESC")
    List<Production> findByArticleRef(@Param("articleRef") String articleRef);

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article a " +
            "WHERE p.dateProduction = :date " +
            "AND p.isActive = true " +
            "ORDER BY p.dateProduction DESC")
    List<Production> findByDate(@Param("date") LocalDate date);

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article a " +
            "WHERE a.ref = :articleRef " +
            "AND p.dateProduction = :date " +
            "AND p.isActive = true " +
            "ORDER BY p.dateProduction DESC")
    List<Production> findByArticleRefAndDate(
            @Param("articleRef") String articleRef,
            @Param("date") LocalDate date
    );

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article a " +
            "WHERE YEAR(p.dateProduction) = :year " +
            "AND MONTH(p.dateProduction) = :month " +
            "AND p.isActive = true " +
            "ORDER BY p.dateProduction DESC")
    List<Production> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT p FROM Production p " +
            "LEFT JOIN FETCH p.article a " +
            "WHERE a.ref = :articleRef " +
            "AND YEAR(p.dateProduction) = :year " +
            "AND MONTH(p.dateProduction) = :month " +
            "AND p.isActive = true " +
            "ORDER BY p.dateProduction DESC")
    List<Production> findByArticleRefAndYearAndMonth(
            @Param("articleRef") String articleRef,
            @Param("year") int year,
            @Param("month") int month
    );
}
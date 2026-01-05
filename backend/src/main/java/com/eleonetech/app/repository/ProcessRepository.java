package com.eleonetech.app.repository;

import com.eleonetech.app.entity.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessRepository extends JpaRepository<Process, Long> {
    Optional<Process> findByRef(String ref);
    Optional<Process> findByNom(String nom);
    Boolean existsByRef(String ref);
    Boolean existsByNom(String nom);
    List<Process> findByIsActiveTrue();

    @Query("SELECT p FROM Process p WHERE p.isActive = true ORDER BY p.ref ASC")
    List<Process> findAllActiveOrderByRef();
    @Query("SELECT p FROM Process p WHERE p.nom LIKE %:nom% AND p.isActive = true ORDER BY p.ref ASC")
    List<Process> findByNomContaining(@Param("nom") String nom);

    @Query("SELECT DISTINCT p.nom FROM Process p WHERE p.isActive = true ORDER BY p.nom ASC")
    List<String> findDistinctNoms();
}
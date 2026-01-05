package com.eleonetech.app.repository;

import com.eleonetech.app.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByRef(String ref);
    Optional<Client> findByNomComplet(String nomComplet);
    Boolean existsByRef(String ref);
    Boolean existsByNomComplet(String nomComplet);
    List<Client> findByIsActiveTrue();

    @Query("SELECT c FROM Client c WHERE c.isActive = true ORDER BY c.ref ASC")
    List<Client> findAllActiveOrderByRef();

    @Query("SELECT c FROM Client c WHERE c.nomComplet LIKE %:nomComplet% AND c.isActive = true ORDER BY c.ref ASC")
    List<Client> findByNomCompletContaining(@Param("nomComplet") String nomComplet);

    @Query("SELECT c FROM Client c WHERE c.modeTransport = :modeTransport AND c.isActive = true ORDER BY c.ref ASC")
    List<Client> findByModeTransport(@Param("modeTransport") String modeTransport);

    @Query("SELECT c FROM Client c WHERE c.incoTerme = :incoTerme AND c.isActive = true ORDER BY c.ref ASC")
    List<Client> findByIncoTerme(@Param("incoTerme") String incoTerme);

    @Query("SELECT DISTINCT c.nomComplet FROM Client c WHERE c.isActive = true ORDER BY c.nomComplet ASC")
    List<String> findDistinctNomComplets();
}
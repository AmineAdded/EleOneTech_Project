// backend/src/main/java/com/eleonetech/app/controller/CommandeController.java
package com.eleonetech.app.controller;

import com.eleonetech.app.dto.*;
import com.eleonetech.app.service.CommandeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
@Slf4j
public class CommandeController {

    private final CommandeService commandeService;

    @PostMapping
    public ResponseEntity<?> createCommande(@Valid @RequestBody CreateCommandeRequest request) {
        try {
            CommandeResponse response = commandeService.createCommande(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la création de la commande: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CommandeResponse>> getAllCommandes() {
        List<CommandeResponse> commandes = commandeService.getAllCommandes();
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommandeById(@PathVariable Long id) {
        try {
            CommandeResponse response = commandeService.getCommandeById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la récupération de la commande: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/search/article/{articleRef}")
    public ResponseEntity<List<CommandeResponse>> searchByArticleRef(@PathVariable String articleRef) {
        List<CommandeResponse> commandes = commandeService.searchByArticleRef(articleRef);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/search/client/{clientNom}")
    public ResponseEntity<List<CommandeResponse>> searchByClientNom(@PathVariable String clientNom) {
        List<CommandeResponse> commandes = commandeService.searchByClientNom(clientNom);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/search/date-souhaitee/{date}")
    public ResponseEntity<List<CommandeResponse>> searchByDateSouhaitee(@PathVariable String date) {
        List<CommandeResponse> commandes = commandeService.searchByDateSouhaitee(date);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/search/date-ajout/{date}")
    public ResponseEntity<List<CommandeResponse>> searchByDateAjout(@PathVariable String date) {
        List<CommandeResponse> commandes = commandeService.searchByDateAjout(date);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/search/article/{articleRef}/date-souhaitee/{date}")
    public ResponseEntity<List<CommandeResponse>> searchByArticleRefAndDateSouhaitee(
            @PathVariable String articleRef,
            @PathVariable String date) {
        List<CommandeResponse> commandes = commandeService.searchByArticleRefAndDateSouhaitee(articleRef, date);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/search/article/{articleRef}/date-ajout/{date}")
    public ResponseEntity<List<CommandeResponse>> searchByArticleRefAndDateAjout(
            @PathVariable String articleRef,
            @PathVariable String date) {
        List<CommandeResponse> commandes = commandeService.searchByArticleRefAndDateAjout(articleRef, date);
        return ResponseEntity.ok(commandes);
    }

    // Endpoints pour les sommaires
    @GetMapping("/summary/article/{articleRef}")
    public ResponseEntity<CommandeSummaryResponse> getSummaryByArticleRef(@PathVariable String articleRef) {
        CommandeSummaryResponse summary = commandeService.getSummaryByArticleRef(articleRef);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/date-souhaitee/{date}")
    public ResponseEntity<CommandeSummaryResponse> getSummaryByDateSouhaitee(@PathVariable String date) {
        CommandeSummaryResponse summary = commandeService.getSummaryByDateSouhaitee(date);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/date-ajout/{date}")
    public ResponseEntity<CommandeSummaryResponse> getSummaryByDateAjout(@PathVariable String date) {
        CommandeSummaryResponse summary = commandeService.getSummaryByDateAjout(date);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/article/{articleRef}/date-souhaitee/{date}")
    public ResponseEntity<CommandeSummaryResponse> getSummaryByArticleRefAndDateSouhaitee(
            @PathVariable String articleRef,
            @PathVariable String date) {
        CommandeSummaryResponse summary = commandeService.getSummaryByArticleRefAndDateSouhaitee(articleRef, date);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary/article/{articleRef}/date-ajout/{date}")
    public ResponseEntity<CommandeSummaryResponse> getSummaryByArticleRefAndDateAjout(
            @PathVariable String articleRef,
            @PathVariable String date) {
        CommandeSummaryResponse summary = commandeService.getSummaryByArticleRefAndDateAjout(articleRef, date);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCommande(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommandeRequest request) {
        try {
            CommandeResponse response = commandeService.updateCommande(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de la commande: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCommande(@PathVariable Long id) {
        try {
            commandeService.deleteCommande(id);
            return ResponseEntity.ok(new MessageResponse("Commande supprimée avec succès"));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la suppression de la commande: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
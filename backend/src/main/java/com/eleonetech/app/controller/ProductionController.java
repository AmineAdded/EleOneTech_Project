// backend/src/main/java/com/eleonetech/app/controller/ProductionController.java
package com.eleonetech.app.controller;

import com.eleonetech.app.dto.*;
import com.eleonetech.app.service.ProductionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
@Slf4j
public class ProductionController {

    private final ProductionService productionService;

    @PostMapping
    public ResponseEntity<?> createProduction(@Valid @RequestBody CreateProductionRequest request) {
        try {
            ProductionResponse response = productionService.createProduction(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la création de la production: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ProductionResponse>> getAllProductions() {
        List<ProductionResponse> productions = productionService.getAllProductions();
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductionById(@PathVariable Long id) {
        try {
            ProductionResponse response = productionService.getProductionById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la récupération de la production: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/search/article/{articleRef}")
    public ResponseEntity<List<ProductionResponse>> searchByArticleRef(@PathVariable String articleRef) {
        List<ProductionResponse> productions = productionService.searchByArticleRef(articleRef);
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/search/date/{date}")
    public ResponseEntity<List<ProductionResponse>> searchByDate(@PathVariable String date) {
        List<ProductionResponse> productions = productionService.searchByDate(date);
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/search/article/{articleRef}/date/{date}")
    public ResponseEntity<List<ProductionResponse>> searchByArticleRefAndDate(
            @PathVariable String articleRef,
            @PathVariable String date) {
        List<ProductionResponse> productions = productionService.searchByArticleRefAndDate(articleRef, date);
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/search/year/{year}/month/{month}")
    public ResponseEntity<List<ProductionResponse>> searchByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month) {
        List<ProductionResponse> productions = productionService.searchByYearAndMonth(year, month);
        return ResponseEntity.ok(productions);
    }

    @GetMapping("/search/article/{articleRef}/year/{year}/month/{month}")
    public ResponseEntity<List<ProductionResponse>> searchByArticleRefAndYearAndMonth(
            @PathVariable String articleRef,
            @PathVariable int year,
            @PathVariable int month) {
        List<ProductionResponse> productions = productionService.searchByArticleRefAndYearAndMonth(articleRef, year, month);
        return ResponseEntity.ok(productions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductionRequest request) {
        try {
            ProductionResponse response = productionService.updateProduction(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour de la production: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduction(@PathVariable Long id) {
        try {
            productionService.deleteProduction(id);
            return ResponseEntity.ok(new MessageResponse("Production supprimée avec succès"));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la suppression de la production: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
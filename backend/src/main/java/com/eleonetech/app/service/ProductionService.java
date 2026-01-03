// backend/src/main/java/com/eleonetech/app/service/ProductionService.java
package com.eleonetech.app.service;

import com.eleonetech.app.dto.CreateProductionRequest;
import com.eleonetech.app.dto.ProductionResponse;
import com.eleonetech.app.dto.UpdateProductionRequest;
import com.eleonetech.app.entity.Article;
import com.eleonetech.app.entity.Production;
import com.eleonetech.app.repository.ArticleRepository;
import com.eleonetech.app.repository.ProductionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductionService {

    private final ProductionRepository productionRepository;
    private final ArticleRepository articleRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public ProductionResponse createProduction(CreateProductionRequest request) {
        // Trouver l'article
        Article article = articleRepository.findByRef(request.getArticleRef())
                .orElseThrow(() -> new RuntimeException("Article non trouvé: " + request.getArticleRef()));

        // Parser la date
        LocalDate dateProduction = LocalDate.parse(request.getDateProduction(), DATE_FORMATTER);

        // Créer la production
        Production production = Production.builder()
                .article(article)
                .quantite(request.getQuantite())
                .dateProduction(dateProduction)
                .isActive(true)
                .build();

        production = productionRepository.save(production);

        // ✅ METTRE À JOUR LE STOCK
        article.setStock(article.getStock() + request.getQuantite());
        articleRepository.save(article);

        log.info("Production créée: {} unités de {} le {}",
                request.getQuantite(), article.getArticle(), dateProduction);
        log.info("Stock mis à jour: {} -> {}",
                article.getStock() - request.getQuantite(), article.getStock());

        return mapToResponse(production);
    }

    public List<ProductionResponse> getAllProductions() {
        return productionRepository.findAllActiveWithArticle()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductionResponse getProductionById(Long id) {
        Production production = productionRepository.findByIdWithArticle(id);
        if (production == null) {
            throw new RuntimeException("Production non trouvée");
        }
        return mapToResponse(production);
    }

    public List<ProductionResponse> searchByArticleRef(String articleRef) {
        return productionRepository.findByArticleRef(articleRef)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductionResponse> searchByDate(String date) {
        LocalDate localDate = LocalDate.parse(date, DATE_FORMATTER);
        return productionRepository.findByDate(localDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductionResponse> searchByArticleRefAndDate(String articleRef, String date) {
        LocalDate localDate = LocalDate.parse(date, DATE_FORMATTER);
        return productionRepository.findByArticleRefAndDate(articleRef, localDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductionResponse> searchByYearAndMonth(int year, int month) {
        return productionRepository.findByYearAndMonth(year, month)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductionResponse> searchByArticleRefAndYearAndMonth(String articleRef, int year, int month) {
        return productionRepository.findByArticleRefAndYearAndMonth(articleRef, year, month)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductionResponse updateProduction(Long id, UpdateProductionRequest request) {
        Production production = productionRepository.findByIdWithArticle(id);
        if (production == null) {
            throw new RuntimeException("Production non trouvée");
        }

        // ✅ ANNULER L'ANCIENNE QUANTITÉ DU STOCK
        Article oldArticle = production.getArticle();
        int oldQuantite = production.getQuantite();
        oldArticle.setStock(oldArticle.getStock() - oldQuantite);

        // Trouver le nouvel article
        Article newArticle = articleRepository.findByRef(request.getArticleRef())
                .orElseThrow(() -> new RuntimeException("Article non trouvé: " + request.getArticleRef()));

        // Parser la nouvelle date
        LocalDate dateProduction = LocalDate.parse(request.getDateProduction(), DATE_FORMATTER);

        // Mettre à jour la production
        production.setArticle(newArticle);
        production.setQuantite(request.getQuantite());
        production.setDateProduction(dateProduction);

        production = productionRepository.save(production);

        // ✅ AJOUTER LA NOUVELLE QUANTITÉ AU STOCK
        newArticle.setStock(newArticle.getStock() + request.getQuantite());
        articleRepository.save(newArticle);

        // Sauvegarder l'ancien article si différent
        if (!oldArticle.getId().equals(newArticle.getId())) {
            articleRepository.save(oldArticle);
        }

        log.info("Production mise à jour: ID {} - {} unités de {}",
                id, request.getQuantite(), newArticle.getArticle());

        return mapToResponse(production);
    }

    @Transactional
    public void deleteProduction(Long id) {
        Production production = productionRepository.findByIdWithArticle(id);
        if (production == null) {
            throw new RuntimeException("Production non trouvée");
        }

        // ✅ RETIRER LA QUANTITÉ DU STOCK
        Article article = production.getArticle();
        article.setStock(article.getStock() - production.getQuantite());
        articleRepository.save(article);

        productionRepository.deleteById(id);
        log.info("Production supprimée: ID {} - Stock mis à jour pour {}", id, article.getArticle());
    }

    private ProductionResponse mapToResponse(Production production) {
        return ProductionResponse.builder()
                .id(production.getId())
                .articleRef(production.getArticle().getRef())
                .articleNom(production.getArticle().getArticle())
                .quantite(production.getQuantite())
                .dateProduction(production.getDateProduction().format(DATE_FORMATTER))
                .stockActuel(production.getArticle().getStock())
                .isActive(production.getIsActive())
                .createdAt(production.getCreatedAt().format(DATETIME_FORMATTER))
                .updatedAt(production.getUpdatedAt().format(DATETIME_FORMATTER))
                .build();
    }
}
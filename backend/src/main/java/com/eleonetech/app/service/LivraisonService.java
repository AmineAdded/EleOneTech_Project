package com.eleonetech.app.service;

import com.eleonetech.app.dto.*;
import com.eleonetech.app.entity.Article;
import com.eleonetech.app.entity.Client;
import com.eleonetech.app.entity.Commande;
import com.eleonetech.app.entity.Livraison;
import com.eleonetech.app.repository.ArticleRepository;
import com.eleonetech.app.repository.ClientRepository;
import com.eleonetech.app.repository.CommandeRepository;
import com.eleonetech.app.repository.LivraisonRepository;
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
public class LivraisonService {

    private final LivraisonRepository livraisonRepository;
    private final ArticleRepository articleRepository;
    private final ClientRepository clientRepository;
    private final CommandeRepository commandeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public LivraisonResponse createLivraison(CreateLivraisonRequest request) {
        // Vérifier l'article
        Article article = articleRepository.findByRef(request.getArticleRef())
                .orElseThrow(() -> new RuntimeException("Article non trouvé: " + request.getArticleRef()));

        // Vérifier le client
        Client client = clientRepository.findByNomComplet(request.getClientNom())
                .orElseThrow(() -> new RuntimeException("Client non trouvé: " + request.getClientNom()));

        // Trouver la commande
        List<Commande> commandes = commandeRepository.findByArticleRef(request.getArticleRef());
        Commande commande = commandes.stream()
                .filter(c -> c.getNumeroCommandeClient().equals(request.getNumeroCommandeClient()))
                .filter(c -> c.getClient().getNomComplet().equals(request.getClientNom()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        // Vérifier le stock disponible
        if (article.getStock() < request.getQuantiteLivree()) {
            throw new RuntimeException("Stock insuffisant. Stock disponible: " + article.getStock());
        }

        // Vérifier qu'on ne dépasse pas la quantité commandée
        Integer quantiteDejaLivree = livraisonRepository.sumQuantiteLivreeByCommandeId(commande.getId());
        if (quantiteDejaLivree == null) quantiteDejaLivree = 0;

        int quantiteRestante = commande.getQuantite() - quantiteDejaLivree;
        if (request.getQuantiteLivree() > quantiteRestante) {
            throw new RuntimeException("Quantité trop élevée. Quantité restante à livrer: " + quantiteRestante);
        }

        LocalDate dateLivraison = LocalDate.parse(request.getDateLivraison(), DATE_FORMATTER);

        // Générer le numéro BL
        String numeroBL = generateNumeroBL(dateLivraison.getYear());

        // Créer la livraison
        Livraison livraison = Livraison.builder()
                .numeroBL(numeroBL)
                .article(article)
                .client(client)
                .commande(commande)
                .quantiteLivree(request.getQuantiteLivree())
                .dateLivraison(dateLivraison)
                .isActive(true)
                .build();

        livraison = livraisonRepository.save(livraison);

        // ✅ Déduire du stock
        article.setStock(article.getStock() - request.getQuantiteLivree());
        articleRepository.save(article);

        // ✅ NOUVEAU: Vérifier si la commande est totalement livrée
        Integer totalLivre = livraisonRepository.sumQuantiteLivreeByCommandeId(commande.getId());
        if (totalLivre != null && totalLivre >= commande.getQuantite()) {
            commande.setIsActive(false);
            commandeRepository.save(commande);
            log.info("Commande {} totalement livrée - désactivée", commande.getNumeroCommandeClient());
        }

        log.info("Livraison créée: BL {} - {} unités de {} pour {}",
                numeroBL, request.getQuantiteLivree(), article.getArticle(), client.getNomComplet());

        return mapToResponse(livraison);
    }

    private String generateNumeroBL(int year) {
        List<String> lastBLs = livraisonRepository.findLastNumeroBLForYear(year);

        if (lastBLs.isEmpty()) {
            return "1/" + year;
        }

        String lastBL = lastBLs.get(0);
        int lastNumber = Integer.parseInt(lastBL.split("/")[0]);
        return (lastNumber + 1) + "/" + year;
    }

    public List<LivraisonResponse> getAllLivraisons() {
        return livraisonRepository.findAllActiveWithDetails()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LivraisonResponse getLivraisonById(Long id) {
        Livraison livraison = livraisonRepository.findByIdWithDetails(id);
        if (livraison == null) {
            throw new RuntimeException("Livraison non trouvée");
        }
        return mapToResponse(livraison);
    }

    public List<LivraisonResponse> searchByArticleRef(String articleRef) {
        return livraisonRepository.findByArticleRef(articleRef)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LivraisonResponse> searchByClientNom(String clientNom) {
        return livraisonRepository.findByClientNom(clientNom)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LivraisonResponse> searchByNumeroCommande(String numeroCommande) {
        return livraisonRepository.findByNumeroCommande(numeroCommande)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LivraisonResponse updateLivraison(Long id, UpdateLivraisonRequest request) {
        Livraison livraison = livraisonRepository.findByIdWithDetails(id);
        if (livraison == null) {
            throw new RuntimeException("Livraison non trouvée");
        }

        // Restaurer l'ancien stock
        Article oldArticle = livraison.getArticle();
        int oldQuantite = livraison.getQuantiteLivree();
        oldArticle.setStock(oldArticle.getStock() + oldQuantite);

        // Nouveau article
        Article newArticle = articleRepository.findByRef(request.getArticleRef())
                .orElseThrow(() -> new RuntimeException("Article non trouvé: " + request.getArticleRef()));

        Client newClient = clientRepository.findByNomComplet(request.getClientNom())
                .orElseThrow(() -> new RuntimeException("Client non trouvé: " + request.getClientNom()));

        List<Commande> commandes = commandeRepository.findByArticleRef(request.getArticleRef());
        Commande newCommande = commandes.stream()
                .filter(c -> c.getNumeroCommandeClient().equals(request.getNumeroCommandeClient()))
                .filter(c -> c.getClient().getNomComplet().equals(request.getClientNom()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        // Vérifier le stock
        if (newArticle.getStock() < request.getQuantiteLivree()) {
            throw new RuntimeException("Stock insuffisant");
        }

        LocalDate dateLivraison = LocalDate.parse(request.getDateLivraison(), DATE_FORMATTER);

        livraison.setArticle(newArticle);
        livraison.setClient(newClient);
        livraison.setCommande(newCommande);
        livraison.setQuantiteLivree(request.getQuantiteLivree());
        livraison.setDateLivraison(dateLivraison);

        livraison = livraisonRepository.save(livraison);

        // Déduire du nouveau stock
        newArticle.setStock(newArticle.getStock() - request.getQuantiteLivree());
        articleRepository.save(newArticle);

        // Sauvegarder l'ancien article si différent
        if (!oldArticle.getId().equals(newArticle.getId())) {
            articleRepository.save(oldArticle);
        }

        // ✅ NOUVEAU: Vérifier le statut de l'ancienne et nouvelle commande
        Commande oldCommande = commandeRepository.findByIdWithDetails(livraison.getCommande().getId());
        Integer totalLivreOld = livraisonRepository.sumQuantiteLivreeByCommandeId(oldCommande.getId());
        if (totalLivreOld != null && totalLivreOld >= oldCommande.getQuantite()) {
            oldCommande.setIsActive(false);
            commandeRepository.save(oldCommande);
        } else {
            oldCommande.setIsActive(true);
            commandeRepository.save(oldCommande);
        }

        Integer totalLivreNew = livraisonRepository.sumQuantiteLivreeByCommandeId(newCommande.getId());
        if (totalLivreNew != null && totalLivreNew >= newCommande.getQuantite()) {
            newCommande.setIsActive(false);
            commandeRepository.save(newCommande);
        } else {
            newCommande.setIsActive(true);
            commandeRepository.save(newCommande);
        }

        log.info("Livraison mise à jour: ID {}", id);
        return mapToResponse(livraison);
    }

    @Transactional
    public void deleteLivraison(Long id) {
        Livraison livraison = livraisonRepository.findByIdWithDetails(id);
        if (livraison == null) {
            throw new RuntimeException("Livraison non trouvée");
        }

        // Restaurer le stock
        Article article = livraison.getArticle();
        article.setStock(article.getStock() + livraison.getQuantiteLivree());
        articleRepository.save(article);

        // ✅ NOUVEAU: Réactiver la commande si elle était désactivée
        Commande commande = livraison.getCommande();
        commande.setIsActive(true);
        commandeRepository.save(commande);

        livraisonRepository.deleteById(id);
        log.info("Livraison supprimée: ID {} - Commande réactivée", id);
    }

    private LivraisonResponse mapToResponse(Livraison livraison) {
        return LivraisonResponse.builder()
                .id(livraison.getId())
                .numeroBL(livraison.getNumeroBL())
                .articleRef(livraison.getArticle().getRef())
                .articleNom(livraison.getArticle().getArticle())
                .clientNom(livraison.getClient().getNomComplet())
                .numeroCommandeClient(livraison.getCommande().getNumeroCommandeClient())
                .quantiteLivree(livraison.getQuantiteLivree())
                .dateLivraison(livraison.getDateLivraison().format(DATE_FORMATTER))
                .isActive(livraison.getIsActive())
                .createdAt(livraison.getCreatedAt().format(DATETIME_FORMATTER))
                .updatedAt(livraison.getUpdatedAt().format(DATETIME_FORMATTER))
                .build();
    }
}
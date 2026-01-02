package com.eleonetech.app.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La référence de l'article est obligatoire")
    @Column(name = "ref", nullable = false, unique = true, length = 100)
    private String ref;

    @NotBlank(message = "Le nom de l'article est obligatoire")
    @Column(name = "article", nullable = false)
    private String article;

    @Column(name = "famille", length = 100)
    private String famille;

    @Column(name = "sous_famille", length = 100)
    private String sousFamille;

    @Column(name = "type_process", length = 50)
    private String typeProcess;

    @Column(name = "type_produit", length = 50)
    private String typeProduit;

    @Column(name = "prix_unitaire")
    private Double prixUnitaire;

    @Column(name = "mpq")
    private Integer mpq;

    // ✅ NOUVEAU: Colonne Stock
    @Column(name = "stock")
    @Builder.Default
    private Integer stock = 0;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ArticleClient> articleClients = new ArrayList<>();

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ArticleProcess> articleProcesses = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addClient(Client client) {
        ArticleClient articleClient = new ArticleClient();
        articleClient.setArticle(this);
        articleClient.setClient(client);
        articleClients.add(articleClient);
    }

    public void removeClient(Client client) {
        articleClients.removeIf(ac -> ac.getClient().equals(client));
    }

    public void addProcess(com.eleonetech.app.entity.Process process, Double tempsParPF, Integer cadenceMax) {
        ArticleProcess articleProcess = new ArticleProcess();
        articleProcess.setArticle(this);
        articleProcess.setProcess(process);
        articleProcess.setTempsParPF(tempsParPF);
        articleProcess.setCadenceMax(cadenceMax);
        articleProcesses.add(articleProcess);
    }

    public void removeProcess(com.eleonetech.app.entity.Process process) {
        articleProcesses.removeIf(ap -> ap.getProcess().equals(process));
    }
}
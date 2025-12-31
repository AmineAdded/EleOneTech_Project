package com.eleonetech.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateArticleRequest {
    @NotBlank(message = "La référence de l'article est obligatoire")
    private String ref;

    @NotBlank(message = "Le nom de l'article est obligatoire")
    private String article;

    private String famille;
    private String sousFamille;
    private String typeProcess;
    private String typeProduit;
    private Double prixUnitaire;
    private Integer mpq;

    @Builder.Default
    private List<String> clients = new ArrayList<>();

    @Builder.Default
    private List<ProcessDetailDTO> processes = new ArrayList<>();
}

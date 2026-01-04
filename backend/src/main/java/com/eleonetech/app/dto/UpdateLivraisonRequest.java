package com.eleonetech.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLivraisonRequest {
    @NotBlank(message = "La référence de l'article est obligatoire")
    private String articleRef;

    @NotBlank(message = "Le nom du client est obligatoire")
    private String clientNom;

    @NotBlank(message = "Le numéro de commande est obligatoire")
    private String numeroCommandeClient;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantiteLivree;

    @NotNull(message = "La date de livraison est obligatoire")
    private String dateLivraison;
}
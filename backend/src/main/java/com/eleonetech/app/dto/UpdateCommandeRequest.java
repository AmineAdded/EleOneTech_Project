// backend/src/main/java/com/eleonetech/app/dto/UpdateCommandeRequest.java
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
public class UpdateCommandeRequest {
    @NotBlank(message = "La référence de l'article est obligatoire")
    private String articleRef;

    @NotBlank(message = "Le nom du client est obligatoire")
    private String clientNom;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;

    @NotNull(message = "La date souhaitée est obligatoire")
    private String dateSouhaitee; // Format: YYYY-MM-DD
    @NotBlank(message = "Le numéro de commande client est obligatoire")
    private String numeroCommandeClient;

    @NotBlank(message = "Le type de commande est obligatoire")
    private String typeCommande;
}
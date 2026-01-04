// backend/src/main/java/com/eleonetech/app/dto/CommandeResponse.java
package com.eleonetech.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandeResponse {
    private Long id;
    private String articleRef;
    private String articleNom;
    private String clientNom;
    private Integer quantite;
    private String numeroCommandeClient;
    private String typeCommande;
    private String dateSouhaitee;
    private String dateAjout; // createdAt formaté
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;
}
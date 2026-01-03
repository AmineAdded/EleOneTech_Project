// backend/src/main/java/com/eleonetech/app/dto/UpdateProductionRequest.java
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
public class UpdateProductionRequest {
    @NotBlank(message = "La référence de l'article est obligatoire")
    private String articleRef;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;

    @NotNull(message = "La date de production est obligatoire")
    private String dateProduction; // Format: YYYY-MM-DD
}
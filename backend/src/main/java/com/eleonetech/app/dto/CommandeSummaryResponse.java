// backend/src/main/java/com/eleonetech/app/dto/CommandeSummaryResponse.java
package com.eleonetech.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandeSummaryResponse {
    private Integer totalQuantite;
    private Integer nombreCommandes;
    private Integer quantiteFerme;
    private Integer quantitePlanifiee;
}
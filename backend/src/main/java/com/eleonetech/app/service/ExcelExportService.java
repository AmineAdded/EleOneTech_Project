// backend/src/main/java/com/eleonetech/app/service/ExcelExportService.java
package com.eleonetech.app.service;

import com.eleonetech.app.dto.CommandeResponse;
import com.eleonetech.app.dto.LivraisonResponse;
import com.eleonetech.app.dto.ProductionResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ✅ MODIFIÉ: Export pour les Commandes avec quantités livrées
    public byte[] exportCommandesToExcel(List<CommandeResponse> commandes) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Commandes");

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle borderStyle = createBorderStyle(workbook);

            // Header - ✅ Ajout des colonnes quantité livrée et non livrée
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "Ref Article",
                    "Article",
                    "N° Commande Client",
                    "Client",
                    "Quantité Totale",
                    "Quantité Livrée",
                    "Quantité Non Livrée",
                    "Type",
                    "Date Souhaitée",
                    "Date de Création"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (CommandeResponse commande : commandes) {
                Row row = sheet.createRow(rowNum++);

                // Ref Article
                Cell refCell = row.createCell(0);
                refCell.setCellValue(commande.getArticleRef());
                refCell.setCellStyle(borderStyle);

                // Article
                Cell articleCell = row.createCell(1);
                articleCell.setCellValue(commande.getArticleNom());
                articleCell.setCellStyle(borderStyle);

                // N° Commande Client
                Cell numeroCell = row.createCell(2);
                numeroCell.setCellValue(commande.getNumeroCommandeClient());
                numeroCell.setCellStyle(borderStyle);

                // Client
                Cell clientCell = row.createCell(3);
                clientCell.setCellValue(commande.getClientNom());
                clientCell.setCellStyle(borderStyle);

                // Quantité Totale
                Cell quantiteTotaleCell = row.createCell(4);
                quantiteTotaleCell.setCellValue(commande.getQuantite());
                quantiteTotaleCell.setCellStyle(numberStyle);

                // ✅ NOUVEAU: Quantité Livrée
                Cell quantiteLivreeCell = row.createCell(5);
                quantiteLivreeCell.setCellValue(commande.getQuantiteLivree() != null ? commande.getQuantiteLivree() : 0);
                quantiteLivreeCell.setCellStyle(numberStyle);

                // ✅ NOUVEAU: Quantité Non Livrée
                Cell quantiteNonLivreeCell = row.createCell(6);
                quantiteNonLivreeCell.setCellValue(commande.getQuantiteNonLivree() != null ? commande.getQuantiteNonLivree() : commande.getQuantite());
                quantiteNonLivreeCell.setCellStyle(numberStyle);

                // Type
                Cell typeCell = row.createCell(7);
                typeCell.setCellValue(commande.getTypeCommande());
                typeCell.setCellStyle(borderStyle);

                // Date Souhaitée
                Cell dateSouhaiteeCell = row.createCell(8);
                LocalDate dateSouhaitee = LocalDate.parse(commande.getDateSouhaitee());
                dateSouhaiteeCell.setCellValue(dateSouhaitee.format(DATE_FORMATTER));
                dateSouhaiteeCell.setCellStyle(dateStyle);

                // Date de Création
                Cell dateCreationCell = row.createCell(9);
                LocalDate dateCreation = LocalDate.parse(commande.getDateAjout());
                dateCreationCell.setCellValue(dateCreation.format(DATE_FORMATTER));
                dateCreationCell.setCellStyle(dateStyle);
            }

            // Auto-size + padding
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(outputStream);
            log.info("Export Excel Commandes généré : {} commandes", commandes.size());

            return outputStream.toByteArray();
        }
    }

    // ✅ NOUVEAU: Export pour les Livraisons
    public byte[] exportLivraisonsToExcel(List<LivraisonResponse> livraisons) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Livraisons");

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle borderStyle = createBorderStyle(workbook);
            CellStyle blStyle = createBlStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "N° BL",
                    "Ref Article",
                    "Article",
                    "Client",
                    "N° Commande Client",
                    "Quantité Livrée",
                    "Date de Livraison"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (LivraisonResponse livraison : livraisons) {
                Row row = sheet.createRow(rowNum++);

                // N° BL
                Cell blCell = row.createCell(0);
                blCell.setCellValue(livraison.getNumeroBL());
                blCell.setCellStyle(blStyle);

                // Ref Article
                Cell refCell = row.createCell(1);
                refCell.setCellValue(livraison.getArticleRef());
                refCell.setCellStyle(borderStyle);

                // Article
                Cell articleCell = row.createCell(2);
                articleCell.setCellValue(livraison.getArticleNom());
                articleCell.setCellStyle(borderStyle);

                // Client
                Cell clientCell = row.createCell(3);
                clientCell.setCellValue(livraison.getClientNom());
                clientCell.setCellStyle(borderStyle);

                // N° Commande Client
                Cell numeroCell = row.createCell(4);
                numeroCell.setCellValue(livraison.getNumeroCommandeClient());
                numeroCell.setCellStyle(borderStyle);

                // Quantité Livrée
                Cell quantiteCell = row.createCell(5);
                quantiteCell.setCellValue(livraison.getQuantiteLivree());
                quantiteCell.setCellStyle(numberStyle);

                // Date de Livraison
                Cell dateCell = row.createCell(6);
                LocalDate date = LocalDate.parse(livraison.getDateLivraison());
                dateCell.setCellValue(date.format(DATE_FORMATTER));
                dateCell.setCellStyle(dateStyle);
            }

            // Auto-size + padding
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(outputStream);
            log.info("Export Excel Livraisons généré : {} livraisons", livraisons.size());

            return outputStream.toByteArray();
        }
    }

    // Export pour les Productions (existant)
    public byte[] exportProductionsToExcel(List<ProductionResponse> productions) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Productions");

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle borderStyle = createBorderStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "Ref",
                    "Article",
                    "Quantité",
                    "Date",
                    "Stock Actuel"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowNum = 1;
            for (ProductionResponse production : productions) {
                Row row = sheet.createRow(rowNum++);

                // Ref
                Cell refCell = row.createCell(0);
                refCell.setCellValue(production.getArticleRef());
                refCell.setCellStyle(borderStyle);

                // Article
                Cell articleCell = row.createCell(1);
                articleCell.setCellValue(production.getArticleNom());
                articleCell.setCellStyle(borderStyle);

                // Quantité
                Cell quantiteCell = row.createCell(2);
                quantiteCell.setCellValue(production.getQuantite());
                quantiteCell.setCellStyle(numberStyle);

                // Date
                Cell dateCell = row.createCell(3);
                LocalDate date = LocalDate.parse(production.getDateProduction());
                dateCell.setCellValue(date.format(DATE_FORMATTER));
                dateCell.setCellStyle(dateStyle);

                // Stock Actuel
                Cell stockCell = row.createCell(4);
                stockCell.setCellValue(production.getStockActuel());
                stockCell.setCellStyle(numberStyle);
            }

            // Auto-size + padding
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(outputStream);
            log.info("Export Excel Productions généré : {} productions", productions.size());

            return outputStream.toByteArray();
        }
    }
    public byte[] exportEtatCommandesToExcel(
            List<CommandeResponse> commandes,
            String periode,
            Map<String, ClientStat> clientStats,
            TotalStats totalStats) throws IOException {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("État des Commandes");

            // Styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle periodStyle = createPeriodStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle borderStyle = createBorderStyle(workbook);
            CellStyle totalStyle = createTotalStyle(workbook);
            CellStyle fermeStyle = createFermeStyle(workbook);
            CellStyle planifieeStyle = createPlanifieeStyle(workbook);

            int rowNum = 0;

            // ✅ Ligne de titre
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("ÉTAT DES COMMANDES PAR CLIENT");
            titleCell.setCellStyle(createTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));
            titleRow.setHeightInPoints(30);

            // ✅ Ligne de période
            Row periodRow = sheet.createRow(rowNum++);
            Cell periodLabelCell = periodRow.createCell(0);
            periodLabelCell.setCellValue("Période :");
            periodLabelCell.setCellStyle(periodStyle);

            Cell periodValueCell = periodRow.createCell(1);
            periodValueCell.setCellValue(periode);
            periodValueCell.setCellStyle(periodStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 1, 4));

            // Ligne vide
            rowNum++;

            // ✅ SECTION 1: Statistiques globales
            Row statsHeaderRow = sheet.createRow(rowNum++);
            Cell statsHeaderCell = statsHeaderRow.createCell(0);
            statsHeaderCell.setCellValue("📊 STATISTIQUES GLOBALES");
            statsHeaderCell.setCellStyle(createSectionHeaderStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

            // Stats globales
            String[][] globalStats = {
                    {"Nombre de Clients", String.valueOf(totalStats.nombreClients)},
                    {"Nombre de Commandes", String.valueOf(totalStats.totalCommandes)},
                    {"Quantité Totale", String.valueOf(totalStats.totalQuantite)},
                    {"Quantité Ferme", String.valueOf(totalStats.totalFerme)},
                    {"Quantité Planifiée", String.valueOf(totalStats.totalPlanifiee)}
            };

            for (String[] stat : globalStats) {
                Row statRow = sheet.createRow(rowNum++);

                Cell labelCell = statRow.createCell(0);
                labelCell.setCellValue(stat[0]);
                labelCell.setCellStyle(borderStyle);

                Cell valueCell = statRow.createCell(1);
                valueCell.setCellValue(stat[1]);
                valueCell.setCellStyle(numberStyle);
            }

            // Ligne vide
            rowNum++;

            // ✅ SECTION 2: Détails par client - Header
            Row detailsHeaderRow = sheet.createRow(rowNum++);
            Cell detailsHeaderCell = detailsHeaderRow.createCell(0);
            detailsHeaderCell.setCellValue("📋 DÉTAILS PAR CLIENT");
            detailsHeaderCell.setCellStyle(createSectionHeaderStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 4));

            // Header du tableau
            Row tableHeaderRow = sheet.createRow(rowNum++);
            String[] columns = {
                    "Client",
                    "Quantité Totale",
                    "Quantité Ferme",
                    "Quantité Planifiée",
                    "Nombre de Commandes"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = tableHeaderRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // ✅ Données des clients (triées par quantité totale)
            List<ClientStat> sortedStats = clientStats.values().stream()
                    .sorted((a, b) -> Long.compare(b.quantiteTotale, a.quantiteTotale))
                    .collect(Collectors.toList());

            for (ClientStat stat : sortedStats) {
                Row row = sheet.createRow(rowNum++);

                // Client
                Cell clientCell = row.createCell(0);
                clientCell.setCellValue(stat.clientNom);
                clientCell.setCellStyle(borderStyle);

                // Quantité Totale
                Cell totalCell = row.createCell(1);
                totalCell.setCellValue(stat.quantiteTotale);
                totalCell.setCellStyle(numberStyle);

                // Quantité Ferme
                Cell fermeCell = row.createCell(2);
                fermeCell.setCellValue(stat.quantiteFerme);
                fermeCell.setCellStyle(fermeStyle);

                // Quantité Planifiée
                Cell planifieeCell = row.createCell(3);
                planifieeCell.setCellValue(stat.quantitePlanifiee);
                planifieeCell.setCellStyle(planifieeStyle);

                // Nombre de Commandes
                Cell commandesCell = row.createCell(4);
                commandesCell.setCellValue(stat.nombreCommandes);
                commandesCell.setCellStyle(numberStyle);
            }

            // ✅ Ligne TOTAL
            Row totalRow = sheet.createRow(rowNum++);

            Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TOTAL");
            totalLabelCell.setCellStyle(totalStyle);

            Cell totalQuantiteCell = totalRow.createCell(1);
            totalQuantiteCell.setCellValue(totalStats.totalQuantite);
            totalQuantiteCell.setCellStyle(totalStyle);

            Cell totalFermeCell = totalRow.createCell(2);
            totalFermeCell.setCellValue(totalStats.totalFerme);
            totalFermeCell.setCellStyle(totalStyle);

            Cell totalPlanifieeCell = totalRow.createCell(3);
            totalPlanifieeCell.setCellValue(totalStats.totalPlanifiee);
            totalPlanifieeCell.setCellStyle(totalStyle);

            Cell totalCommandesCell = totalRow.createCell(4);
            totalCommandesCell.setCellValue(totalStats.totalCommandes);
            totalCommandesCell.setCellStyle(totalStyle);

            // ✅ Auto-size + padding
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1500);
            }

            workbook.write(outputStream);
            log.info("✅ Export Excel État Commandes généré : {} clients", clientStats.size());

            return outputStream.toByteArray();
        }
    }


    // ================= STYLES =================

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    private CellStyle createBorderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    // ✅ NOUVEAU: Style spécial pour les numéros de BL
    private CellStyle createBlStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.DARK_RED.getIndex());
        style.setFont(font);

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setFillForegroundColor(IndexedColors.ROSE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return style;
    }

    // ✅ Styles supplémentaires nécessaires

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.DARK_RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);

        return style;
    }

    private CellStyle createPeriodStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(IndexedColors.DARK_RED.getIndex());
        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    private CellStyle createSectionHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 13);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);

        return style;
    }

    private CellStyle createTotalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);

        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    private CellStyle createFermeStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setColor(IndexedColors.DARK_GREEN.getIndex());
        font.setBold(true);
        style.setFont(font);

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return style;
    }

    private CellStyle createPlanifieeStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setColor(IndexedColors.DARK_RED.getIndex());
        font.setBold(true);
        style.setFont(font);

        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        style.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return style;
    }

    // ✅ Classes pour les statistiques
    public static class ClientStat {
        public String clientNom;
        public long quantiteTotale;
        public long quantiteFerme;
        public long quantitePlanifiee;
        public int nombreCommandes;

        public ClientStat(String clientNom, long quantiteTotale, long quantiteFerme,
                          long quantitePlanifiee, int nombreCommandes) {
            this.clientNom = clientNom;
            this.quantiteTotale = quantiteTotale;
            this.quantiteFerme = quantiteFerme;
            this.quantitePlanifiee = quantitePlanifiee;
            this.nombreCommandes = nombreCommandes;
        }
    }

    public static class TotalStats {
        public long totalQuantite;
        public long totalFerme;
        public long totalPlanifiee;
        public int totalCommandes;
        public int nombreClients;

        public TotalStats(long totalQuantite, long totalFerme, long totalPlanifiee,
                          int totalCommandes, int nombreClients) {
            this.totalQuantite = totalQuantite;
            this.totalFerme = totalFerme;
            this.totalPlanifiee = totalPlanifiee;
            this.totalCommandes = totalCommandes;
            this.nombreClients = nombreClients;
        }
    }
}
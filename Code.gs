// Google Apps Script for Purchase Request Form Integration
// Spreadsheet ID from the URL of your Google Sheet
const SPREADSHEET_ID = "1c3FV-QxtJtzxZHClYFeYa9UkE-bheHHrKTss56JBAx0";

// Web app setup
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Purchase Request Form')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Handle POST requests from the purchase request form
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Process the request
    const result = processPurchaseRequest(data);
    
    // Return success response in Spanish
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Solicitud de compra registrada exitosamente",
      result: result
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response in Spanish
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error al procesar la solicitud: " + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Process the purchase request and add to the appropriate sheet
function processPurchaseRequest(data) {
  try {
    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Get or create sheet for the specific site
    const site = data.site;
    let sheet = getOrCreateSheet(ss, site);
    
    // Check if sheet has headers, if not add them
    addHeadersIfNeeded(sheet);
    
    // Also get or create the consolidated sheet
    let consolidatedSheet = getOrCreateConsolidatedSheet(ss);
    addHeadersIfNeeded(consolidatedSheet);
    
    // Process each product and add it as a separate row
    const results = [];
    for (let i = 0; i < data.products.length; i++) {
      const product = data.products[i];
      
      // Create a row for this product with all metadata
      const row = [
        new Date(), // Timestamp
        data.name,  // Requestor name
        data.position, // Position
        data.department, // Department
        data.site, // Site
        data.requestType, // Request Type
        data.justification, // Justification
        product.name, // Product Name
        product.quantity, // Quantity
        product.specification || "", // Specification
        "Nueva" // Initial Status - changed to Spanish
      ];
      
      // Append the row to the site-specific sheet
      sheet.appendRow(row);
      
      // Also append the same row to the consolidated sheet
      consolidatedSheet.appendRow(row);
      
      // Format the Status cell in the site-specific sheet
      const lastRow = sheet.getLastRow();
      const statusCell = sheet.getRange(lastRow, 11); // Status is in column 11
      formatStatusCell(statusCell, "Nueva");
      
      // Format the Status cell in the consolidated sheet
      const lastConsolidatedRow = consolidatedSheet.getLastRow();
      const consolidatedStatusCell = consolidatedSheet.getRange(lastConsolidatedRow, 11);
      formatStatusCell(consolidatedStatusCell, "Nueva");
      
      results.push({
        product: product.name,
        row: lastRow,
        consolidatedRow: lastConsolidatedRow
      });
    }
    
    return {
      site: site,
      productsProcessed: results.length,
      details: results
    };
  } catch (error) {
    console.error("Error processing purchase request: " + error.toString());
    throw error;
  }
}

// Get or create the consolidated sheet
function getOrCreateConsolidatedSheet(spreadsheet) {
  const consolidatedSheetName = "Consolidated";
  let sheet = spreadsheet.getSheetByName(consolidatedSheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(consolidatedSheetName);
  }
  
  return sheet;
}

// Get or create a sheet for a specific site
function getOrCreateSheet(spreadsheet, siteName) {
  // Clean the site name to make it a valid sheet name
  const sheetName = cleanSheetName(siteName);
  
  // Try to get the sheet
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // If sheet doesn't exist, create it
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

// Clean the site name to make it a valid sheet name
function cleanSheetName(siteName) {
  // Remove special characters and trim
  return siteName.replace(/[^\w\s]/gi, '').trim();
}

// Add headers to the sheet if it's a new sheet
function addHeadersIfNeeded(sheet) {
  // Check if the sheet has any data
  if (sheet.getLastRow() === 0) {
    // Add headers in Spanish
    const headers = [
      "Fecha",
      "Nombre",
      "Cargo",
      "Área",
      "Sede",
      "Tipo de Solicitud",
      "Justificación",
      "Nombre del Producto",
      "Cantidad",
      "Especificación",
      "Estado"
    ];
    
    // Add headers to the first row
    sheet.appendRow(headers);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#f3f3f3");
    
    // Freeze the header row
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

// Format the status cell based on the status value
function formatStatusCell(cell, status) {
  if (status === "New" || status === "Nueva") {
    cell.setBackground("#FEE2E2"); // Light red
    cell.setFontColor("#B91C1C"); // Dark red
  } else if (status === "In Process" || status === "En Proceso") {
    cell.setBackground("#FEF3C7"); // Light yellow
    cell.setFontColor("#A16207"); // Dark yellow
  } else if (status === "Completed" || status === "Completada") {
    cell.setBackground("#D1FAE5"); // Light green
    cell.setFontColor("#15803D"); // Dark green
  }
}

// Utility function to update status
// This can be called manually from the sheet
function updateStatus(sheetName, row, status) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }
  
  const statusCell = sheet.getRange(row, 11); // Status column is 11
  statusCell.setValue(status);
  formatStatusCell(statusCell, status);
  
  return "Status updated to " + status;
}

// Helper function to get all sheets with data
function getAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();
  const result = [];
  
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    result.push({
      name: sheet.getName(),
      rows: sheet.getLastRow()
    });
  }
  
  return result;
}
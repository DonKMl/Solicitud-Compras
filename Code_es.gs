// Google Apps Script para Integración del Formulario de Solicitud de Compras
// ID de la Hoja de Cálculo de tu Google Sheet
const SPREADSHEET_ID = "REEMPLAZAR_CON_TU_ID_DE_SPREADSHEET";

// Configuración de la aplicación web
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Formulario de Solicitud de Compras')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Manejar solicitudes POST del formulario de solicitud de compra
function doPost(e) {
  try {
    // Analizar los datos JSON entrantes
    const data = JSON.parse(e.postData.contents);
    
    // Procesar la solicitud
    const result = processPurchaseRequest(data);
    
    // Devolver respuesta exitosa
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Solicitud de compra registrada exitosamente",
      result: result
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Devolver respuesta de error
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Error al procesar la solicitud: " + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Procesar la solicitud de compra y añadirla a la hoja correspondiente
function processPurchaseRequest(data) {
  // Abrir la hoja de cálculo
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Obtener o crear hoja para la sede específica
  const site = data.site;
  let sheet = getOrCreateSheet(ss, site);
  
  // Verificar si la hoja tiene encabezados, si no añadirlos
  addHeadersIfNeeded(sheet);
  
  // Procesar cada producto y añadirlo como una fila separada
  const results = [];
  for (let i = 0; i < data.products.length; i++) {
    const product = data.products[i];
    
    // Crear una fila para este producto con todos los metadatos
    const row = [
      new Date(), // Fecha y hora
      data.name,  // Nombre del solicitante
      data.position, // Cargo
      data.department, // Área
      data.site, // Sede
      data.requestType, // Tipo de Solicitud
      data.justification, // Justificación
      product.name, // Nombre del Producto
      product.quantity, // Cantidad
      product.specification || "", // Especificación
      "Nueva" // Estado inicial
    ];
    
    // Añadir la fila a la hoja
    sheet.appendRow(row);
    
    // Formatear la celda de Estado con fondo rojo claro para "Nueva"
    const lastRow = sheet.getLastRow();
    const statusCell = sheet.getRange(lastRow, 11); // Estado está en la columna 11
    formatStatusCell(statusCell, "Nueva");
    
    results.push({
      product: product.name,
      row: lastRow
    });
  }
  
  return {
    site: site,
    productsProcessed: results.length,
    details: results
  };
}

// Obtener o crear una hoja para una sede específica
function getOrCreateSheet(spreadsheet, siteName) {
  // Limpiar el nombre de la sede para que sea un nombre de hoja válido
  const sheetName = cleanSheetName(siteName);
  
  // Intentar obtener la hoja
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Si la hoja no existe, crearla
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

// Limpiar el nombre de la sede para que sea un nombre de hoja válido
function cleanSheetName(siteName) {
  // Eliminar caracteres especiales y recortar
  return siteName.replace(/[^\w\s]/gi, '').trim();
}

// Añadir encabezados a la hoja si es nueva
function addHeadersIfNeeded(sheet) {
  // Verificar si la hoja tiene algún dato
  if (sheet.getLastRow() === 0) {
    // Añadir encabezados
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
    
    // Añadir encabezados a la primera fila
    sheet.appendRow(headers);
    
    // Formatear encabezados
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#f3f3f3");
    
    // Congelar la fila de encabezados
    sheet.setFrozenRows(1);
    
    // Auto-redimensionar columnas
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

// Formatear la celda de estado basado en el valor del estado
function formatStatusCell(cell, status) {
  if (status === "Nueva") {
    cell.setBackground("#FEE2E2"); // Rojo claro
    cell.setFontColor("#B91C1C"); // Rojo oscuro
  } else if (status === "En Proceso") {
    cell.setBackground("#FEF3C7"); // Amarillo claro
    cell.setFontColor("#A16207"); // Amarillo oscuro
  } else if (status === "Completada") {
    cell.setBackground("#D1FAE5"); // Verde claro
    cell.setFontColor("#15803D"); // Verde oscuro
  }
}

// Función de utilidad para actualizar el estado
// Esta puede ser llamada manualmente desde la hoja
function updateStatus(sheetName, row, status) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error("Hoja no encontrada: " + sheetName);
  }
  
  const statusCell = sheet.getRange(row, 11); // La columna de Estado es 11
  statusCell.setValue(status);
  formatStatusCell(statusCell, status);
  
  return "Estado actualizado a " + status;
}

// Función auxiliar para obtener todas las hojas con datos
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
// Google Apps Script para Integración del Formulario de Solicitud de Compras
// ID de la Hoja de Cálculo de tu Google Sheet
const SPREADSHEET_ID = "162Klh46T2IMvxa4yd9CAi_yNPIsp16OZFUp_AfcJhNA";

// Configuración de la aplicación web
function doGet() {
  const htmlOutput = HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario de Solicitud de Compras</title>
    <style>
      /* Estilo básico */
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
        background-color: #f8f9fa;
        color: #333;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      h1 {
        text-align: center;
        color: #1C64F2;
        margin-bottom: 30px;
      }
      
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .logo img {
        max-width: 200px;
        height: auto;
      }
      
      .success-message {
        text-align: center;
        padding: 20px;
        background-color: #D1FAE5;
        border-radius: 4px;
        color: #15803D;
        margin: 20px 0;
      }
      
      .action-button {
        display: block;
        width: 200px;
        margin: 20px auto;
        padding: 10px;
        background-color: #1C64F2;
        color: white;
        text-align: center;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
      }
      
      .action-button:hover {
        background-color: #1356DB;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <!-- Puedes reemplazar con tu logo actual -->
        <img src="https://via.placeholder.com/200x80?text=Inverlache+Logo" alt="Logo de Inverlache">
      </div>
      
      <h1>Formulario de Solicitud de Compras</h1>
      
      <div class="success-message">
        <h2>Este es el backend para el Formulario de Solicitud de Compras</h2>
        <p>El formulario ha sido implementado exitosamente y está listo para recibir solicitudes de compra.</p>
        <p>Las solicitudes enviadas a través del formulario serán automáticamente añadidas a tu hoja de Google.</p>
      </div>
      
      <a href="https://docs.google.com/spreadsheets/d/162Klh46T2IMvxa4yd9CAi_yNPIsp16OZFUp_AfcJhNA" class="action-button" target="_blank">Ver Hoja de Google</a>
    </div>
  </body>
</html>
  `);
  
  htmlOutput.setTitle('Formulario de Solicitud de Compras')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}

// Manejar solicitudes POST del formulario de solicitud de compra
function doPost(e) {
  try {
    console.log("Recibida solicitud POST");
    
    // Analizar los datos JSON entrantes
    const postData = e.postData.contents;
    console.log("Datos recibidos: " + postData);
    
    const data = JSON.parse(postData);
    console.log("Datos parseados correctamente");
    
    // Procesar la solicitud
    const result = processPurchaseRequest(data);
    console.log("Procesamiento completado: " + JSON.stringify(result));
    
    // Devolver respuesta exitosa
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Solicitud de compra registrada exitosamente",
      result: result
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error en doPost: " + error.toString());
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
  try {
    console.log("Iniciando procesamiento de solicitud para: " + data.name);
    
    // Abrir la hoja de cálculo
    console.log("Intentando abrir spreadsheet con ID: " + SPREADSHEET_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log("Spreadsheet abierto correctamente");
    
    // Obtener o crear hoja para la sede específica
    const site = data.site;
    console.log("Procesando sede: " + site);
    let sheet = getOrCreateSheet(ss, site);
    console.log("Hoja obtenida/creada: " + sheet.getName());
    
    // Verificar si la hoja tiene encabezados, si no añadirlos
    addHeadersIfNeeded(sheet);
    console.log("Encabezados verificados/añadidos");
    
    // También obtenemos o creamos la hoja consolidada
    let consolidatedSheet = getOrCreateConsolidatedSheet(ss);
    console.log("Hoja consolidada obtenida/creada");
    
    // Verificar si la hoja consolidada tiene encabezados
    addHeadersIfNeeded(consolidatedSheet);
    console.log("Encabezados de hoja consolidada verificados/añadidos");
    
    // Procesar cada producto y añadirlo como una fila separada
    const results = [];
    console.log("Procesando " + data.products.length + " productos");
    
    for (let i = 0; i < data.products.length; i++) {
      const product = data.products[i];
      console.log("Procesando producto: " + product.name);
      
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
      
      console.log("Añadiendo fila a la hoja de sede");
      // Añadir la fila a la hoja específica de la sede
      sheet.appendRow(row);
      console.log("Fila añadida correctamente a la hoja de sede");
      
      // También añadir la misma fila a la hoja consolidada
      console.log("Añadiendo fila a la hoja consolidada");
      consolidatedSheet.appendRow(row);
      console.log("Fila añadida correctamente a la hoja consolidada");
      
      // Formatear la celda de Estado en la hoja específica
      const lastRow = sheet.getLastRow();
      console.log("Última fila en hoja de sede: " + lastRow);
      const statusCell = sheet.getRange(lastRow, 11); // Estado está en la columna 11
      formatStatusCell(statusCell, "Nueva");
      console.log("Celda de estado formateada en hoja de sede");
      
      // Formatear la celda de Estado en la hoja consolidada
      const lastConsolidatedRow = consolidatedSheet.getLastRow();
      console.log("Última fila en hoja consolidada: " + lastConsolidatedRow);
      const consolidatedStatusCell = consolidatedSheet.getRange(lastConsolidatedRow, 11);
      formatStatusCell(consolidatedStatusCell, "Nueva");
      console.log("Celda de estado formateada en hoja consolidada");
      
      results.push({
        product: product.name,
        row: lastRow,
        consolidatedRow: lastConsolidatedRow
      });
    }
    
    console.log("Procesamiento completado exitosamente");
    return {
      site: site,
      productsProcessed: results.length,
      details: results
    };
  } catch (error) {
    console.error("Error en processPurchaseRequest: " + error.toString());
    throw error;
  }
}

// Obtener o crear una hoja para la sede específica
function getOrCreateSheet(spreadsheet, siteName) {
  try {
    // Limpiar el nombre de la sede para que sea un nombre de hoja válido
    const sheetName = cleanSheetName(siteName);
    console.log("Nombre de hoja limpio: " + sheetName);
    
    // Intentar obtener la hoja
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Si la hoja no existe, crearla
    if (!sheet) {
      console.log("Hoja no encontrada, creando nueva hoja: " + sheetName);
      sheet = spreadsheet.insertSheet(sheetName);
      console.log("Hoja creada correctamente");
    } else {
      console.log("Hoja existente encontrada: " + sheetName);
    }
    
    return sheet;
  } catch (error) {
    console.error("Error en getOrCreateSheet: " + error.toString());
    throw error;
  }
}

// Obtener o crear la hoja consolidada
function getOrCreateConsolidatedSheet(spreadsheet) {
  try {
    // Intentar obtener la hoja consolidada
    const consolidatedSheetName = "Consolidated";
    let sheet = spreadsheet.getSheetByName(consolidatedSheetName);
    
    // Si la hoja no existe, crearla
    if (!sheet) {
      console.log("Hoja consolidada no encontrada, creando nueva hoja");
      sheet = spreadsheet.insertSheet(consolidatedSheetName);
      console.log("Hoja consolidada creada correctamente");
    } else {
      console.log("Hoja consolidada existente encontrada");
    }
    
    return sheet;
  } catch (error) {
    console.error("Error en getOrCreateConsolidatedSheet: " + error.toString());
    throw error;
  }
}

// Limpiar el nombre de la sede para que sea un nombre de hoja válido
function cleanSheetName(siteName) {
  // Eliminar caracteres especiales y recortar
  return siteName.replace(/[^\w\s]/gi, '').trim();
}

// Añadir encabezados a la hoja si es nueva
function addHeadersIfNeeded(sheet) {
  try {
    // Verificar si la hoja tiene algún dato
    const lastRow = sheet.getLastRow();
    console.log("Última fila en verificación de encabezados: " + lastRow);
    
    if (lastRow === 0) {
      console.log("Hoja vacía, añadiendo encabezados");
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
      console.log("Encabezados añadidos");
      
      // Formatear encabezados
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#f3f3f3");
      console.log("Encabezados formateados");
      
      // Congelar la fila de encabezados
      sheet.setFrozenRows(1);
      console.log("Fila de encabezados congelada");
      
      // Auto-redimensionar columnas
      for (let i = 1; i <= headers.length; i++) {
        sheet.autoResizeColumn(i);
      }
      console.log("Columnas redimensionadas");
    } else {
      console.log("Hoja ya tiene datos, no se añaden encabezados");
    }
  } catch (error) {
    console.error("Error en addHeadersIfNeeded: " + error.toString());
    throw error;
  }
}

// Formatear la celda de estado basado en el valor del estado
function formatStatusCell(cell, status) {
  try {
    console.log("Formateando celda de estado: " + status);
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
    console.log("Celda formateada correctamente");
  } catch (error) {
    console.error("Error en formatStatusCell: " + error.toString());
    throw error;
  }
}

// Función de utilidad para actualizar el estado
// Esta puede ser llamada manualmente desde la hoja
function updateStatus(sheetName, row, status) {
  try {
    console.log("Actualizando estado en hoja: " + sheetName + ", fila: " + row + ", estado: " + status);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error("Hoja no encontrada: " + sheetName);
    }
    
    const statusCell = sheet.getRange(row, 11); // La columna de Estado es 11
    statusCell.setValue(status);
    formatStatusCell(statusCell, status);
    
    console.log("Estado actualizado correctamente");
    return "Estado actualizado a " + status;
  } catch (error) {
    console.error("Error en updateStatus: " + error.toString());
    throw error;
  }
}

// Función auxiliar para obtener todas las hojas con datos
function getAllSheets() {
  try {
    console.log("Obteniendo todas las hojas");
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
    
    console.log("Hojas obtenidas: " + result.length);
    return result;
  } catch (error) {
    console.error("Error en getAllSheets: " + error.toString());
    throw error;
  }
}
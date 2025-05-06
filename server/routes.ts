import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { submitPurchaseRequest, getCachedRequests } from "./google-sheets";
import { PurchaseRequest } from "@/types";

// Helper function to validate a purchase request
function validatePurchaseRequest(request: Partial<PurchaseRequest>): { isValid: boolean; message?: string } {
  const { name, position, department, site, requestType, justification, products } = request;
  
  if (!name || !position || !department || !site || !requestType || !justification) {
    return { isValid: false, message: "Missing required fields" };
  }

  if (!Array.isArray(products) || products.length === 0) {
    return { isValid: false, message: "At least one product is required" };
  }

  // Validate each product
  for (const product of products) {
    if (!product.name || !product.quantity) {
      return { isValid: false, message: "Each product must have a name and quantity" };
    }
  }

  return { isValid: true };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Submit purchase request endpoint
  app.post("/api/purchase-request", async (req: Request, res: Response) => {
    try {
      const purchaseRequest: PurchaseRequest = req.body;

      // Validate request body
      const validation = validatePurchaseRequest(purchaseRequest);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
      }

      // Submit the request to Google Sheets
      await submitPurchaseRequest(purchaseRequest);

      // Return successful response
      res.status(200).json({ 
        message: "Purchase request submitted successfully",
        success: true
      });
    } catch (error: any) {
      console.error("Error submitting purchase request:", error);
      
      // Return more informative error message
      res.status(500).json({ 
        message: "Your request has been recorded locally, but could not be submitted to the spreadsheet at this time. An administrator will process it later.",
        error: error.message || "Unknown error",
        success: false 
      });
    }
  });

  // Get cached requests (for debugging or admin purposes)
  app.get("/api/cached-requests", (req: Request, res: Response) => {
    try {
      const requests = getCachedRequests();
      res.status(200).json({ 
        count: requests.length,
        requests 
      });
    } catch (error: any) {
      console.error("Error retrieving cached requests:", error);
      res.status(500).json({ message: "Failed to retrieve cached requests" });
    }
  });

  // API status endpoint
  app.get("/api/status", (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: "online",
      timestamp: new Date().toISOString(),
      googleSheets: process.env.GOOGLE_SHEETS_APP_URL ? "configured" : "not configured"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

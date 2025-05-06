import axios from "axios";
import { PurchaseRequest } from "@/types";

// Google Sheets Web App URL from the Google Apps Script deployment
// This should be replaced with the actual deployed Google Apps Script URL 
// which you can get after deploying the Code.gs script as a web app
const GOOGLE_SHEETS_APP_URL = process.env.GOOGLE_SHEETS_APP_URL;

// Local storage for requests when Google Sheets is unavailable
let cachedRequests: Array<PurchaseRequest & { timestamp: string }> = [];

export async function submitPurchaseRequest(request: PurchaseRequest): Promise<void> {
  try {
    // Prepare data for Google Sheets
    const formattedRequest = {
      ...request,
      timestamp: new Date().toISOString(),
    };

    // Log the configured Google Sheets URL (redacted for security)
    console.log(`Google Sheets App URL configured: ${GOOGLE_SHEETS_APP_URL ? "YES" : "NO"}`);
    
    // If no Google Sheets URL is configured, store locally and log
    if (!GOOGLE_SHEETS_APP_URL) {
      console.log(`No Google Sheets App URL configured. Storing request locally.`);
      cachedRequests.push(formattedRequest);
      console.log(`Request stored locally. Total cached: ${cachedRequests.length}`);
      
      // Log the request for debugging
      console.log(`Request data for site: ${formattedRequest.site}`);
      console.log(`Products: ${formattedRequest.products.length}`);
      
      // Simulate successful submission
      return;
    }

    console.log(`Sending request to Google Sheets: ${formattedRequest.name} - ${formattedRequest.site}`);
    console.log(`Products count: ${formattedRequest.products.length}`);
    
    // Send data to Google Apps Script Web App
    const response = await axios.post(GOOGLE_SHEETS_APP_URL, formattedRequest, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // Extended to 30 second timeout
    });

    console.log(`Google Sheets response status: ${response.status}`);
    console.log(`Google Sheets response data:`, response.data);

    if (response.status !== 200) {
      throw new Error(`Failed to submit to Google Sheets: ${response.statusText}`);
    }

    return;
  } catch (error: any) {
    console.error("Error submitting to Google Sheets:", error.message);
    console.error("Error details:", error.response?.data || "No response data");
    
    // Store the request locally as a fallback
    cachedRequests.push({ 
      ...request, 
      timestamp: new Date().toISOString() 
    });
    
    console.log(`Request stored locally due to error. Total cached: ${cachedRequests.length}`);
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Helper function to get the cached requests (for debugging or future recovery)
export function getCachedRequests() {
  return [...cachedRequests];
}

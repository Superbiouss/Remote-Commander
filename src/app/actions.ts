/**
 * @fileoverview This file contains "server actions" for the Next.js application.
 * Server actions are functions that run exclusively on the server and can be called
 * directly from client-side components. They are the primary way this app communicates
 * with the backend, whether it's calling an AI flow or communicating with the local PC server.
 *
 * Using the 'use server' directive at the top is required for these functions to be
 * recognized as server actions.
 */
"use server";

import { filterApps } from "@/ai/flows/smart-app-filtering";
import { z } from "zod";

// Define a Zod schema for validating the data needed to launch an app.
// This helps prevent invalid data from being processed.
const launchAppSchema = z.object({
  appName: z.string().min(1, "App name cannot be empty."),
  localServerUrl: z.string().url("Please set a valid server URL in settings."),
});

// Define a TypeScript type for the form state, used for handling form submissions with React's useActionState hook.
export type FormState = {
  success: boolean;
  message: string;
};

/**
 * Server Action: launchApp
 * This function is called when a user clicks on an app card to launch it.
 * It sends a POST request to the local server running on the user's PC.
 * @param prevState - The previous state of the form, used by the useActionState hook.
 * @param formData - The data from the submitted form, which includes the app name and server URL.
 * @returns A promise that resolves to a new form state object, indicating success or failure.
 */
export async function launchApp(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const appName = formData.get("appName") as string;
  const localServerUrl = formData.get("localServerUrl") as string;
  
  // Validate the incoming form data against the schema.
  const validation = launchAppSchema.safeParse({ appName, localServerUrl });

  if (!validation.success) {
    const message = validation.error.errors.map((e) => e.message).join(", ");
    return { success: false, message: `Invalid input: ${message}` };
  }

  // If validation passes, attempt to send the request to the local PC server.
  try {
    const response = await fetch(localServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: appName }),
      cache: 'no-store', // Ensure we always get a fresh response.
    });
    
    if (!response.ok) {
        // If the server responds with an error, try to parse it, otherwise use a generic message.
        const errorData = await response.json().catch(() => ({ message: 'Failed to launch app.' }));
        throw new Error(errorData.message || 'Network response was not ok.');
    }

    const data = await response.json();
    return { success: data.success, message: data.message || `${appName} launched successfully.` };
  } catch (error) {
    // Handle network errors or other exceptions.
    console.error("Launch error:", error);
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
       return { success: false, message: `Could not connect to your PC. Is the server running at ${localServerUrl}?` };
    }
    return { success: false, message: `Failed to launch ${appName}. Check if the local server is running.` };
  }
}

/**
 * Server Action: filterAppsAction
 * This function is called when the user types in the search bar.
 * It takes the search query and the list of all app names and calls the Genkit AI flow.
 * @param query - The user's natural language search query.
 * @param apps - An array of all available application names.
 * @returns A promise that resolves to an array of app names that match the query.
 */
export async function filterAppsAction(
  query: string,
  apps: string[]
): Promise<string[]> {
  // If the query is empty, return all apps immediately without calling the AI.
  if (!query) {
    return apps;
  }
  try {
    // Call the AI flow to get the filtered list.
    const result = await filterApps({ query, apps });
    return result.filteredApps;
  } catch (error) {
    // If the AI call fails, log the error and fall back to a simple text search.
    // This makes the app more robust.
    console.error("AI filtering error:", error);
    return apps.filter((app) =>
      app.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Server Action: getAppsFromPC
 * Fetches the list of available applications from the user's local PC server.
 * This is called when the app first connects or when the user wants to refresh the list.
 * @param serverUrl - The URL of the local PC server.
 * @returns A promise that resolves to an array of application names. Returns an empty array on failure.
 */
export async function getAppsFromPC(serverUrl: string): Promise<string[]> {
    if(!serverUrl) return [];
    try {
        const response = await fetch(`${serverUrl}/apps`, {
            method: 'GET',
            cache: 'no-store' // We always want the latest list of apps.
        });
        if(!response.ok) {
            console.error('Failed to fetch apps from PC');
            return [];
        }
        const data = await response.json();
        return data.apps || [];
    } catch(e) {
        console.error('Error fetching apps from PC:', e);
        return [];
    }
}


/**
 * Server Action: testConnection
 * A simple utility function to check if the local server is reachable.
 * It tries to fetch the /apps endpoint.
 * @param serverUrl - The URL of the local PC server.
 * @returns A promise that resolves to true if the connection is successful, false otherwise.
 */
export async function testConnection(serverUrl: string): Promise<boolean> {
  if (!serverUrl) return false;
  try {
    const response = await fetch(`${serverUrl}/apps`, {
      method: "GET",
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
}

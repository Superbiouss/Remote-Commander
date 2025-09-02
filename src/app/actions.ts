"use server";

import { filterApps } from "@/ai/flows/smart-app-filtering";
import { z } from "zod";

const launchAppSchema = z.object({
  appName: z.string().min(1, "App name cannot be empty."),
  localServerUrl: z.string().url("Invalid server URL format.")
});

export async function launchApp(appName: string, localServerUrl: string) {
  const validation = launchAppSchema.safeParse({ appName, localServerUrl });
  if (!validation.success) {
    const message = validation.error.errors.map(e => e.message).join(', ');
    return { success: false, message: `Invalid input: ${message}` };
  }

  try {
    const response = await fetch(localServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: appName }),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to launch app.' }));
        throw new Error(errorData.message || 'Network response was not ok.');
    }

    const data = await response.json();
    return { success: data.success, message: data.message || `${appName} launched successfully.` };
  } catch (error) {
    console.error("Launch error:", error);
    if (error instanceof Error && error.message.includes('fetch')) {
       return { success: false, message: `Could not connect to your PC. Is the local server running at ${localServerUrl}?` };
    }
    return { success: false, message: `Failed to launch ${appName}.` };
  }
}

export async function filterAppsAction(
  query: string,
  apps: string[]
): Promise<string[]> {
  if (!query) {
    return apps;
  }
  try {
    const result = await filterApps({ query, apps });
    return result.filteredApps;
  } catch (error) {
    console.error("AI filtering error:", error);
    // Fallback to simple text filtering on error
    return apps.filter((app) =>
      app.toLowerCase().includes(query.toLowerCase())
    );
  }
}

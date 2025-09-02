"use server";

import { filterApps } from "@/ai/flows/smart-app-filtering";
import { z } from "zod";

const launchAppSchema = z.object({
  appName: z.string().min(1, "App name cannot be empty."),
  localServerUrl: z.string().url("Please set a valid server URL in settings."),
});

export type FormState = {
  success: boolean;
  message: string;
};

export async function launchApp(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const appName = formData.get("appName") as string;
  const localServerUrl = formData.get("localServerUrl") as string;
  
  const validation = launchAppSchema.safeParse({ appName, localServerUrl });

  if (!validation.success) {
    const message = validation.error.errors.map((e) => e.message).join(", ");
    return { success: false, message: `Invalid input: ${message}` };
  }

  try {
    const response = await fetch(localServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: appName }),
      cache: 'no-store',
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to launch app.' }));
        throw new Error(errorData.message || 'Network response was not ok.');
    }

    const data = await response.json();
    return { success: data.success, message: data.message || `${appName} launched successfully.` };
  } catch (error) {
    console.error("Launch error:", error);
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
       return { success: false, message: `Could not connect to your PC. Is the server running at ${localServerUrl}?` };
    }
    return { success: false, message: `Failed to launch ${appName}. Check if the local server is running.` };
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

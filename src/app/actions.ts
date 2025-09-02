"use server";

import { filterApps } from "@/ai/flows/smart-app-filtering";
import { z } from "zod";

const launchAppSchema = z.string().min(1, "App name cannot be empty.");

export async function launchApp(appName: string) {
  const validation = launchAppSchema.safeParse(appName);
  if (!validation.success) {
    return { success: false, message: "Invalid app name." };
  }

  // In a real application, you would make a POST request to your laptop's server.
  // For example:
  // try {
  //   const response = await fetch('http://<laptop-ip>:5000/launch', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ app: appName }),
  //   });
  //   if (!response.ok) {
  //     throw new Error('Failed to launch app.');
  //   }
  //   return { success: true, message: `${appName} launched successfully.` };
  // } catch (error) {
  //   console.error("Launch error:", error);
  //   return { success: false, message: `Failed to launch ${appName}.` };
  // }

  console.log(`Simulating launch for: ${appName}`);
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true, message: `Request to launch ${appName} sent.` };
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

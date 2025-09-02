'use server';

/**
 * @fileOverview Implements dynamic app filtering using natural language queries.
 *
 * - `filterApps` -  Filters a list of applications based on a natural language query.
 * - `DynamicAppFilteringInput` - The input type for the `filterApps` function.
 * - `DynamicAppFilteringOutput` - The return type for the `filterApps` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicAppFilteringInputSchema = z.object({
  query: z.string().describe('The natural language query to filter the apps.'),
  apps: z.array(z.string()).describe('The list of application names to filter.'),
});
export type DynamicAppFilteringInput = z.infer<typeof DynamicAppFilteringInputSchema>;

const DynamicAppFilteringOutputSchema = z.object({
  filteredApps: z
    .array(z.string())
    .describe('The list of application names that match the query.'),
});
export type DynamicAppFilteringOutput = z.infer<typeof DynamicAppFilteringOutputSchema>;

export async function filterApps(input: DynamicAppFilteringInput): Promise<DynamicAppFilteringOutput> {
  return dynamicAppFilteringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicAppFilteringPrompt',
  input: {schema: DynamicAppFilteringInputSchema},
  output: {schema: DynamicAppFilteringOutputSchema},
  prompt: `You are an AI assistant designed to filter a list of applications based on a user's natural language query.\n\nThe user will provide a query and a list of application names. Your task is to return a list of application names that match the query.\n\nHere are the applications:\n{{#each apps}}\n- \"{{this}}\"\n{{/each}}\n\nHere is the query: {{query}}\n\nBased on the query, the filtered list of applications is:\n  `,
});

const dynamicAppFilteringFlow = ai.defineFlow(
  {
    name: 'dynamicAppFilteringFlow',
    inputSchema: DynamicAppFilteringInputSchema,
    outputSchema: DynamicAppFilteringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

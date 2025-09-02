'use server';

/**
 * @fileOverview Implements dynamic app filtering using natural language queries.
 *
 * - `filterApps` -  Filters a list of applications based on a natural language query.
 * - `SmartAppFilteringInput` - The input type for the `filterApps` function.
 * - `SmartAppFilteringOutput` - The return type for the `filterApps` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartAppFilteringInputSchema = z.object({
  query: z.string().describe('The natural language query to filter the apps.'),
  apps: z.array(z.string()).describe('The list of application names to filter.'),
});
export type SmartAppFilteringInput = z.infer<typeof SmartAppFilteringInputSchema>;

const SmartAppFilteringOutputSchema = z.object({
  filteredApps: z
    .array(z.string())
    .describe('The list of application names that match the query.'),
});
export type SmartAppFilteringOutput = z.infer<typeof SmartAppFilteringOutputSchema>;

export async function filterApps(input: SmartAppFilteringInput): Promise<SmartAppFilteringOutput> {
  return smartAppFilteringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartAppFilteringPrompt',
  input: {schema: SmartAppFilteringInputSchema},
  output: {schema: SmartAppFilteringOutputSchema},
  prompt: `You are an AI assistant designed to filter a list of applications based on a user's natural language query.

  The user will provide a query and a list of application names. Your task is to return a list of application names that match the query.

  Here are the applications:
  {{#each apps}}
  - "{{this}}"
  {{/each}}

  Here is the query: {{query}}

  Based on the query, the filtered list of applications is:
  `,
});

const smartAppFilteringFlow = ai.defineFlow(
  {
    name: 'smartAppFilteringFlow',
    inputSchema: SmartAppFilteringInputSchema,
    outputSchema: SmartAppFilteringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

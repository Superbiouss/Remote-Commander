'use server';

/**
 * @fileOverview Implements dynamic app filtering using a natural language query.
 * This file defines a Genkit "flow" that takes a user's text query and a list of apps,
 * and it uses a generative AI model to determine which apps match the query.
 *
 * This showcases how to use Genkit for structured output, where the AI is asked to
 * return a result that conforms to a specific schema.
 *
 * Exports:
 * - `filterApps` -  An asynchronous function that filters a list of applications based on a natural language query.
 * - `SmartAppFilteringInput` - The TypeScript type for the `filterApps` function's input.
 * - `SmartAppFilteringOutput` - The TypeScript type for the `filterApps` function's return value.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Defines the schema for the input data using Zod.
 * This ensures that any data passed to the flow is correctly shaped.
 * Zod schemas are also used by Genkit to validate input and output.
 * The `.describe()` method adds a description that the AI model can use for context.
 */
const SmartAppFilteringInputSchema = z.object({
  query: z.string().describe('The natural language query to filter the apps.'),
  apps: z.array(z.string()).describe('The list of application names to filter.'),
});
// Export the TypeScript type inferred from the Zod schema.
export type SmartAppFilteringInput = z.infer<typeof SmartAppFilteringInputSchema>;

/**
 * Defines the schema for the output data.
 * By specifying an output schema, we instruct the AI model to format its response
 * as a JSON object that matches this structure. This is a powerful feature for
 * getting reliable, structured data from the model.
 */
const SmartAppFilteringOutputSchema = z.object({
  filteredApps: z
    .array(z.string())
    .describe('The list of application names that match the query.'),
});
// Export the TypeScript type for the output.
export type SmartAppFilteringOutput = z.infer<typeof SmartAppFilteringOutputSchema>;

/**
 * This is the main function that will be called from our application's server actions.
 * It serves as a clean, callable wrapper around the Genkit flow.
 * @param input An object containing the user's query and the list of apps.
 * @returns A promise that resolves to an object containing the filtered list of apps.
 */
export async function filterApps(input: SmartAppFilteringInput): Promise<SmartAppFilteringOutput> {
  // We call the Genkit flow and return its result.
  return smartAppFilteringFlow(input);
}

/**
 * Defines a Genkit "prompt". A prompt is a template that will be sent to the generative model.
 * It includes the schemas for input and output, which helps the model understand what to expect
 * and how to respond.
 */
const prompt = ai.definePrompt({
  name: 'smartAppFilteringPrompt', // A unique name for the prompt.
  input: {schema: SmartAppFilteringInputSchema}, // The input schema defined above.
  output: {schema: SmartAppFilteringOutputSchema}, // The output schema defined above.
  // The prompt string itself. This uses Handlebars templating (`{{...}}`) to insert
  // data from the input object. The text guides the AI on its task.
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

/**
 * Defines a Genkit "flow". A flow is a function that orchestrates AI calls and other logic.
 * This flow takes the input, calls the prompt we defined, and returns the structured output.
 */
const smartAppFilteringFlow = ai.defineFlow(
  {
    name: 'smartAppFilteringFlow', // A unique name for the flow.
    inputSchema: SmartAppFilteringInputSchema,
    outputSchema: SmartAppFilteringOutputSchema,
  },
  async input => {
    // Execute the prompt with the given input.
    const {output} = await prompt(input);
    // The result is the structured object we defined in our output schema.
    // We use the non-null assertion (!) because we expect the model to always return a valid output.
    return output!;
  }
);

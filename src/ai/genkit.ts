/**
 * @fileoverview This file initializes and configures the Genkit AI instance.
 * Genkit is a framework that helps connect to and orchestrate generative AI models.
 *
 * To learn more about Genkit, see the documentation: https://firebase.google.com/docs/genkit
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * The 'ai' object is the central point for interacting with Genkit.
 * It's configured here with the necessary plugins.
 */
export const ai = genkit({
  // The 'plugins' array is where you configure which AI providers you want to use.
  // Here, we're using the 'googleAI' plugin to connect to Google's AI models (like Gemini).
  // You can add other plugins here to connect to different model providers.
  plugins: [googleAI()],

  // The 'model' property sets the default generative model to be used across the application.
  // You can change this to any other supported Gemini model.
  //
  // For example, to use Gemini 2.5 Pro, you would change it to:
  // model: 'googleai/gemini-2.5-pro',
  //
  // To see a list of available models, visit:
  // https://firebase.google.com/docs/genkit/models#supported-models
  model: 'googleai/gemini-2.5-flash',
});

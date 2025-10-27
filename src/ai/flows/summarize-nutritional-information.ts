'use server';

/**
 * @fileOverview Summarizes the nutritional information of a recipe.
 *
 * - summarizeNutritionalInformation - A function that summarizes the nutritional information of a recipe.
 * - SummarizeNutritionalInformationInput - The input type for the summarizeNutritionalInformation function.
 * - SummarizeNutritionalInformationOutput - The return type for the summarizeNutritionalInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNutritionalInformationInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients in the recipe.'),
  instructions: z.array(z.string()).describe('The detailed, step-by-step instructions for the recipe.'),
});
export type SummarizeNutritionalInformationInput = z.infer<typeof SummarizeNutritionalInformationInputSchema>;

const SummarizeNutritionalInformationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the nutritional information for the recipe.'),
});
export type SummarizeNutritionalInformationOutput = z.infer<typeof SummarizeNutritionalInformationOutputSchema>;

export async function summarizeNutritionalInformation(
  input: SummarizeNutritionalInformationInput
): Promise<SummarizeNutritionalInformationOutput> {
  return summarizeNutritionalInformationFlow(input);
}

const summarizeNutritionalInformationPrompt = ai.definePrompt({
  name: 'summarizeNutritionalInformationPrompt',
  input: {schema: SummarizeNutritionalInformationInputSchema},
  output: {schema: SummarizeNutritionalInformationOutputSchema},
  prompt: `You are a nutritionist summarizing nutritional information for recipes.

  Recipe Name: {{{recipeName}}}
  Ingredients: {{#each ingredients}}{{{this}}}, {{/each}}
  Instructions: {{#each instructions}}{{{this}}} {{/each}}

  Provide a concise summary of the nutritional information of the recipe, highlighting key nutrients and potential health benefits or concerns.`,
});

const summarizeNutritionalInformationFlow = ai.defineFlow(
  {
    name: 'summarizeNutritionalInformationFlow',
    inputSchema: SummarizeNutritionalInformationInputSchema,
    outputSchema: SummarizeNutritionalInformationOutputSchema,
  },
  async input => {
    const {output} = await summarizeNutritionalInformationPrompt(input);
    return output!;
  }
);

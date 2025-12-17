'use server';

/**
 * @fileOverview Generates recipes based on a list of ingredients provided by the user.
 *
 * - generateRecipes - A function that takes a list of ingredients and returns a list of recipes.
 * - GenerateRecipesInput - The input type for the generateRecipes function.
 * - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipesInputSchema = z.object({
  ingredients: z
    .string()
    .describe("A comma-separated list of ingredients the user has available."),
  language: z.string().describe("The language to generate the recipes in. (e.g., 'English', 'Spanish')").optional(),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

const RecipeSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('Detailed, step-by-step instructions for preparing the recipe, with each step as an item in the array.'),
});

const GenerateRecipesOutputSchema = z.array(RecipeSchema).describe('A list of recipes that can be made with the given ingredients.');
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipesPrompt',
  input: {schema: GenerateRecipesInputSchema},
  output: {schema: GenerateRecipesOutputSchema},
  prompt: `You are a world-class chef. Given the following ingredients, suggest a list of recipes that can be made. For each recipe, provide detailed, step-by-step instructions that are easy for a home cook to follow. Return the instructions as a list of strings.

Generate the entire response in the following language: {{{language}}}.

Ingredients: {{{ingredients}}}

Recipes:`,
});

const generateRecipesFlow = ai.defineFlow(
  {
    name: 'generateRecipesFlow',
    inputSchema: GenerateRecipesInputSchema,
    outputSchema: GenerateRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview Generates an image for a recipe.
 *
 * - generateRecipeImage - A function that generates an image for a given recipe title.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe to generate an image for.'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

const GenerateRecipeImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async ({ recipeTitle }) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A delicious-looking, professionally photographed plate of ${recipeTitle}, realistic, high quality, food photography.`,
      config: {
        aspectRatio: '16:9'
      }
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }
    
    return { imageUrl: media.url };
  }
);

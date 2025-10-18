
'use server';

import {
  generateRecipes,
  GenerateRecipesInput,
  GenerateRecipesOutput,
} from '@/ai/flows/generate-recipes-from-ingredients';
import {
  summarizeNutritionalInformation,
  SummarizeNutritionalInformationInput,
} from '@/ai/flows/summarize-nutritional-information';
import { 
  generateRecipeImage,
  GenerateRecipeImageInput 
} from '@/ai/flows/generate-recipe-image';
import { z } from 'zod';

const GenerateRecipesActionSchema = z.object({
  ingredients: z.string().min(3, { message: 'Please enter at least one ingredient (minimum 3 characters).' }),
});

type GenerateRecipesActionResult = 
  | { success: true; data: GenerateRecipesOutput }
  | { success: false; error: string };

export async function generateRecipesAction(
  prevState: any,
  formData: FormData
): Promise<GenerateRecipesActionResult> {
  const validatedFields = GenerateRecipesActionSchema.safeParse({
    ingredients: formData.get('ingredients'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.ingredients?.[0] || 'Invalid input.',
    };
  }

  try {
    const recipes = await generateRecipes(validatedFields.data);
    if (recipes.length === 0) {
      return { success: false, error: 'Could not generate recipes from these ingredients. Try different ones.' };
    }
    return { success: true, data: recipes };
  } catch (error) {
    console.error('Error generating recipes:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}

type SummarizeNutritionalInfoActionResult =
  | { success: true; data: string }
  | { success: false; error: string };

export async function summarizeNutritionalInfoAction(
  input: SummarizeNutritionalInformationInput
): Promise<SummarizeNutritionalInfoActionResult> {
  try {
    const result = await summarizeNutritionalInformation(input);
    return { success: true, data: result.summary };
  } catch (error) {
    console.error('Error summarizing nutritional info:', error);
    return { success: false, error: 'Failed to get nutritional information for this recipe.' };
  }
}

type GenerateRecipeImageActionResult =
  | { success: true; imageUrl: string }
  | { success: false; error: string };

export async function generateRecipeImageAction(
  input: GenerateRecipeImageInput
): Promise<GenerateRecipeImageActionResult> {
  try {
    const result = await generateRecipeImage(input);
    return { success: true, imageUrl: result.imageUrl };
  } catch (error) {
    console.error('Error generating recipe image:', error);
    return { success: false, error: 'Failed to generate an image for this recipe.' };
  }
}

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormState } from 'react-dom';
import Image from 'next/image';
import { generateRecipesAction, summarizeNutritionalInfoAction } from '@/app/actions';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes-from-ingredients';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import { ChefHat, CookingPot, GlassWater, LeafyGreen, Loader2, Utensils } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Recipe = GenerateRecipesOutput[0];

export function FridgeChefClient() {
  const { toast } = useToast();

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [nutritionalInfo, setNutritionalInfo] = useState<string | null>(null);
  const [isFetchingNutrition, setIsFetchingNutrition] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  const [generateRecipesState, formAction] = useFormState(generateRecipesAction, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (generateRecipesState?.success) {
      setRecipes(generateRecipesState.data);
      setSelectedRecipe(generateRecipesState.data[0]);
    } else if (generateRecipesState?.error) {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: generateRecipesState.error,
      });
    }
  }, [generateRecipesState, toast]);

  useEffect(() => {
    if (selectedRecipe) {
      const getNutritionalInfo = async () => {
        setIsFetchingNutrition(true);
        setNutritionalInfo(null);
        const result = await summarizeNutritionalInfoAction({
          recipeName: selectedRecipe.title,
          ingredients: selectedRecipe.ingredients,
        });
        if (result.success) {
          setNutritionalInfo(result.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Nutrition Info Error',
            description: result.error,
          });
        }
        setIsFetchingNutrition(false);
      };
      getNutritionalInfo();
    }
  }, [selectedRecipe, toast]);
  
  const recipeImage = PlaceHolderImages.find(img => img.id === 'recipe-placeholder');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <header className="flex justify-center mb-8">
        <Logo />
      </header>

      <Card className="mb-8 shadow-lg border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <ChefHat className="text-primary" />
            What's in your fridge?
          </CardTitle>
          <CardDescription>
            List your ingredients (e.g., chicken breast, broccoli, garlic) and we'll create recipes for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form key={formKey} action={(formData) => {
            startTransition(() => formAction(formData))
          }}>
            <Textarea
              name="ingredients"
              placeholder="e.g., salmon, asparagus, lemon, olive oil"
              className="min-h-[100px] text-base focus-visible:ring-primary"
              required
            />
            <Button type="submit" className="mt-4 w-full sm:w-auto" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Recipes
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isPending && !recipes && (
        <div className="text-center p-8 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Creating culinary masterpieces...</p>
        </div>
      )}

      {!recipes && !isPending && (
         <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <CookingPot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Welcome to FridgeChef!</h3>
          <p className="text-muted-foreground mt-2">
            Enter your available ingredients above to get started.
          </p>
        </div>
      )}

      {recipes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Recipe Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="flex flex-col gap-2 pr-4">
                  {recipes.map((recipe, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      data-active={selectedRecipe?.title === recipe.title}
                      className="justify-start p-4 h-auto text-left data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-bold"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      {recipe.title}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            {selectedRecipe ? (
              <Card className="shadow-md sticky top-8">
                <ScrollArea className="h-[calc(100vh-6rem)]">
                <CardHeader>
                  {recipeImage && (
                     <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={`${recipeImage.imageUrl.split('/seed/')[0]}/seed/${selectedRecipe.title.replace(/\s/g, '-')}/600/400`}
                          alt={selectedRecipe.title}
                          fill
                          className="object-cover"
                          data-ai-hint={recipeImage.imageHint}
                        />
                      </div>
                  )}
                  <CardTitle className="text-3xl font-headline">{selectedRecipe.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><LeafyGreen className="text-primary"/>Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground bg-muted/50 p-4 rounded-md">
                      {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                  </div>
                  <Separator />
                   <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><Utensils className="text-primary"/>Instructions</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-foreground">
                      {selectedRecipe.instructions}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><GlassWater className="text-primary"/>Nutritional Summary</h3>
                    {isFetchingNutrition ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">{nutritionalInfo || 'No nutritional information available.'}</p>
                    )}
                  </div>
                </CardContent>
                </ScrollArea>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed p-8">
                <p className="text-muted-foreground">Select a recipe to see the details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

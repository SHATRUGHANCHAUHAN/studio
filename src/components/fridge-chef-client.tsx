'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { generateRecipesAction, summarizeNutritionalInfoAction } from '@/app/actions';
import type { GenerateRecipesOutput } from '@/ai/flows/generate-recipes-from-ingredients';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import { ChefHat, CookingPot, GlassWater, LeafyGreen, Loader2, Utensils, Sparkles } from 'lucide-react';

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
      const fetchDetails = async () => {
        setIsFetchingNutrition(true);
        setNutritionalInfo(null);

        const nutritionResult = await summarizeNutritionalInfoAction({
          recipeName: selectedRecipe.title,
          ingredients: selectedRecipe.ingredients,
        });

        if (nutritionResult.success) {
          setNutritionalInfo(nutritionResult.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Nutrition Info Error',
            description: nutritionResult.error,
          });
        }
        setIsFetchingNutrition(false);
      };
      fetchDetails();
    }
  }, [selectedRecipe, toast]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-screen-xl">
      <header className="flex justify-center mb-10">
        <Logo />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="bg-card/70 border-border/50 sticky top-8 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <ChefHat className="text-primary-foreground" />
                What's in your fridge?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form key={formKey} action={(formData) => {
                startTransition(() => formAction(formData))
              }}>
                <Textarea
                  name="ingredients"
                  placeholder="e.g., salmon, asparagus, lemon, olive oil..."
                  className="min-h-[120px] text-base bg-background/50 focus-visible:ring-primary-foreground"
                  required
                />
                <Button type="submit" className="mt-4 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Recipes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <main className="lg:col-span-8 xl:col-span-9">
          {isPending && !recipes && (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-border/50 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary-foreground" />
              <p className="text-muted-foreground">Creating culinary masterpieces...</p>
            </div>
          )}

          {!recipes && !isPending && (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-border/50">
              <CookingPot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground">Welcome to FridgeChef!</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Enter your available ingredients on the left to discover delicious recipes you can make right now.
              </p>
            </div>
          )}

          {recipes && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <Card className="xl:col-span-1 bg-card/70 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Recipe Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="flex flex-col gap-2 pr-4">
                      {recipes.map((recipe, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          data-active={selectedRecipe?.title === recipe.title}
                          className="justify-start p-3 h-auto text-left data-[active=true]:bg-primary/20 data-[active=true]:text-primary-foreground data-[active=true]:font-semibold"
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                          {recipe.title}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="xl:col-span-2">
                {selectedRecipe ? (
                  <Card className="bg-card/70 border-border/50 sticky top-8 shadow-sm">
                    <ScrollArea className="h-[calc(100vh-6rem)]">
                      <CardHeader>
                        <CardTitle className="text-3xl font-headline">{selectedRecipe.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-8 px-6 pb-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><LeafyGreen className="text-primary-foreground"/>Ingredients</h3>
                          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground bg-muted/50 p-4 rounded-md border border-border/50">
                            {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><Utensils className="text-primary-foreground"/>Instructions</h3>
                          <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground/90">
                            {selectedRecipe.instructions}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><GlassWater className="text-primary-foreground"/>Nutritional Summary</h3>
                          {isFetchingNutrition ? (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full bg-muted/80" />
                              <Skeleton className="h-4 w-full bg-muted/80" />
                              <Skeleton className="h-4 w-3/4 bg-muted/80" />
                            </div>
                          ) : (
                            <p className="text-muted-foreground">{nutritionalInfo || 'No nutritional information available.'}</p>

                          )}
                        </div>
                      </CardContent>
                    </ScrollArea>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-border/50 p-8">
                    <p className="text-muted-foreground">Select a recipe to see the details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

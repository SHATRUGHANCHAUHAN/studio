'use client';

import { useState, useEffect, useActionState } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { ChefHat, CookingPot, GlassWater, LeafyGreen, Loader2, Utensils, Sparkles, BookOpen } from 'lucide-react';

type Recipe = GenerateRecipesOutput[0];

export function FridgeChefClient() {
  const { toast } = useToast();

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [nutritionalInfo, setNutritionalInfo] = useState<string | null>(null);
  const [isFetchingNutrition, setIsFetchingNutrition] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  const [generateRecipesState, formAction, isPending] = useActionState(generateRecipesAction, null);

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

  const handleNewSearch = () => {
    setRecipes(null);
    setSelectedRecipe(null);
    setNutritionalInfo(null);
    setFormKey(Date.now());
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-screen-2xl">
      <header className="flex justify-center mb-10">
        <Logo />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-8"
          >
            <Card className="bg-card/70 border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-xl">
                  <ChefHat size={24} className="text-primary-foreground" />
                  What's in your fridge?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form key={formKey} action={formAction}>
                  <Textarea
                    name="ingredients"
                    placeholder="e.g., chicken breast, broccoli, soy sauce, ginger, garlic..."
                    className="min-h-[150px] text-base bg-background/50 focus-visible:ring-primary-foreground focus-visible:ring-2 border-border/60"
                    required
                  />
                  <Button type="submit" className="mt-4 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-md font-bold py-6" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Recipes
                      </>
                    )}
                  </Button>
                </form>
                {recipes && (
                   <Button variant="outline" className="mt-2 w-full" onClick={handleNewSearch}>
                     Start New Search
                   </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </aside>

        <main className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {isPending && !recipes ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full min-h-[500px] rounded-2xl border-2 border-dashed border-border/30 gap-6 text-center"
              >
                <Loader2 className="h-16 w-16 animate-spin text-primary-foreground" />
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Crafting your culinary creations...</h3>
                <p className="text-muted-foreground max-w-sm">Our AI chef is looking through the pantry and heating up the pans. Your delicious recipes will be ready in a moment!</p>
              </motion.div>
            ) : !recipes ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full min-h-[500px] rounded-2xl border-2 border-dashed border-border/30 gap-6 text-center p-8"
              >
                <CookingPot className="h-20 w-20 text-muted-foreground" strokeWidth={1.5} />
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome to Your Personal Kitchen AI!</h2>
                <p className="text-lg text-muted-foreground max-w-md">
                  Tired of wondering what to cook? Enter the ingredients you have, and let FridgeChef inspire your next meal.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex flex-col gap-8">
                  <Card className="bg-card/70 border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BookOpen className="text-primary-foreground" />
                        Recipe Ideas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipes.map((recipe, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            data-active={selectedRecipe?.title === recipe.title}
                            className="text-left p-4 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-primary/50 hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:border-primary/80 data-[active=true]:shadow-md"
                            onClick={() => setSelectedRecipe(recipe)}
                          >
                            <h3 className="font-bold text-lg text-foreground data-[active=true]:text-primary-foreground">
                              {recipe.title}
                            </h3>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <AnimatePresence>
                  {selectedRecipe && (
                    <motion.div
                      key={selectedRecipe.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="bg-card/70 border-border/50 shadow-sm sticky top-8">
                        <ScrollArea className="h-auto max-h-[calc(100vh-8rem)]">
                          <CardHeader>
                            <CardTitle className="text-3xl font-headline tracking-tight">{selectedRecipe.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-8 px-6 pb-8">
                            <div className="grid md:grid-cols-2 gap-8">
                              <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><LeafyGreen className="text-primary-foreground"/>Ingredients</h3>
                                <ul className="list-disc list-inside space-y-1.5 text-muted-foreground bg-muted/30 p-4 rounded-md border border-border/30">
                                  {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                </ul>
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><GlassWater className="text-primary-foreground"/>Nutritional Summary</h3>
                                {isFetchingNutrition ? (
                                  <div className="space-y-2 pt-2">
                                    <Skeleton className="h-4 w-full bg-muted/80" />
                                    <Skeleton className="h-4 w-full bg-muted/80" />
                                    <Skeleton className="h-4 w-3/4 bg-muted/80" />
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">{nutritionalInfo || 'No nutritional information available.'}</p>
                                )}
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><Utensils className="text-primary-foreground"/>Instructions</h3>
                              <div className="prose prose-sm max-w-none prose-p:text-foreground/90 prose-li:text-foreground/90 whitespace-pre-line text-foreground/90">
                                {selectedRecipe.instructions}
                              </div>
                            </div>
                          </CardContent>
                        </ScrollArea>
                      </Card>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

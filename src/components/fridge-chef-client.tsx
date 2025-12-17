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
import { ChefHat, CookingPot, GlassWater, LeafyGreen, Loader2, Utensils, Sparkles, BookOpen, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Recipe = GenerateRecipesOutput[0];

const translations = {
  en: {
    whatsInYourFridge: "What's in your fridge?",
    placeholder: "e.g., rice, broccoli, soy sauce, ginger, garlic...",
    generateRecipes: "Generate Recipes",
    startNewSearch: "Start New Search",
    craftingCulinary: "Crafting your culinary creations...",
    aiChefWorking: "Our AI chef is looking through the pantry and heating up the pans. Your delicious recipes will be ready in a moment!",
    welcome: "Welcome to Your Personal Kitchen AI!",
    welcomeSub: "Tired of wondering what to cook? Enter the ingredients you have, and let FridgeChef inspire your next meal.",
    recipeIdeas: "Recipe Ideas",
    ingredients: "Ingredients",
    nutritionalSummary: "Nutritional Summary",
    instructions: "Instructions",
    noNutrition: "No nutritional information available.",
    language: "Language"
  },
  es: {
    whatsInYourFridge: "¿Qué hay en tu nevera?",
    placeholder: "Ej., arroz, brócoli, salsa de soja, jengibre, ajo...",
    generateRecipes: "Generar Recetas",
    startNewSearch: "Empezar Nueva Búsqueda",
    craftingCulinary: "Creando tus creaciones culinarias...",
    aiChefWorking: "Nuestro chef de IA está mirando en la despensa y calentando las sartenes. ¡Tus deliciosas recetas estarán listas en un momento!",
    welcome: "¡Bienvenido a tu IA de Cocina Personal!",
    welcomeSub: "¿Cansado de preguntarte qué cocinar? Introduce los ingredientes que tienes y deja que FridgeChef inspire tu próxima comida.",
    recipeIdeas: "Ideas de Recetas",
    ingredients: "Ingredientes",
    nutritionalSummary: "Resumen Nutricional",
    instructions: "Instrucciones",
    noNutrition: "No hay información nutricional disponible.",
    language: "Idioma"
  },
  fr: {
    whatsInYourFridge: "Qu'y a-t-il dans votre frigo ?",
    placeholder: "Ex : riz, brocoli, sauce soja, gingembre, ail...",
    generateRecipes: "Générer des Recettes",
    startNewSearch: "Nouvelle Recherche",
    craftingCulinary: "Préparation de vos créations culinaires...",
    aiChefWorking: "Notre chef IA regarde dans le garde-manger et chauffe les poêles. Vos délicieuses recettes seront prêtes dans un instant !",
    welcome: "Bienvenue sur votre IA de Cuisine Personnelle !",
    welcomeSub: "Fatigué de vous demander quoi cuisiner ? Entrez les ingrédients que vous avez et laissez FridgeChef inspirer votre prochain repas.",
    recipeIdeas: "Idées de Recettes",
    ingredients: "Ingrédients",
    nutritionalSummary: "Résumé Nutritionnel",
    instructions: "Instructions",
    noNutrition: "Aucune information nutritionnelle disponible.",
    language: "Langue"
  }
};

export function FridgeChefClient() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<keyof typeof translations>('en');

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [nutritionalInfo, setNutritionalInfo] = useState<string | null>(null);
  const [isFetchingNutrition, setIsFetchingNutrition] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  const [generateRecipesState, formAction, isPending] = useActionState(generateRecipesAction, null);

  const t = translations[language];

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
          instructions: selectedRecipe.instructions,
          language: language
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
  }, [selectedRecipe, toast, language]);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                  {t.whatsInYourFridge}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form key={formKey} action={formAction}>
                  <Textarea
                    name="ingredients"
                    placeholder={t.placeholder}
                    className="min-h-[150px] text-base bg-background/50 focus-visible:ring-primary-foreground focus-visible:ring-2 border-border/60"
                    required
                  />
                  <input type="hidden" name="language" value={language} />

                   <div className="mt-4 space-y-2">
                     <div className="space-y-1">
                       <label htmlFor="language-select" className="text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4"/>{t.language}</label>
                        <Select onValueChange={(value: keyof typeof translations) => setLanguage(value)} defaultValue={language}>
                          <SelectTrigger id="language-select">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                   </div>

                  <Button type="submit" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-md font-bold py-6" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        {t.generateRecipes}
                      </>
                    )}
                  </Button>
                </form>
                {recipes && (
                   <Button variant="outline" className="mt-2 w-full" onClick={handleNewSearch}>
                     {t.startNewSearch}
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
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{t.craftingCulinary}</h3>
                <p className="text-muted-foreground max-w-sm">{t.aiChefWorking}</p>
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
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{t.welcome}</h2>
                <p className="text-lg text-muted-foreground max-w-md">
                  {t.welcomeSub}
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
                        {t.recipeIdeas}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea>
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
                      </ScrollArea>
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
                      <Card className="bg-card/70 border-border/50 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-3xl font-headline tracking-tight">{selectedRecipe.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 px-6 pb-8">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><LeafyGreen className="text-primary-foreground"/>{t.ingredients}</h3>
                              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground bg-muted/30 p-4 rounded-md border border-border/30">
                                {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                              </ul>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><GlassWater className="text-primary-foreground"/>{t.nutritionalSummary}</h3>
                              {isFetchingNutrition ? (
                                <div className="space-y-2 pt-2">
                                  <Skeleton className="h-4 w-full bg-muted/80" />
                                  <Skeleton className="h-4 w-full bg-muted/80" />
                                  <Skeleton className="h-4 w-3/4 bg-muted/80" />
                                </div>
                              ) : (
                                <p className="text-muted-foreground">{nutritionalInfo || t.noNutrition}</p>
                              )}
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><Utensils className="text-primary-foreground"/>{t.instructions}</h3>
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                              <ol>
                                {selectedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                              </ol>
                            </div>
                          </div>
                        </CardContent>
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

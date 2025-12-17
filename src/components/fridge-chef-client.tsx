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
import { ChefHat, CookingPot, GlassWater, LeafyGreen, Loader2, Utensils, Sparkles, BookOpen, Globe, Heart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';

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
    language: "Language",
    favorites: "Favorites"
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
    language: "Idioma",
    favorites: "Favoritos"
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
    language: "Langue",
    favorites: "Favoris"
  },
  hi: {
    whatsInYourFridge: "आपके फ्रिज में क्या है?",
    placeholder: "उदा., चावल, ब्रोकोली, सोया सॉस, अदरक, लहसुन...",
    generateRecipes: "रेसिपी बनाएं",
    startNewSearch: "नई खोज शुरू करें",
    craftingCulinary: "आपकी पाक कृतियाँ तैयार हो रही हैं...",
    aiChefWorking: "हमारा AI शेफ पेंट्री में देख रहा है और पैन गरम कर रहा है। आपकी स्वादिष्ट रेसिपी कुछ ही पल में तैयार हो जाएगी!",
    welcome: "आपके व्यक्तिगत किचन एआई में आपका स्वागत है!",
    welcomeSub: "क्या पकाएं, यह सोचकर थक गए हैं? आपके पास जो सामग्री है, उसे दर्ज करें, और फ्रिजशेफ को अपनी अगली भोजन को प्रेरित करने दें।",
    recipeIdeas: "रेसिपी आइडिया",
    ingredients: "सामग्री",
    nutritionalSummary: "पोषण संबंधी सारांश",
    instructions: "निर्देश",
    noNutrition: "कोई पोषण संबंधी जानकारी उपलब्ध नहीं है।",
    language: "भाषा",
    favorites: "पसंदीदा"
  },
  gu: {
    whatsInYourFridge: "તમારા ફ્રિજમાં શું છે?",
    placeholder: "દા.ત., ચોખા, બ્રોકોલી, સોયા સોસ, આદુ, લસણ...",
    generateRecipes: "રેસિપી બનાવો",
    startNewSearch: "નવી શોધ શરૂ કરો",
    craftingCulinary: "તમારી રસોઈ રચનાઓ તૈયાર કરી રહ્યા છીએ...",
    aiChefWorking: "અમારો AI શૅફ પેન્ટ્રીમાં જોઈ રહ્યો છે અને તવા ગરમ કરી રહ્યો છે. તમારી સ્વાદિષ્ટ વાનગીઓ થોડી જ વારમાં તૈયાર થઈ જશે!",
    welcome: "તમારા વ્યક્તિગત કિચન AI માં આપનું સ્વાગત છે!",
    welcomeSub: "શું રાંધવું તે વિચારીને થાકી ગયા છો? તમારી પાસે જે ઘટકો છે તે દાખલ કરો, અને ફ્રિજશેફને તમારી આગામી ભોજન માટે પ્રેરણા આપવા દો।",
    recipeIdeas: "રેસિપી આઈડિયા",
    ingredients: "ઘટકો",
    nutritionalSummary: "પોષણ સારાંશ",
    instructions: "સૂચનાઓ",
    noNutrition: "કોઈ પોષક માહિતી ઉપલબ્ધ નથી।",
    language: "ભાષા",
    favorites: "મનપસંદ"
  },
  ta: {
    whatsInYourFridge: "உங்கள் குளிர்சாதன பெட்டியில் என்ன இருக்கிறது?",
    placeholder: "எ.கா., அரிசி, ப்ரோக்கோலி, சோயா சாஸ், இஞ்சி, பூண்டு...",
    generateRecipes: "சமையல் குறிப்புகளை உருவாக்கு",
    startNewSearch: "புதிய தேடலைத் தொடங்கு",
    craftingCulinary: "உங்கள் சமையல் படைப்புகளை உருவாக்குகிறோம்...",
    aiChefWorking: "எங்கள் AI சமையல்காரர் சரக்கறையைப் பார்த்து, பாத்திரங்களை சூடாக்குகிறார். உங்கள் சுவையான சமையல் குறிப்புகள் ஒரு கணத்தில் தயாராகிவிடும்!",
    welcome: "உங்கள் தனிப்பட்ட சமையலறை AIக்கு வரவேற்கிறோம்!",
    welcomeSub: "என்ன சமைப்பது என்று யோசித்து சோர்வடைந்துவிட்டீர்களா? உங்களிடம் உள்ள பொருட்களை உள்ளிடவும், உங்கள் அடுத்த உணவை FridgeChef ஊக்குவிக்கட்டும்.",
    recipeIdeas: "சமையல் யோசனைகள்",
    ingredients: "பொருட்கள்",
    nutritionalSummary: "ஊட்டச்சத்து சுருக்கம்",
    instructions: "வழிமுறைகள்",
    noNutrition: "ஊட்டச்சத்து தகவல் எதுவும் கிடைக்கவில்லை.",
    language: "மொழி",
    favorites: "பிடித்தவை"
  },
  or: {
    whatsInYourFridge: "ଆପଣଙ୍କ ଫ୍ରିଜରେ କ'ଣ ଅଛି?",
    placeholder: "ଉଦା., ଭାତ, ବ୍ରୋକୋଲି, ସୋୟା ସସ୍, ଅଦା, ରସୁଣ...",
    generateRecipes: "ରେସିପି ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    startNewSearch: "ନୂଆ ସନ୍ଧାନ ଆରମ୍ଭ କରନ୍ତୁ",
    craftingCulinary: "ଆପଣଙ୍କ ରୋଷେଇ କଳାକୃତି ପ୍ରସ୍ତୁତ କରାଯାଉଛି...",
    aiChefWorking: "ଆମର AI ରୋଷେୟା ପ୍ୟାଣ୍ଟ୍ରିରେ ଦେଖୁଛନ୍ତି ଏବଂ ପାତ୍ର ଗରମ କରୁଛନ୍ତି। ଆପଣଙ୍କ ସ୍ୱାଦିଷ୍ଟ ରେସିପିଗୁଡିକ କିଛି ମୁହୂର୍ତ୍ତରେ ପ୍ରସ୍ତୁତ ହୋଇଯିବ!",
    welcome: "ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ରୋଷେଇ AIକୁ ସ୍ୱାଗତ!",
    welcomeSub: "କ'ଣ ରାନ୍ଧିବେ ଭାବି ଭାବି କ୍ଳାନ୍ତ ହୋଇଗଲେଣି କି? ଆପଣଙ୍କ ପାଖରେ ଥିବା ସାମଗ୍ରୀଗୁଡିକ ପ୍ରବେଶ କରାନ୍ତୁ ଏବଂ ଫ୍ରିଜ୍‌ଶେଫ୍‌କୁ ଆପଣଙ୍କ ପରବର୍ତ୍ତୀ ଭୋଜନ ପାଇଁ ପ୍ରେରଣା ଦେବାକୁ ଦିଅନ୍ତୁ।",
    recipeIdeas: "ରେସିପି ଆଇଡିଆ",
    ingredients: "ସାମଗ୍ରୀ",
    nutritionalSummary: "ପୋଷଣ ସାରାଂଶ",
    instructions: "ନିର୍ଦ୍ଦେଶାବଳୀ",
    noNutrition: "କୌଣସି ପୋଷଣ ସମ୍ବନ୍ଧୀୟ ସୂଚନା ଉପଲବ୍ଧ ନାହିଁ।",
    language: "ଭାଷା",
    favorites: "ପସନ୍ଦିତ"
  },
  pa: {
    whatsInYourFridge: "ਤੁਹਾਡੇ ਫਰਿੱਜ ਵਿੱਚ ਕੀ ਹੈ?",
    placeholder: "ਉਦਾਹਰਨ ਲਈ, ਚਾਵਲ, ਬਰੋਕਲੀ, ਸੋਇਆ ਸਾਸ, ਅਦਰਕ, ਲਸਣ...",
    generateRecipes: "ਵਿਅੰਜਨ ਬਣਾਓ",
    startNewSearch: "ਨਵੀਂ ਖੋਜ ਸ਼ੁਰੂ ਕਰੋ",
    craftingCulinary: "ਤੁਹਾਡੀਆਂ ਰਸੋਈ ਰਚਨਾਵਾਂ ਤਿਆਰ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ...",
    aiChefWorking: "ਸਾਡਾ ਏਆਈ ਸ਼ੈੱਫ ਪੈਂਟਰੀ ਵਿੱਚ ਦੇਖ ਰਿਹਾ ਹੈ ਅਤੇ ਪੈਨ ਗਰਮ ਕਰ ਰਿਹਾ ਹੈ। ਤੁਹਾਡੀਆਂ ਸੁਆਦੀ ਪਕਵਾਨਾਂ ਇੱਕ ਪਲ ਵਿੱਚ ਤਿਆਰ ਹੋ ਜਾਣਗੀਆਂ!",
    welcome: "ਤੁਹਾਡੇ ਨਿੱਜੀ ਕਿਚਨ ਏਆਈ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!",
    welcomeSub: "ਕੀ ਪਕਾਉਣਾ ਹੈ, ਇਹ ਸੋਚ ਕੇ ਥੱਕ ਗਏ ਹੋ? ਤੁਹਾਡੇ ਕੋਲ ਜੋ ਸਮੱਗਰੀ ਹੈ, ਉਸਨੂੰ ਦਾਖਲ ਕਰੋ, ਅਤੇ ਫਰਿੱਜਸ਼ੈਫ ਨੂੰ ਆਪਣੇ ਅਗਲੇ ਭੋਜਨ ਲਈ ਪ੍ਰੇਰਿਤ ਕਰਨ ਦਿਓ।",
    recipeIdeas: "ਵਿਅੰਜਨ ਵਿਚਾਰ",
    ingredients: "ਸਮੱਗਰੀ",
    nutritionalSummary: "ਪੋਸ਼ਣ ਸੰਬੰਧੀ ਸਾਰ",
    instructions: "ਹਦਾਇਤਾਂ",
    noNutrition: "ਕੋਈ ਪੋਸ਼ਣ ਸੰਬੰਧੀ ਜਾਣਕਾਰੀ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    language: "ਭਾਸ਼ਾ",
    favorites: "ਮਨਪਸੰਦ"
  },
  ur: {
    whatsInYourFridge: "آپ کے فریج میں کیا ہے؟",
    placeholder: "مثال کے طور پر، چاول، بروکولی، سویا ساس، ادرک، لہسن...",
    generateRecipes: "ترکیبیں بنائیں",
    startNewSearch: "نئی تلاش شروع کریں",
    craftingCulinary: "آپ کے پکوان کی تخلیقات تیار ہو رہی ہیں...",
    aiChefWorking: "ہمارا اے آئی شیف پینٹری میں دیکھ रहा ہے اور پین گرم کر رہا ہے۔ آپ کی مزیدار ترکیبیں ایک لمحے میں تیار ہو جائیں گی!",
    welcome: "آپ کے ذاتی کچن اے آئی میں خوش آمدید!",
    welcomeSub: "کیا پکانا ہے، یہ سوچ کر تھک گئے ہیں؟ آپ کے پاس جو اجزاء ہیں، وہ درج کریں، اور فرج شیف کو آپ کے اگلے کھانے کے لیے متاثر کرنے دیں۔",
    recipeIdeas: "ترکیب کے آئیڈیاز",
    ingredients: "اجزاء",
    nutritionalSummary: "غذائی خلاصہ",
    instructions: "ہدایات",
    noNutrition: "کوئی غذائی معلومات دستیاب نہیں ہے۔",
    language: "زبان",
    favorites: "پسندیدہ"
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
  const [favorites, setFavorites] = useState<Recipe[]>([]);

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

  const toggleFavorite = (recipe: Recipe) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.title === recipe.title);
      if (isFavorite) {
        return prevFavorites.filter(fav => fav.title !== recipe.title);
      } else {
        return [...prevFavorites, recipe];
      }
    });
  };

  const isFavorite = (recipe: Recipe) => favorites.some(fav => fav.title === recipe.title);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-screen-2xl">
      <header className="flex justify-center mb-10">
        <Logo />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
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
                            <SelectItem value="hi">हिन्दी</SelectItem>
                            <SelectItem value="gu">ગુજરાતી</SelectItem>
                            <SelectItem value="ta">தமிழ்</SelectItem>
                            <SelectItem value="or">ଓଡ଼ିଆ</SelectItem>
                            <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
                            <SelectItem value="ur">اردو</SelectItem>
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
          {favorites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-[calc(100vh-280px)]"
            >
              <Card className="bg-card/70 border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <Heart size={24} className="text-primary-foreground" />
                    {t.favorites}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {favorites.map((fav, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setSelectedRecipe(fav)}
                        >
                          {fav.title}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
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
                      <ScrollArea className="max-h-[200px]">
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
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-3xl font-headline tracking-tight">{selectedRecipe.title}</CardTitle>
                              <Button variant="ghost" size="icon" onClick={() => toggleFavorite(selectedRecipe)}>
                                <Heart className={cn("w-6 h-6", isFavorite(selectedRecipe) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                              </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8 px-6 pb-8">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 font-headline"><LeafyGreen className="text-primary-foreground"/>{t.ingredients}</h3>
                              <ScrollArea className="h-48">
                                <ul className="list-disc list-inside space-y-1.5 text-muted-foreground bg-muted/30 p-4 rounded-md border border-border/30">
                                  {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                </ul>
                              </ScrollArea>
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

import { ChefHat } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3 text-center">
      <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
        <ChefHat className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
        FridgeChef
      </h1>
    </div>
  );
}

import { ChefHat } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3 text-center">
      <ChefHat className="h-10 w-10 text-primary" />
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-headline">
        FridgeChef
      </h1>
    </div>
  );
}

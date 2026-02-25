
export enum MealType {
  STANDARD = 'STANDARD',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN'
}

export enum Supermarket {
  MIGROS = 'Migros',
  COOP = 'Coop',
  LIDL = 'Lidl',
  ALDI = 'Aldi',
  DENNER = 'Denner',
  ALIGRO = 'Aligro'
}

export interface Ingredient {
  item: string;
  quantity: string;
  category: string; // e.g., "Légumes", "Viande", "Epicerie"
}

export interface Recipe {
  title: string;
  description: string;
  protein: string;
  starch: string;
  vegetable: string;
  imageUrl?: string; // Optional custom image URL
  ingredients: Ingredient[];
  instructions?: string[]; // Made optional for speed
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  isPremiumVideoAvailable: boolean;
  calories: number; // Kcal per portion
  carbsCal?: number;
  fatCal?: number;
  proteinCal?: number;
  priceComparison: {
    [key in Supermarket]?: number; // Estimated price in CHF for the full recipe (2 people)
  };
}

export interface DailyPlan {
  day: string;
  breakfast: {
    standard: Recipe;
    vegetarian: Recipe;
    vegan: Recipe;
    world: Recipe;
  };
  lunch: {
    standard: Recipe;
    vegetarian: Recipe;
    vegan: Recipe;
    world: Recipe;
  };
  dinner: {
    standard: Recipe;
    vegetarian: Recipe;
    vegan: Recipe;
    world: Recipe;
  };
}

export interface WeeklyPlan {
  weekId: string;
  days: DailyPlan[];
}

export type ViewState = 'PLANNER' | 'SHOPPING' | 'PREMIUM' | 'WORKSHOPS';
export type DietMode = 'standard' | 'vegetarian' | 'vegan' | 'world';

export enum Language {
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  EN = 'en',
  ES = 'es'
}

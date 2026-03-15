export type RecipeType = 'vlees' | 'vis' | 'vegan' | 'vegetarisch';
export type Course = 'ontbijt' | 'lunch' | 'diner' | 'dessert';
export type IngredientCategory = 'groente' | 'fruit' | 'vlees_vis' | 'zuivel' | 'kruiden' | 'droog' | 'overig';

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  type: RecipeType;
  course: Course;
  allergens: string[];
  tags: string[];
  baseServings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  amount: number;
  unit: string;
  checked: boolean;
  category: IngredientCategory;
}

export interface Note {
  recipeId: string;
  text: string;
  updatedAt: string;
}

export const RECIPE_TYPE_LABELS: Record<RecipeType, string> = {
  vlees: 'Vlees',
  vis: 'Vis & Zeevruchten',
  vegan: 'Vegan',
  vegetarisch: 'Vegetarisch',
};

export const COURSE_LABELS: Record<Course, string> = {
  ontbijt: 'Ontbijt',
  lunch: 'Lunch',
  diner: 'Diner',
  dessert: 'Dessert',
};

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  groente: 'Groente & Fruit',
  fruit: 'Fruit',
  vlees_vis: 'Vlees & Vis',
  zuivel: 'Zuivel',
  kruiden: 'Kruiden & Specerijen',
  droog: 'Droog & Conserven',
  overig: 'Overig',
};

export const ALLERGEN_OPTIONS = [
  { value: 'gluten', label: 'Glutenvrij' },
  { value: 'noten', label: 'Notenvrij' },
  { value: 'lactose', label: 'Lactosevrij' },
  { value: 'ei', label: 'Eivrij' },
  { value: 'soja', label: 'Sojavrij' },
  { value: 'schaaldieren', label: 'Schaaldierenvrij' },
];

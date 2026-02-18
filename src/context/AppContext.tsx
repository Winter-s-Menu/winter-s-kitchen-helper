import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ShoppingListItem, Note, RecipeIngredient } from '@/types/recipe';

interface AppContextType {
  favorites: string[];
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  shoppingList: ShoppingListItem[];
  addToShoppingList: (items: RecipeIngredient[], scalingFactor: number) => void;
  toggleShoppingItem: (id: string) => void;
  updateShoppingItemAmount: (id: string, amount: number) => void;
  removeShoppingItem: (id: string) => void;
  clearShoppingList: () => void;
  notes: Note[];
  saveNote: (recipeId: string, text: string) => void;
  getNote: (recipeId: string) => Note | undefined;
  deleteNote: (recipeId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('wm-favorites', []);
  const [shoppingList, setShoppingList] = useLocalStorage<ShoppingListItem[]>('wm-shopping', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('wm-notes', []);

  const toggleFavorite = useCallback((recipeId: string) => {
    setFavorites(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((recipeId: string) => favorites.includes(recipeId), [favorites]);

  const addToShoppingList = useCallback((items: RecipeIngredient[], scalingFactor: number) => {
    setShoppingList(prev => {
      const next = [...prev];
      for (const item of items) {
        const scaledAmount = item.amount * scalingFactor;
        const existing = next.find(
          s => s.ingredientName.toLowerCase() === item.name.toLowerCase() && s.unit === item.unit
        );
        if (existing) {
          existing.amount += scaledAmount;
        } else {
          next.push({
            id: crypto.randomUUID(),
            ingredientName: item.name,
            amount: Math.round(scaledAmount * 100) / 100,
            unit: item.unit,
            checked: false,
            category: item.category,
          });
        }
      }
      return next;
    });
  }, [setShoppingList]);

  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingList(prev => prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }, [setShoppingList]);

  const updateShoppingItemAmount = useCallback((id: string, amount: number) => {
    setShoppingList(prev => prev.map(i => (i.id === id ? { ...i, amount } : i)));
  }, [setShoppingList]);

  const removeShoppingItem = useCallback((id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  }, [setShoppingList]);

  const clearShoppingList = useCallback(() => setShoppingList([]), [setShoppingList]);

  const saveNote = useCallback((recipeId: string, text: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.recipeId !== recipeId);
      if (text.trim()) {
        filtered.push({ recipeId, text: text.trim(), updatedAt: new Date().toISOString() });
      }
      return filtered;
    });
  }, [setNotes]);

  const getNote = useCallback((recipeId: string) => notes.find(n => n.recipeId === recipeId), [notes]);

  const deleteNote = useCallback((recipeId: string) => {
    setNotes(prev => prev.filter(n => n.recipeId !== recipeId));
  }, [setNotes]);

  return (
    <AppContext.Provider
      value={{
        favorites, toggleFavorite, isFavorite,
        shoppingList, addToShoppingList, toggleShoppingItem, updateShoppingItemAmount, removeShoppingItem, clearShoppingList,
        notes, saveNote, getNote, deleteNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

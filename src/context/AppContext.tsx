import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { ShoppingListItem, Note, RecipeIngredient } from '@/types/recipe';
import type { Filters } from '@/components/FilterModal';
import { emptyFilters } from '@/components/FilterModal';

export interface UserProfile {
  name: string;
  allergies: string[];
}

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
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  shareToken: string | null;
  profile: UserProfile;
  updateProfile: (p: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [shoppingListId, setShoppingListId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ name: '', allergies: [] });
  const profileLoadedRef = useRef(false);

  // ── Load user data on auth change ──
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setShoppingList([]);
      setNotes([]);
      setShoppingListId(null);
      setShareToken(null);
      setProfile({ name: '', allergies: [] });
      setFilters(emptyFilters);
      profileLoadedRef.current = false;
      return;
    }
    loadProfile();
    loadFavorites();
    loadNotes();
    loadShoppingList();
  }, [user?.id]);

  // ── Profile ──
  async function loadProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('name, allergies')
      .eq('id', user!.id)
      .single();
    if (data) {
      const p: UserProfile = {
        name: data.name ?? '',
        allergies: data.allergies ?? [],
      };
      setProfile(p);
      // Apply saved allergies as default filters on login/session restore
      if (p.allergies.length > 0) {
        setFilters(prev => ({ ...prev, excludeAllergens: [...p.allergies] }));
      }
      profileLoadedRef.current = true;
    }
  }

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    const { error } = await supabase
      .from('profiles')
      .update({ name: newProfile.name, allergies: newProfile.allergies })
      .eq('id', user.id);
    if (error) {
      toast.error('Profiel opslaan mislukt');
    } else {
      toast.success('Profiel opgeslagen');
    }
  }, [user, profile]);

  // ── Favorites ──
  async function loadFavorites() {
    const { data } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', user!.id);
    setFavorites(data?.map(f => f.recipe_id) ?? []);
  }

  const toggleFavorite = useCallback(async (recipeId: string) => {
    if (!user) return;
    const isFav = favorites.includes(recipeId);
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== recipeId));
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
      if (error) {
        setFavorites(prev => [...prev, recipeId]);
        toast.error('Favoriet verwijderen mislukt');
      }
    } else {
      setFavorites(prev => [...prev, recipeId]);
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, recipe_id: recipeId });
      if (error) {
        setFavorites(prev => prev.filter(id => id !== recipeId));
        toast.error('Favoriet opslaan mislukt');
      }
    }
  }, [user, favorites]);

  const isFavorite = useCallback((recipeId: string) => favorites.includes(recipeId), [favorites]);

  // ── Notes ──
  async function loadNotes() {
    const { data } = await supabase
      .from('notes')
      .select('recipe_id, note_text, updated_at')
      .eq('user_id', user!.id);
    setNotes(data?.map(n => ({ recipeId: n.recipe_id, text: n.note_text, updatedAt: n.updated_at })) ?? []);
  }

  const saveNote = useCallback(async (recipeId: string, text: string) => {
    if (!user) return;
    if (text.trim()) {
      const prevNotes = [...notes];
      setNotes(prev => {
        const filtered = prev.filter(n => n.recipeId !== recipeId);
        filtered.push({ recipeId, text: text.trim(), updatedAt: new Date().toISOString() });
        return filtered;
      });
      const { error } = await supabase.from('notes').upsert(
        { user_id: user.id, recipe_id: recipeId, note_text: text.trim(), updated_at: new Date().toISOString() },
        { onConflict: 'user_id,recipe_id' }
      );
      if (error) {
        setNotes(prevNotes);
        toast.error('Notitie opslaan mislukt');
      }
    } else {
      const prevNotes = [...notes];
      setNotes(prev => prev.filter(n => n.recipeId !== recipeId));
      const { error } = await supabase.from('notes').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
      if (error) {
        setNotes(prevNotes);
        toast.error('Notitie verwijderen mislukt');
      }
    }
  }, [user, notes]);

  const getNote = useCallback((recipeId: string) => notes.find(n => n.recipeId === recipeId), [notes]);

  const deleteNote = useCallback(async (recipeId: string) => {
    if (!user) return;
    const prevNotes = [...notes];
    setNotes(prev => prev.filter(n => n.recipeId !== recipeId));
    const { error } = await supabase.from('notes').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
    if (error) {
      setNotes(prevNotes);
      toast.error('Notitie verwijderen mislukt');
    }
  }, [user, notes]);

  // ── Shopping List ──
  async function loadShoppingList() {
    let { data: list } = await supabase
      .from('shopping_lists')
      .select('id, share_token')
      .eq('user_id', user!.id)
      .single();

    if (!list) {
      const { data: newList } = await supabase
        .from('shopping_lists')
        .insert({ user_id: user!.id })
        .select('id, share_token')
        .single();
      list = newList;
    }

    if (list) {
      setShoppingListId(list.id);
      setShareToken(list.share_token);

      const { data: items } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('list_id', list.id);

      setShoppingList(items?.map(i => ({
        id: i.id,
        ingredientName: i.ingredient_name,
        amount: Number(i.amount),
        unit: i.unit,
        checked: i.checked,
        category: i.category as ShoppingListItem['category'],
      })) ?? []);
    }
  }

  const addToShoppingList = useCallback(async (items: RecipeIngredient[], scalingFactor: number) => {
    if (!user || !shoppingListId) return;
    setShoppingList(prev => {
      const next = [...prev];
      const toInsert: { list_id: string; ingredient_name: string; amount: number; unit: string; category: string }[] = [];
      const toUpdate: { id: string; amount: number }[] = [];

      for (const item of items) {
        const scaledAmount = Math.round(item.amount * scalingFactor * 100) / 100;
        const existing = next.find(
          s => s.ingredientName.toLowerCase() === item.name.toLowerCase() && s.unit === item.unit
        );
        if (existing) {
          existing.amount += scaledAmount;
          toUpdate.push({ id: existing.id, amount: existing.amount });
        } else {
          const id = crypto.randomUUID();
          next.push({
            id,
            ingredientName: item.name,
            amount: scaledAmount,
            unit: item.unit,
            checked: false,
            category: item.category,
          });
          toInsert.push({
            list_id: shoppingListId,
            ingredient_name: item.name,
            amount: scaledAmount,
            unit: item.unit,
            category: item.category,
          });
        }
      }

      if (toInsert.length) supabase.from('shopping_list_items').insert(toInsert).then(() => loadShoppingList());
      for (const u of toUpdate) supabase.from('shopping_list_items').update({ amount: u.amount }).eq('id', u.id);

      return next;
    });
  }, [user, shoppingListId]);

  const toggleShoppingItem = useCallback(async (id: string) => {
    setShoppingList(prev => prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)));
    const item = shoppingList.find(i => i.id === id);
    if (item) await supabase.from('shopping_list_items').update({ checked: !item.checked }).eq('id', id);
  }, [shoppingList]);

  const updateShoppingItemAmount = useCallback(async (id: string, amount: number) => {
    setShoppingList(prev => prev.map(i => (i.id === id ? { ...i, amount } : i)));
    await supabase.from('shopping_list_items').update({ amount }).eq('id', id);
  }, []);

  const removeShoppingItem = useCallback(async (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
    await supabase.from('shopping_list_items').delete().eq('id', id);
  }, []);

  const clearShoppingList = useCallback(async () => {
    setShoppingList([]);
    if (shoppingListId) {
      await supabase.from('shopping_list_items').delete().eq('list_id', shoppingListId);
    }
  }, [shoppingListId]);

  return (
    <AppContext.Provider
      value={{
        favorites, toggleFavorite, isFavorite,
        shoppingList, addToShoppingList, toggleShoppingItem, updateShoppingItemAmount, removeShoppingItem, clearShoppingList,
        notes, saveNote, getNote, deleteNote,
        searchQuery, setSearchQuery, filters, setFilters,
        shareToken,
        profile, updateProfile,
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

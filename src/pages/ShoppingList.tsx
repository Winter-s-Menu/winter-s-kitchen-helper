import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trash2, Check, Minus, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CATEGORY_LABELS, type IngredientCategory } from '@/types/recipe';

export default function ShoppingList() {
  const { shoppingList, toggleShoppingItem, updateShoppingItemAmount, removeShoppingItem, clearShoppingList } = useApp();

  // Group by category
  const grouped = shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryOrder: IngredientCategory[] = ['groente', 'fruit', 'vlees_vis', 'zuivel', 'kruiden', 'droog', 'overig'];
  const sortedCategories = categoryOrder.filter(c => grouped[c]?.length);

  const checkedCount = shoppingList.filter(i => i.checked).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Terug
          </Link>
          <h1 className="font-serif text-lg">Boodschappenlijst</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {shoppingList.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-2">Je boodschappenlijst is leeg</p>
            <Link to="/" className="text-primary text-sm hover:underline">
              Bekijk recepten
            </Link>
          </div>
        ) : (
          <>
            {checkedCount > 0 && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {checkedCount} van {shoppingList.length} afgevinkt
                </span>
                <button
                  onClick={clearShoppingList}
                  className="text-sm text-destructive hover:underline"
                >
                  Lijst wissen
                </button>
              </div>
            )}

            <div className="space-y-6">
              {sortedCategories.map(cat => (
                <section key={cat}>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <div className="rounded-xl border bg-card divide-y">
                    {grouped[cat].map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {item.checked && <Check className="h-3 w-3" />}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            item.checked ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {item.ingredientName}
                        </span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={e => updateShoppingItemAmount(item.id, Number(e.target.value) || 0)}
                          className="w-16 text-right text-sm bg-transparent outline-none text-muted-foreground rounded-md border border-transparent px-1 py-0.5 focus:border-primary/40 focus:bg-secondary transition-colors"
                          min={0}
                          step="any"
                        />
                        <span className="text-xs text-muted-foreground w-12">{item.unit}</span>
                        <button
                          onClick={() => removeShoppingItem(item.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Verwijder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

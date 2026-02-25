import React, { useState, useMemo, useEffect } from 'react';
import { DailyPlan, Supermarket, Ingredient, DietMode, Language } from '../types';
import { Icons } from './Icons';
import { translations } from '../translations';

interface ShoppingListProps {
  plan: DailyPlan[];
  dietMode: DietMode;
  portions: number;
  lang: Language;
}

// Utilisation du service Google Favicon pour une fiabilité maximale des logos
// Aldi Suisse fait partie d'Aldi Sud, on utilise le domaine principal pour un logo stable
const STORE_LOGOS: Record<Supermarket, string> = {
  [Supermarket.MIGROS]: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.migros.ch&size=256",
  [Supermarket.COOP]: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.coop.ch&size=256",
  [Supermarket.ALDI]: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.aldi-sued.de&size=256",
  [Supermarket.LIDL]: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.lidl.ch&size=256",
  [Supermarket.DENNER]: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.denner.ch&size=256",
  [Supermarket.ALIGRO]: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.aligro.ch&size=256"
};

export const ShoppingList: React.FC<ShoppingListProps> = ({ plan, dietMode, portions, lang }) => {
  const [selectedStore, setSelectedStore] = useState<Supermarket>(Supermarket.MIGROS);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const t = translations[lang];

  // Scale Ingredient Quantity Logic (duplicated for standalone component use)
  const getScaledQuantity = (quantityStr: string) => {
    return quantityStr.replace(/(\d+(?:[\.,]\d+)?)/g, (match) => {
      const num = parseFloat(match.replace(',', '.'));
      if (isNaN(num)) return match;
      const scaled = (num / 2) * portions; // Base is 2 people
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    });
  };

  const aggregatedIngredients = useMemo(() => {
    const all: Ingredient[] = [];
    plan.forEach(day => {
      const breakfast = day.breakfast?.[dietMode];
      const lunch = day.lunch?.[dietMode];
      const dinner = day.dinner?.[dietMode];
      
      if (breakfast?.ingredients) all.push(...breakfast.ingredients);
      if (lunch?.ingredients) all.push(...lunch.ingredients);
      if (dinner?.ingredients) all.push(...dinner.ingredients);
    });

    const grouped: Record<string, Ingredient[]> = {};
    all.forEach(ing => {
      if (!grouped[ing.category]) grouped[ing.category] = [];
      // Clone ingredient to avoid mutating original plan, and scale quantity
      grouped[ing.category].push({
        ...ing,
        quantity: getScaledQuantity(ing.quantity)
      });
    });
    return grouped;
  }, [plan, dietMode, portions]);

  // Calculate estimated total price for the week for each supermarket
  const storeTotals: Record<Supermarket, number> = useMemo(() => {
    const totals = {
      [Supermarket.MIGROS]: 0,
      [Supermarket.COOP]: 0,
      [Supermarket.ALDI]: 0,
      [Supermarket.LIDL]: 0,
      [Supermarket.DENNER]: 0,
      [Supermarket.ALIGRO]: 0
    };

    plan.forEach(day => {
      const meals = [day.breakfast?.[dietMode], day.lunch?.[dietMode], day.dinner?.[dietMode]];
      meals.forEach(meal => {
        if (meal?.priceComparison) {
          Object.entries(meal.priceComparison).forEach(([store, price]) => {
             if (totals[store as Supermarket] !== undefined && typeof price === 'number') {
               // Price is for 2 people, so scale it
               totals[store as Supermarket] += (price / 2) * portions;
             }
          });
        }
      });
    });

    return totals;
  }, [plan, dietMode, portions]);

  const cheapestStore = Object.entries(storeTotals).reduce((a, b) => a[1] < b[1] && a[1] > 0 ? a : b)[0] as Supermarket;

  // Auto-select the cheapest store when it changes (on load or when plan updates)
  useEffect(() => {
    if (cheapestStore) {
      setSelectedStore(cheapestStore);
    }
  }, [cheapestStore]);

  // Sort stores by total price (Cheapest first)
  const sortedStores = useMemo(() => {
    return (Object.keys(storeTotals) as Supermarket[]).sort((a, b) => {
      const priceA = storeTotals[a];
      const priceB = storeTotals[b];
      
      // If price is 0 (empty or error), push to end
      if (priceA <= 0) return 1;
      if (priceB <= 0) return -1;
      
      return priceA - priceB;
    });
  }, [storeTotals]);

  const toggleCheck = (id: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCheckedItems(newSet);
  };

  const getDietLabel = () => {
    switch(dietMode) {
      case 'vegetarian': return t.vegetarian;
      case 'vegan': return t.vegan;
      case 'world': return t.world;
      default: return t.standard;
    }
  };

  const totalItems = Object.values(aggregatedIngredients).reduce((acc: number, curr) => acc + (curr as Ingredient[]).length, 0);

  return (
    <div className="animate-fade-in pb-20">
      
      {/* Supermarket Header */}
      <div className="bg-brand-black text-white rounded-2xl p-6 mb-8 shadow-lg relative z-20">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left">
            <h2 className="font-serif text-2xl text-white mb-2">{t.shoppingList}</h2>
            <p className="text-gray-300 text-xl font-medium mb-4 lg:mb-0">
              {totalItems} {t.articles} {getDietLabel()} ({portions} {t.people})
            </p>
            {/* Total Price Display */}
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-md">
               <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">{t.estimatedTotal}</span>
               <span className="text-xl font-mono font-bold text-brand-gold">
                 {storeTotals[selectedStore] > 0 ? `${storeTotals[selectedStore].toFixed(2)} CHF` : '--.-- CHF'}
               </span>
               {selectedStore === cheapestStore && storeTotals[selectedStore] > 0 && (
                 <span className="bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2 animate-pulse">
                   {t.cheapest}
                 </span>
               )}
            </div>
          </div>

          {/* Store Icons Selector */}
          <div className="flex flex-wrap justify-center gap-3">
            {sortedStores.map((store) => (
              <button
                key={store}
                onClick={() => setSelectedStore(store)}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center p-1 transition-all duration-300 group ${
                  selectedStore === store
                    ? 'bg-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)] ring-2 ring-brand-green z-10'
                    : 'bg-white/10 hover:bg-white/20 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                }`}
                title={`${t.buyAt} ${store}`}
              >
                <div className="w-full h-full bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5">
                  <img 
                    src={STORE_LOGOS[store]} 
                    alt={store} 
                    className="w-full h-full object-contain" 
                  />
                </div>
                {selectedStore === store && (
                  <div className="absolute -top-1 -right-1 bg-brand-green text-white rounded-full p-0.5 border border-brand-black">
                    <Icons.CheckCircle className="w-3 h-3" />
                  </div>
                )}
                {/* Cheapest Badge */}
                {store === cheapestStore && storeTotals[store] > 0 && selectedStore !== store && (
                   <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm z-20 whitespace-nowrap">
                     {t.cheapest}
                   </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(aggregatedIngredients).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Icons.ShoppingCart className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">{t.emptyShopping}</p>
        </div>
      ) : (
        <>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 mb-12">
            {Object.entries(aggregatedIngredients).map(([category, ingredients]) => (
              <div key={category} className="break-inside-avoid bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="font-bold text-md text-brand-black mb-3 pb-2 border-b border-gray-50 flex items-center gap-2">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {(ingredients as Ingredient[]).map((ing, idx) => {
                    const id = `${category}-${ing.item}-${idx}`;
                    const isChecked = checkedItems.has(id);
                    return (
                      <li 
                        key={id} 
                        onClick={() => toggleCheck(id)}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border transition-all flex items-center justify-center ${
                          isChecked ? 'bg-brand-green border-brand-green' : 'border-gray-300 group-hover:border-brand-green'
                        }`}>
                          {isChecked && <Icons.CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 leading-none">
                          <span className={`text-sm transition-all ${isChecked ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                            {ing.item}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">{ing.quantity}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Monetization Sticky Footer / Button */}
          <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center pointer-events-none">
            <button className="pointer-events-auto bg-brand-green text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-brand-green/40 hover:scale-105 transition-transform flex items-center gap-3 border-2 border-white/20">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5">
                <img src={STORE_LOGOS[selectedStore]} alt={selectedStore} className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col items-start leading-none">
                 <span className="text-sm">{t.orderAt} {selectedStore}</span>
                 <span className="text-[10px] opacity-80 font-mono">Total ~ {storeTotals[selectedStore].toFixed(2)} CHF</span>
              </div>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">{t.sponsored}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
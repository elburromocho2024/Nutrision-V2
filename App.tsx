import React, { useState, useEffect, useRef } from 'react';
import { DailyPlan, ViewState, Recipe, DietMode, Supermarket, Language, UserProfile, ActivityLevel, FamilyMember } from './types';
import { generateWeeklyPlan } from './services/geminiService';
import { ShoppingList } from './components/ShoppingList';
import { Icons } from './components/Icons';
import { translations } from './translations';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONSTANTS ---
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

const STORE_CATALOGS: Record<Supermarket, string> = {
  [Supermarket.MIGROS]: "https://www.migros.ch/fr/offers/home",
  [Supermarket.COOP]: "https://www.coop.ch/fr/actions.html",
  [Supermarket.ALDI]: "https://www.aldi-suisse.ch/fr/actions.html",
  [Supermarket.LIDL]: "https://www.lidl.ch/fr/offres.html",
  [Supermarket.DENNER]: "https://www.denner.ch/fr/actions/",
  [Supermarket.ALIGRO]: "https://www.aligro.ch/fr/nos-actions/"
};

// --- COMPONENTS ---

const ProfileModal = ({ 
  profile, 
  onClose, 
  onSave, 
  lang 
}: { 
  profile: UserProfile, 
  onClose: () => void, 
  onSave: (data: Partial<UserProfile>) => void,
  lang: Language
}) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    activityLevel: 'moderate'
  });

  const addMember = () => {
    if (newMember.name && newMember.age && newMember.weight && newMember.height) {
      const members = [...(formData.familyMembers || []), { ...newMember, id: Math.random().toString(36).substr(2, 9) } as FamilyMember];
      setFormData({ ...formData, familyMembers: members });
      setNewMember({ activityLevel: 'moderate' });
      setShowFamilyForm(false);
    }
  };

  const removeMember = (id: string) => {
    setFormData({
      ...formData,
      familyMembers: formData.familyMembers?.filter(m => m.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="font-serif text-2xl font-bold">{t.profile}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Icons.ArrowRight className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto flex-grow">
          {/* Main User Profile */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest flex items-center gap-2">
              <Icons.Users className="w-4 h-4" /> {t.myInfo || 'Mes Informations'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.age}</label>
                <input 
                  type="number" 
                  value={formData.age || ''} 
                  onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.weight}</label>
                <input 
                  type="number" 
                  value={formData.weight || ''} 
                  onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.height}</label>
                <input 
                  type="number" 
                  value={formData.height || ''} 
                  onChange={e => setFormData({...formData, height: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">{t.activity}</label>
                <select 
                  value={formData.activityLevel || 'moderate'} 
                  onChange={e => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none"
                >
                  <option value="sedentary">{t.sedentary}</option>
                  <option value="light">{t.light}</option>
                  <option value="moderate">{t.moderate}</option>
                  <option value="active">{t.active}</option>
                  <option value="very_active">{t.veryActive}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Family Members Section */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-green uppercase tracking-widest flex items-center gap-2">
                <Icons.Users className="w-4 h-4" /> {t.familyMembers || 'Membres de la famille'}
              </h3>
              <button 
                onClick={() => setShowFamilyForm(!showFamilyForm)}
                className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
              >
                <Icons.Plus className="w-3 h-3" /> {t.addMember || 'Ajouter un membre'}
              </button>
            </div>

            {showFamilyForm && (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t.name || 'Nom'}</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Julie"
                      value={newMember.name || ''} 
                      onChange={e => setNewMember({...newMember, name: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t.age}</label>
                    <input 
                      type="number" 
                      value={newMember.age || ''} 
                      onChange={e => setNewMember({...newMember, age: parseInt(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t.weight}</label>
                    <input 
                      type="number" 
                      value={newMember.weight || ''} 
                      onChange={e => setNewMember({...newMember, weight: parseFloat(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t.height}</label>
                    <input 
                      type="number" 
                      value={newMember.height || ''} 
                      onChange={e => setNewMember({...newMember, height: parseFloat(e.target.value)})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t.activity}</label>
                    <select 
                      value={newMember.activityLevel || 'moderate'} 
                      onChange={e => setNewMember({...newMember, activityLevel: e.target.value as ActivityLevel})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                    >
                      <option value="sedentary">{t.sedentary}</option>
                      <option value="light">{t.light}</option>
                      <option value="moderate">{t.moderate}</option>
                      <option value="active">{t.active}</option>
                      <option value="very_active">{t.veryActive}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addMember} className="flex-grow py-2 bg-brand-green text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all">Ajouter</button>
                  <button onClick={() => setShowFamilyForm(false)} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-300 transition-all">Annuler</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {formData.familyMembers?.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-black">{member.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{member.age} ans • {member.weight}kg • {member.height}cm</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMember(member.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.familyMembers || formData.familyMembers.length === 0) && !showFamilyForm && (
                <p className="text-center py-4 text-xs text-gray-400 italic">Aucun autre membre ajouté</p>
              )}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={() => onSave(formData)}
            className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

// 1. Recipe Detail View (Lidl-inspired)
const RecipeDetail = ({ 
  recipe, 
  initialPortions, 
  onClose, 
  onViewShopping,
  onUpdateImage,
  lang
}: { 
  recipe: Recipe, 
  initialPortions: number, 
  onClose: () => void, 
  onViewShopping: () => void,
  onUpdateImage: (newUrl: string) => void,
  lang: Language
}) => {
  const [portions, setPortions] = useState(initialPortions); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];
  
  const imageSearchQuery = encodeURIComponent(`${recipe.title} cooked food high quality`);
  // Augmentation résolution à 1920x1080 (Full HD) pour le détail
  const imageUrl = recipe.imageUrl || `https://tse2.mm.bing.net/th?q=${imageSearchQuery}&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate`;

  const getScaledQuantity = (quantityStr: string) => {
    return quantityStr.replace(/(\d+(?:[\.,]\d+)?)/g, (match) => {
      const num = parseFloat(match.replace(',', '.'));
      if (isNaN(num)) return match;
      const scaled = (num / 2) * portions;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const prices = Object.values(recipe.priceComparison || {}).filter(p => typeof p === 'number') as number[];
  const minPrice = Math.min(...prices);

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto animate-fade-in">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 font-bold text-sm text-gray-600">
          <Icons.ArrowRight className="w-5 h-5 rotate-180" /> {t.back}
        </button>
        <span className="font-serif font-bold text-lg hidden md:block">{recipe.title}</span>
        <button onClick={onViewShopping} className="p-2 bg-brand-green text-white rounded-full hover:bg-green-800 transition-colors">
          <Icons.ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      <div className="relative h-[40vh] md:h-[50vh] w-full group">
        <img 
          src={imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-all"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute top-4 right-4 z-20">
           <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
           <button onClick={() => fileInputRef.current?.click()} className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold border border-white/20 transition-all shadow-lg">
             <Icons.Camera className="w-4 h-4" /> {t.changePhoto}
           </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white max-w-5xl mx-auto">
           <h1 className="font-serif text-3xl md:text-5xl font-bold mb-6 leading-tight">{recipe.title}</h1>
           <div className="flex flex-wrap gap-3 text-sm font-bold tracking-wide items-center select-none">
             <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border border-white/30 text-white">
               <Icons.Clock className="w-4 h-4" /> {t.prepTime}: {recipe.prepTimeMinutes} min
             </span>
             {recipe.calories && (
               <div className="flex items-center gap-2">
                 <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border border-white/30 text-white">
                   <Icons.Flame className="w-4 h-4 text-orange-400" /> 
                                       <span>
                      {recipe.calories * portions} 
                      <span className="text-[10px] opacity-80 font-medium uppercase tracking-tight ml-1">
                        kcal {portions > 1 ? `total (${portions} ${t.portions})` : '/ portion'}
                      </span>
                    </span>
                 </span>
                 {recipe.carbsCal !== undefined && (
                   <>
                     <span className="text-white/60 font-serif text-xl mx-1">=</span>
                     <div className="flex flex-wrap gap-2">
                       <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 text-white text-xs">
                         <Icons.Flame className="w-3 h-3 text-orange-400/70" /> {recipe.carbsCal ? recipe.carbsCal * portions : 0} {t.carbs}
                       </span>
                       <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 text-white text-xs">
                         <Icons.Flame className="w-3 h-3 text-orange-400/70" /> {recipe.fatCal ? recipe.fatCal * portions : 0} {t.fats}
                       </span>
                       <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 text-white text-xs">
                         <Icons.Flame className="w-3 h-3 text-orange-400/70" /> {recipe.proteinCal ? recipe.proteinCal * portions : 0} {t.proteins}
                       </span>
                     </div>
                   </>
                 )}
               </div>
             )}
             <div className="bg-white/20 backdrop-blur px-2 py-1 rounded-full flex items-center gap-2 border border-white/30 text-white transition-all hover:bg-white/30">
               <div className="flex items-center gap-2 pl-2"><Icons.Users className="w-4 h-4" /></div>
               <div className="flex items-center bg-black/20 rounded-full p-0.5 ml-1">
                 <button onClick={(e) => { e.stopPropagation(); setPortions(Math.max(1, portions - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all">-</button>
                 <span className="w-8 text-center tabular-nums">{portions}</span>
                 <button onClick={(e) => { e.stopPropagation(); setPortions(portions + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all">+</button>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="bg-gray-50 rounded-3xl p-6 md:p-8">
                <h3 className="font-serif text-2xl font-bold text-brand-black mb-6 flex items-center gap-2">
                  <Icons.Leaf className="w-5 h-5 text-brand-green" /> {t.ingredients}
                </h3>
                <ul className="space-y-4">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start justify-between pb-3 border-b border-gray-200 last:border-0 border-dashed">
                      <span className="text-gray-700 font-medium">{ing.item}</span>
                      <span className="font-bold text-brand-black whitespace-nowrap ml-4 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                        {getScaledQuantity(ing.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button onClick={onViewShopping} className="w-full py-3 bg-brand-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                    <Icons.ShoppingCart className="w-4 h-4" /> {t.addToShopping}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-2/3">
             <div className="mb-8">
               <h3 className="font-serif text-3xl font-bold text-brand-black mb-2">{t.instructions}</h3>
               <p className="text-gray-400">{t.followSteps}</p>
             </div>
             <div className="space-y-8 mb-12">
               {recipe.instructions?.map((step, idx) => (
                 <div key={idx} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-brand-goldlight text-brand-gold rounded-2xl flex items-center justify-center font-serif text-2xl md:text-3xl font-bold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-lg text-gray-700 leading-relaxed font-light md:text-xl">{step}</p>
                    </div>
                 </div>
               )) || <p className="italic text-gray-400">{t.noInstructions}</p>}
             </div>
             <div className="mb-12 bg-brand-sage/30 rounded-2xl p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">👨‍🍳</div>
               <div>
                 <p className="font-bold text-brand-black">{t.chefTip}</p>
                 <p className="text-sm text-gray-600">{t.chefTipDesc}</p>
               </div>
             </div>
          </div>
        </div>
        <div className="mt-12 pt-12 border-t border-gray-200 animate-slide-up">
           <div className="text-center md:text-left mb-8">
             <h3 className="font-serif text-3xl font-bold text-brand-black mb-2 flex items-center justify-center md:justify-start gap-3">
               {t.priceComparison} <span className="bg-brand-gold/10 text-brand-gold text-xs px-2 py-1 rounded-full border border-brand-gold/20 uppercase tracking-widest">{t.liveFromShelves}</span>
             </h3>
             <p className="text-gray-500">{t.priceEstimates} <span className="font-bold text-brand-black">{portions} {t.people}</span>.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {recipe.priceComparison && Object.entries(recipe.priceComparison)
                .sort(([,a], [,b]) => (a as number) - (b as number))
                .map(([store, basePrice]) => {
                  const price = basePrice as number;
                  const isCheapest = price === minPrice;
                  const pricePerPerson = price / 2;
                  const totalDynamicPrice = pricePerPerson * portions;
                  return (
                    <div key={store} className={`relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 ${isCheapest ? 'bg-white border-brand-green shadow-xl scale-105 z-10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md'}`}>
                      {isCheapest && (<div className="absolute top-0 right-0 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">{t.cheapest}</div>)}
                      <div className="flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-sm flex items-center justify-center"><img src={STORE_LOGOS[store as Supermarket]} alt={store} className="w-full h-full object-contain" /></div>
                            <span className={`font-bold ${isCheapest ? 'text-brand-green' : 'text-gray-700'}`}>{store}</span>
                          </div>
                          <a 
                            href={STORE_CATALOGS[store as Supermarket]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-all shadow-sm group/catalog"
                            title={t.viewCatalog}
                          >
                            <Icons.BookOpen className="w-4 h-4 transition-transform group-hover/catalog:scale-110" />
                          </a>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1"><span className="text-2xl font-mono font-bold text-brand-black">{totalDynamicPrice.toFixed(2)}</span><span className="text-xs font-bold text-gray-400">CHF</span></div>
                          <div className="text-[11px] text-gray-400 mt-1 font-medium bg-gray-100/50 inline-block px-2 py-0.5 rounded-md">Soit {pricePerPerson.toFixed(2)} CHF / {t.perPerson}</div>
                        </div>
                        {isCheapest && (<div className="mt-2 text-center text-[10px] text-brand-green font-bold uppercase tracking-widest flex items-center justify-center gap-1"><Icons.CheckCircle className="w-3 h-3" /> {t.bestChoice}</div>)}
                      </div>
                    </div>
                  );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

// 2. Recipe Card Component
const RecipeCard = ({ recipe, type, portions, onOpen, onViewShopping, lang }: { recipe: Recipe | undefined, type: string, portions: number, onOpen: () => void, onViewShopping: () => void, lang: Language }) => {
  const t = translations[lang];
  if (!recipe) return (
    <div className="bg-gray-50 rounded-3xl h-full min-h-[300px] flex items-center justify-center border border-dashed border-gray-200">
       <div className="text-center opacity-40"><Icons.Loader className="w-8 h-8 mx-auto mb-2 animate-spin" /><p className="text-sm font-medium">{t.loading}</p></div>
    </div>
  );
  const prices = Object.values(recipe.priceComparison || {}).filter(p => typeof p === 'number') as number[];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const estimatedPrice = (minPrice / 2) * portions;
  const imageSearchQuery = encodeURIComponent(`${recipe.title} cooked food high quality`);
  // Augmentation résolution à 1200x900 pour les cartes (sous-menus)
  const imageUrl = recipe.imageUrl || `https://tse2.mm.bing.net/th?q=${imageSearchQuery}&w=1200&h=900&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate`;

  return (
    <div onClick={onOpen} className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
        <img src={imageUrl} alt={recipe.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"; }} />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">{type}</div>
        {recipe.isPremiumVideoAvailable && (<div className="absolute top-3 right-3 bg-brand-gold text-brand-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse z-10"><Icons.Video className="w-4 h-4" /></div>)}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Icons.Clock className="w-3 h-3" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</div>
      </div>
      <div className="px-1 flex flex-col flex-grow">
        <h3 className="font-serif font-bold text-xl text-brand-black mb-1 leading-tight group-hover:text-brand-green transition-colors line-clamp-2">{recipe.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">{recipe.description}</p>
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
           <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.estPrice}</span><span className="font-mono font-bold text-brand-black text-lg">{estimatedPrice > 0 ? estimatedPrice.toFixed(2) : '--.--'} <span className="text-xs text-gray-400">CHF</span></span></div>
           <button onClick={(e) => { e.stopPropagation(); onViewShopping(); }} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-brand-black hover:text-white flex items-center justify-center transition-colors group/btn" title={t.viewShoppingList}><Icons.ShoppingCart className="w-4 h-4 text-gray-400 group-hover/btn:text-white" /></button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('PLANNER');
  const [weekPlan, setWeekPlan] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [dietMode, setDietMode] = useState<DietMode>('standard');
  const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(0);
  const [lang, setLang] = useState<Language>(Language.FR);
  
  const [portions, setPortions] = useState<number>(2);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch profile
        const userDoc = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            // Auto-show modal if profile is incomplete
            if (!data.age || !data.weight || !data.height) {
              setShowProfileModal(true);
            }
          } else {
            // Create initial profile
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              createdAt: new Date().toISOString()
            };
            setDoc(userDoc, initialProfile);
            setProfile(initialProfile);
            setShowProfileModal(true);
          }
        });
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (weekPlan.length > 0) {
      handleGeneratePlan(undefined, currentPlanIndex);
    }
  }, [lang]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // Silently ignore user-initiated cancellation
        return;
      }
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, { ...profile, ...data }, { merge: true });
    setShowProfileModal(false);
  };

  const calculateDailyNeeds = () => {
    if (!profile || !profile.weight || !profile.height || !profile.age) return null;
    
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const getNeeds = (p: { age: number, weight: number, height: number, activityLevel?: ActivityLevel }) => {
      const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age;
      return Math.round(bmr * (multipliers[p.activityLevel || 'moderate']));
    };

    let totalNeeds = getNeeds({
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel
    });

    // Add family members needs
    if (profile.familyMembers) {
      profile.familyMembers.forEach(member => {
        totalNeeds += getNeeds(member);
      });
    }

    // If portions is greater than the number of defined people, add "average" portions
    const definedPeopleCount = 1 + (profile.familyMembers?.length || 0);
    if (portions > definedPeopleCount) {
      const extraPortions = portions - definedPeopleCount;
      const avgNeeds = totalNeeds / definedPeopleCount;
      totalNeeds += Math.round(avgNeeds * extraPortions);
    } else if (portions < definedPeopleCount) {
      // If portions is LESS than defined people, we scale down proportionally
      // (Assuming the user is selecting a subset of the family)
      totalNeeds = Math.round((totalNeeds / definedPeopleCount) * portions);
    }

    return totalNeeds;
  };

  const dailyNeeds = calculateDailyNeeds();

  const handleGeneratePlan = async (initialMode?: DietMode, newIndex: number = 0) => {
    if (initialMode) setDietMode(initialMode);
    
    // Si on change d'index, on veut un loading très court pour la sensation de "switch"
    setLoading(true);
    try {
      const data = await generateWeeklyPlan(newIndex, lang);
      setWeekPlan(data);
      setCurrentPlanIndex(newIndex);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDietToggle = (mode: DietMode) => {
    if (dietMode === mode) {
      setDietMode('standard');
    } else {
      setDietMode(mode);
    }
  };

  const handleLogoClick = () => {
    setWeekPlan([]);
    setView('PLANNER');
    setSelectedDay(0);
    setDietMode('standard');
    setCurrentPlanIndex(0);
  };

  const handleRecipeImageUpdate = (recipeTitle: string, newUrl: string) => {
    setWeekPlan(prevPlan => {
      const updateMeals = (meals: any) => {
        const newMeals = { ...meals };
        Object.keys(newMeals).forEach(key => {
          if (newMeals[key]?.title === recipeTitle) {
            newMeals[key] = { ...newMeals[key], imageUrl: newUrl };
          }
        });
        return newMeals;
      };
      return prevPlan.map(day => ({
        ...day,
        breakfast: updateMeals(day.breakfast),
        lunch: updateMeals(day.lunch),
        dinner: updateMeals(day.dinner),
      }));
    });
    if (selectedRecipe && selectedRecipe.title === recipeTitle) {
      setSelectedRecipe({ ...selectedRecipe, imageUrl: newUrl });
    }
  };

  const currentDayPlan = weekPlan[selectedDay];

  return (
    <div className="min-h-screen font-sans text-brand-black bg-[#FAFAFA]">
      
      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe} 
          initialPortions={portions}
          onClose={() => setSelectedRecipe(null)} 
          onViewShopping={() => { setSelectedRecipe(null); setView('SHOPPING'); }}
          onUpdateImage={(newUrl) => handleRecipeImageUpdate(selectedRecipe.title, newUrl)}
          lang={lang}
        />
      )}

      {showProfileModal && profile && (
        <ProfileModal 
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
          lang={lang}
        />
      )}

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 min-h-16 py-2">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white"><Icons.Leaf className="w-4 h-4" /></div>
            <span className="font-sans text-xl font-bold tracking-tight">{t.appName}</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {Object.values(Language).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${lang === l ? 'bg-white shadow-sm text-brand-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 hover:border-brand-green transition-all"
                  >
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" className="w-full h-full object-cover" />
                  </button>
                  <button onClick={handleLogout} className="text-[10px] font-bold uppercase text-gray-400 hover:text-red-500 transition-colors">{t.logout}</button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-brand-black text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <Icons.Users className="w-3 h-3" /> {t.login}
                </button>
              )}
            </div>

            {weekPlan.length > 0 && (
              <div className="flex items-center bg-gray-100 p-1 rounded-full">
                <button onClick={() => setView('PLANNER')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${view === 'PLANNER' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}>{t.planner}</button>
                <button onClick={() => setView('SHOPPING')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${view === 'SHOPPING' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500'}`}>{t.shopping}</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {view === 'PLANNER' && (
          <>
            {weekPlan.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 animate-fade-in">
                <div className="text-center md:text-left">
                  <h1 className="font-sans text-3xl font-bold text-brand-black mb-1 flex items-center justify-center md:justify-start gap-3">
                    {t.monday.substring(0, 3)} - {t.sunday.substring(0, 3)}
                  </h1>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleGeneratePlan(undefined, currentPlanIndex + 1)}
                      className="mt-1 flex items-center gap-3 text-gray-400 hover:text-brand-gold transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-brand-black group-hover:text-brand-gold transition-all">
                        <Icons.Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold leading-tight">
                          {t.generatePlan}
                        </span>
                        <span className="text-[10px] font-bold opacity-70">
                          ({t.proposition} {(currentPlanIndex % 3) + 1}/3)
                        </span>
                      </div>
                    </button>
                    {dailyNeeds && (
                      <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                    )}
                    {dailyNeeds && (
                      <div className="flex flex-col items-center md:items-start">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {portions > 1 ? `${t.dailyNeeds} (${portions} ${t.people})` : t.dailyNeeds}
                        </span>
                        <span className="text-sm font-bold text-brand-green">{dailyNeeds} {t.kcalDay}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-center flex-wrap">
                  {/* CYCLE BUTTON REMOVED FROM HEADER */}
                  <button onClick={() => setDietMode('standard')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all transform active:scale-95 border ${dietMode === 'standard' ? 'bg-brand-black text-white shadow-brand-black/20 border-brand-black' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-black'}`}><Icons.Utensils className="w-4 h-4" /> {t.standard}</button>
                  <button onClick={() => handleDietToggle('vegetarian')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all transform active:scale-95 border ${dietMode === 'vegetarian' ? 'bg-brand-green text-white shadow-brand-green/20 border-brand-green' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-green'}`}><Icons.Carrot className="w-4 h-4" /> {t.vegetarian}</button>
                  <button onClick={() => handleDietToggle('vegan')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all transform active:scale-95 border ${dietMode === 'vegan' ? 'bg-green-700 text-white shadow-green-700/20 border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-green-700'}`}><Icons.Salad className="w-4 h-4" /> {t.vegan}</button>
                  <button onClick={() => handleDietToggle('world')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all transform active:scale-95 border ${dietMode === 'world' ? 'bg-orange-600 text-white shadow-orange-600/20 border-orange-600' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-600'}`}><Icons.MapPin className="w-4 h-4" /> {t.world}</button>
                </div>
              </div>
            )}

            {!loading && weekPlan.length === 0 && (
              <div className="relative min-h-[60vh] flex items-center justify-center">
                <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden mx-auto max-w-6xl h-full shadow-2xl shadow-brand-green/10">
                   <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" alt="Healthy food background" className="w-full h-full object-cover opacity-20 transform scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                   <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                </div>
                <div className="relative z-10 w-full text-center px-4">
                  <div className="mb-10 animate-slide-up">
                     <span className="inline-block px-4 py-1 rounded-full bg-brand-gold/20 text-brand-black text-xs font-bold uppercase tracking-widest mb-4 border border-brand-gold/30">NutriSion Planner</span>
                     <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-black mb-4">{t.fridgeEmpty}</h1>
                     <p className="text-gray-600 max-w-lg mx-auto text-lg">{t.chooseStyle}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    <button onClick={() => handleGeneratePlan('standard', 0)} className="group relative h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-end p-6 text-left border border-white/10">
                      <img src="https://tse2.mm.bing.net/th?q=steak%20boeuf%20legumes%20rotis%20cuisine%20gastronomique&w=1200&h=1200&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate" alt="Omnivore" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="relative z-10"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white border border-white/30 group-hover:bg-brand-gold group-hover:text-brand-black group-hover:border-transparent transition-all"><Icons.Utensils className="w-6 h-6" /></div><h3 className="font-serif text-2xl font-bold text-white mb-2">{t.standard}</h3><p className="text-sm text-gray-200">{t.omnivoreDesc}</p></div>
                    </button>
                    <button onClick={() => handleGeneratePlan('vegetarian', 0)} className="group relative h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-end p-6 text-left border border-white/10">
                      <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=1200" alt="Vegetarian" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="relative z-10"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white border border-white/30 group-hover:bg-brand-green group-hover:border-transparent transition-all"><Icons.Carrot className="w-6 h-6" /></div><h3 className="font-serif text-2xl font-bold text-white mb-2">{t.vegetarian}</h3><p className="text-sm text-gray-200">{t.vegetarianDesc}</p></div>
                    </button>
                    <button onClick={() => handleGeneratePlan('vegan', 0)} className="group relative h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-end p-6 text-left border border-white/10">
                      <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200" alt="Vegan" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="relative z-10"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white border border-white/30 group-hover:bg-green-600 group-hover:border-transparent transition-all"><Icons.Salad className="w-6 h-6" /></div><h3 className="font-serif text-2xl font-bold text-white mb-2">{t.vegan}</h3><p className="text-sm text-gray-200">{t.veganDesc}</p></div>
                    </button>
                    <button onClick={() => handleGeneratePlan('world', 0)} className="group relative h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-end p-6 text-left border border-white/10">
                      <img src="https://images.unsplash.com/photo-1532339142463-fd0a8979791a?auto=format&fit=crop&q=80&w=1200" alt="World Food" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="relative z-10"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white border border-white/30 group-hover:bg-orange-600 group-hover:border-transparent transition-all"><Icons.MapPin className="w-6 h-6" /></div><h3 className="font-serif text-2xl font-bold text-white mb-2">{t.world}</h3><p className="text-sm text-gray-200">{t.worldDesc}</p></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && weekPlan.length > 0 && (
              <div className="space-y-6">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 w-full md:w-auto justify-center">
                        <div className="flex items-center gap-2 text-brand-green"><Icons.Users className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{t.portions}</span></div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <button onClick={() => setPortions(Math.max(1, portions - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold transition-colors">-</button>
                        <span className="font-bold w-4 text-center text-brand-black">{portions}</span>
                        <button onClick={() => setPortions(portions + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold transition-colors">+</button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1 md:justify-start w-full md:w-auto items-center">
                      
                      {weekPlan.map((day, index) => {
                        const dayNames = [t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday, t.sunday];
                        return (
                          <button key={index} onClick={() => setSelectedDay(index)} className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${selectedDay === index ? 'bg-brand-black text-white shadow-lg transform scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'}`}>
                            {dayNames[index].substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                 </div>

                 {currentDayPlan && (
                   <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
                      <div className="space-y-2"><h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">{t.breakfast}</h2><RecipeCard recipe={currentDayPlan.breakfast?.[dietMode]} type={t.morning} portions={portions} onOpen={() => setSelectedRecipe(currentDayPlan.breakfast?.[dietMode])} onViewShopping={() => setView('SHOPPING')} lang={lang} /></div>
                      <div className="space-y-2"><h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">{t.lunch}</h2><RecipeCard recipe={currentDayPlan.lunch?.[dietMode]} type={t.noon} portions={portions} onOpen={() => setSelectedRecipe(currentDayPlan.lunch?.[dietMode])} onViewShopping={() => setView('SHOPPING')} lang={lang} /></div>
                      <div className="space-y-2"><h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">{t.dinner}</h2><RecipeCard recipe={currentDayPlan.dinner?.[dietMode]} type={t.evening} portions={portions} onOpen={() => setSelectedRecipe(currentDayPlan.dinner?.[dietMode])} onViewShopping={() => setView('SHOPPING')} lang={lang} /></div>
                   </div>
                 )}
              </div>
            )}
          </>
        )}
        {view === 'SHOPPING' && <ShoppingList plan={weekPlan} dietMode={dietMode} portions={portions} lang={lang} />}
      </main>
    </div>
  );
};

export default App;
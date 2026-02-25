import React from 'react';
import { Icons } from './Icons';

interface PremiumViewProps {
  onSubscribe: () => void;
  isPremium: boolean;
}

export const PremiumView: React.FC<PremiumViewProps> = ({ onSubscribe, isPremium }) => {
  return (
    <div className="animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="text-center mb-16">
        <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Le Cercle NutriSion</span>
        <h2 className="font-serif text-4xl md:text-6xl text-brand-black mb-6">L'Art de Manger Mieux.</h2>
        <p className="text-gray-500 max-w-xl mx-auto text-lg font-light">
          Accédez à l'expertise de notre Chef et de notre Nutritionniste pour transformer votre quotidien.
        </p>
      </div>

      {/* Pricing / Status Card */}
      <div className="bg-brand-black text-white rounded-2xl p-10 md:p-16 relative overflow-hidden shadow-2xl max-w-4xl mx-auto mb-20">
         {/* Decorative background elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green opacity-20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
               <h3 className="font-serif text-3xl mb-2 text-brand-gold">
                 {isPremium ? 'Membre VIP Actif' : 'Pass Premium'}
               </h3>
               <p className="text-gray-400 mb-6">
                 {isPremium ? 'Merci de faire partie du club.' : 'Accès illimité aux vidéos, ateliers et conseils.'}
               </p>
               <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-brand-gold" /> Vidéos techniques du Chef Patrick
                  </li>
                  <li className="flex items-center gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-brand-gold" /> Analyses nutritionnelles par Sarah
                  </li>
                  <li className="flex items-center gap-3">
                    <Icons.CheckCircle className="w-5 h-5 text-brand-gold" /> Ateliers physiques à Sion (-20%)
                  </li>
               </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 text-center min-w-[280px]">
               {isPremium ? (
                 <div className="space-y-4">
                    <div className="w-16 h-16 bg-brand-gold text-brand-black rounded-full flex items-center justify-center mx-auto text-2xl">👑</div>
                    <p className="font-bold text-xl">Bienvenue</p>
                 </div>
               ) : (
                 <>
                   <p className="text-3xl font-serif font-bold mb-1">9.90 CHF<span className="text-sm font-sans text-gray-400 font-normal">/mois</span></p>
                   <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Sans engagement</p>
                   <button 
                     onClick={onSubscribe}
                     className="w-full bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                   >
                     Devenir Membre
                   </button>
                 </>
               )}
            </div>
         </div>
      </div>

      {/* Content Preview Grid */}
      <div className="max-w-5xl mx-auto">
         <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-2xl">Derniers Ateliers</h3>
            <span className="text-sm text-brand-green cursor-pointer hover:underline">Voir tout</span>
         </div>
         
         <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                 <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3]">
                    <img 
                      src={`https://picsum.photos/seed/workshop${i}/600/400`} 
                      alt="Workshop" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isPremium ? 'grayscale-[50%]' : ''}`} 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider">
                       Cuisine
                    </div>
                    {!isPremium && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Icons.Lock className="w-10 h-10 text-white opacity-80" />
                       </div>
                    )}
                 </div>
                 <h4 className="font-bold text-lg mb-1 group-hover:text-brand-green transition-colors">Techniques de découpe japonaises</h4>
                 <p className="text-sm text-gray-500">Avec Chef Patrick • 45 min</p>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
};
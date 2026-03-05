import { DailyPlan, Supermarket, Recipe, MealType, Language } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// --- TRANSLATIONS FOR HARDCODED CONTENT ---
const RECIPE_DICTIONARY: Record<string, any> = {
  "Tartines Beurre & Confiture": { [Language.DE]: "Butter- & Marmeladenbrote", [Language.IT]: "Pane Burro e Marmellata", [Language.EN]: "Butter & Jam Toasts" },
  "Pomme & Jus d'Orange": { [Language.DE]: "Apfel & Orangensaft", [Language.IT]: "Mela e Succo d'Arancia", [Language.EN]: "Apple & Orange Juice" },
  "Poulet Rôti": { [Language.DE]: "Brathähnchen", [Language.IT]: "Pollo Arrosto", [Language.EN]: "Roasted Chicken" },
  "Haricots": { [Language.DE]: "Bohnen", [Language.IT]: "Fagiolini", [Language.EN]: "Beans" },
  "Pâtes Carbonara": { [Language.DE]: "Pasta Carbonara", [Language.IT]: "Pasta alla Carbonara", [Language.EN]: "Pasta Carbonara" },
  "Lardons": { [Language.DE]: "Speckwürfel", [Language.IT]: "Pancetta", [Language.EN]: "Bacon bits" },
  "Curry Légumes": { [Language.DE]: "Gemüse-Curry", [Language.IT]: "Curry di Verdure", [Language.EN]: "Vegetable Curry" },
  "Riz": { [Language.DE]: "Reis", [Language.IT]: "Riso", [Language.EN]: "Rice" },
  "Pâtes Champignons": { [Language.DE]: "Pilz-Pasta", [Language.IT]: "Pasta ai Funghi", [Language.EN]: "Mushroom Pasta" },
  "Crème": { [Language.DE]: "Sahne", [Language.IT]: "Panna", [Language.EN]: "Cream" },
  "Dahl Lentilles": { [Language.DE]: "Linsen-Dahl", [Language.IT]: "Dahl di Lenticchie", [Language.EN]: "Lentil Dahl" },
  "Corail": { [Language.DE]: "Rote Linsen", [Language.IT]: "Lenticchie rosse", [Language.EN]: "Red Lentils" },
  "Wok Tofu": { [Language.DE]: "Tofu-Wok", [Language.IT]: "Wok di Tofu", [Language.EN]: "Tofu Wok" },
  "Brocolis": { [Language.DE]: "Brokkoli", [Language.IT]: "Broccoli", [Language.EN]: "Broccoli" },
  "Pavé Saumon": { [Language.DE]: "Lachsfilet", [Language.IT]: "Filetto di Salmone", [Language.EN]: "Salmon Fillet" },
  "Hachis Parmentier": { [Language.DE]: "Hachis Parmentier", [Language.IT]: "Hachis Parmentier", [Language.EN]: "Shepherd's Pie" },
  "Boeuf": { [Language.DE]: "Rindfleisch", [Language.IT]: "Manzo", [Language.EN]: "Beef" },
  "Omelette Feta": { [Language.DE]: "Feta-Omelett", [Language.IT]: "Omelette alla Feta", [Language.EN]: "Feta Omelette" },
  "Epinards": { [Language.DE]: "Spinat", [Language.IT]: "Spinaci", [Language.EN]: "Spinach" },
  "Chili Végé": { [Language.DE]: "Veggie-Chili", [Language.IT]: "Chili Vegano", [Language.EN]: "Veggie Chili" },
  "Steak Soja": { [Language.DE]: "Soja-Steak", [Language.IT]: "Bistecca di Soia", [Language.EN]: "Soy Steak" },
  "Quinoa": { [Language.DE]: "Quinoa", [Language.IT]: "Quinoa", [Language.EN]: "Quinoa" },
  "Chili Sin Carne": { [Language.DE]: "Chili Sin Carne", [Language.IT]: "Chili Sin Carne", [Language.EN]: "Chili Sin Carne" },
  "Steak Frites": { [Language.DE]: "Steak mit Pommes", [Language.IT]: "Bistecca e Patatine", [Language.EN]: "Steak and Fries" },
  "Salade": { [Language.DE]: "Salat", [Language.IT]: "Insalata", [Language.EN]: "Salad" },
  "Salade César": { [Language.DE]: "Caesar Salad", [Language.IT]: "Insalata Cesare", [Language.EN]: "Caesar Salad" },
  "Poulet": { [Language.DE]: "Hähnchen", [Language.IT]: "Pollo", [Language.EN]: "Chicken" },
  "Burger Végé": { [Language.DE]: "Veggie-Burger", [Language.IT]: "Burger Vegano", [Language.EN]: "Veggie Burger" },
  "Frites": { [Language.DE]: "Pommes", [Language.IT]: "Patatine", [Language.EN]: "Fries" },
  "Salade Chèvre": { [Language.DE]: "Ziegenkäse-Salat", [Language.IT]: "Insalata di Capra", [Language.EN]: "Goat Cheese Salad" },
  "Miel": { [Language.DE]: "Honig", [Language.IT]: "Miele", [Language.EN]: "Honey" },
  "Burger Vegan": { [Language.DE]: "Veganer Burger", [Language.IT]: "Burger Vegano", [Language.EN]: "Vegan Burger" },
  "Salade Quinoa": { [Language.DE]: "Quinoa-Salat", [Language.IT]: "Insalata di Quinoa", [Language.EN]: "Quinoa Salad" },
  "Avocat": { [Language.DE]: "Avocado", [Language.IT]: "Avocado", [Language.EN]: "Avocado" },
  "Pâtes Bolo": { [Language.DE]: "Pasta Bolo", [Language.IT]: "Pasta al Ragù", [Language.EN]: "Pasta Bolo" },
  "Croque Monsieur": { [Language.DE]: "Croque Monsieur", [Language.IT]: "Croque Monsieur", [Language.EN]: "Croque Monsieur" },
  "Jambon": { [Language.DE]: "Schinken", [Language.IT]: "Prosciutto", [Language.EN]: "Ham" },
  "Pâtes Pesto": { [Language.DE]: "Pasta Pesto", [Language.IT]: "Pasta al Pesto", [Language.EN]: "Pasta Pesto" },
  "Mozza": { [Language.DE]: "Mozzarella", [Language.IT]: "Mozzarella", [Language.EN]: "Mozzarella" },
  "Croque Végé": { [Language.DE]: "Veggie-Croque", [Language.IT]: "Croque Vegano", [Language.EN]: "Veggie Croque" },
  "Tomate": { [Language.DE]: "Tomate", [Language.IT]: "Pomodoro", [Language.EN]: "Tomato" },
  "Pâtes Bolo Soja": { [Language.DE]: "Soja-Bolo-Pasta", [Language.IT]: "Pasta al Ragù di Soia", [Language.EN]: "Soy Bolo Pasta" },
  "Protéines": { [Language.DE]: "Proteine", [Language.IT]: "Proteine", [Language.EN]: "Proteins" },
  "Tartines Houmous": { [Language.DE]: "Hummus-Brote", [Language.IT]: "Pane e Hummus", [Language.EN]: "Hummus Toasts" },
  "Légumes": { [Language.DE]: "Gemüse", [Language.IT]: "Verdure", [Language.EN]: "Vegetables" },
  "Filet Perche": { [Language.DE]: "Eglifilet", [Language.IT]: "Filetto di Pesce Persico", [Language.EN]: "Perch Fillet" },
  "Meunière": { [Language.DE]: "Nach Müllerin Art", [Language.IT]: "Alla Mugnaia", [Language.EN]: "Meuniere" },
  "Pizza Reine": { [Language.DE]: "Pizza Regina", [Language.IT]: "Pizza Regina", [Language.EN]: "Pizza Regina" },
  "Gratin Dauphinois": { [Language.DE]: "Kartoffelgratin", [Language.IT]: "Patate Gratinate", [Language.EN]: "Potato Gratin" },
  "Pizza 4 Fromages": { [Language.DE]: "Pizza 4 Käse", [Language.IT]: "Pizza 4 Formaggi", [Language.EN]: "4 Cheese Pizza" },
  "Gratin Légumes": { [Language.DE]: "Gemüsegratin", [Language.IT]: "Verdure Gratinate", [Language.EN]: "Vegetable Gratin" },
  "Bechamel Soja": { [Language.DE]: "Soja-Bechamel", [Language.IT]: "Besciamella di Soia", [Language.EN]: "Soy Bechamel" },
  "Pizza Végétale": { [Language.DE]: "Gemüse-Pizza", [Language.IT]: "Pizza Vegetale", [Language.EN]: "Vegetable Pizza" },
  "Cordon Bleu": { [Language.DE]: "Cordon Bleu", [Language.IT]: "Cordon Bleu", [Language.EN]: "Cordon Bleu" },
  "Petits pois": { [Language.DE]: "Erbsen", [Language.IT]: "Piselli", [Language.EN]: "Peas" },
  "Fajitas Poulet": { [Language.DE]: "Hähnchen-Fajitas", [Language.IT]: "Fajitas di Pollo", [Language.EN]: "Chicken Fajitas" },
  "Poivrons": { [Language.DE]: "Paprika", [Language.IT]: "Peperoni", [Language.EN]: "Peppers" },
  "Nuggets Végé": { [Language.DE]: "Veggie-Nuggets", [Language.IT]: "Nuggets Vegani", [Language.EN]: "Veggie Nuggets" },
  "Fajitas Haricots": { [Language.DE]: "Bohnen-Fajitas", [Language.IT]: "Fajitas di Fagioli", [Language.EN]: "Bean Fajitas" },
  "Guacamole": { [Language.DE]: "Guacamole", [Language.IT]: "Guacamole", [Language.EN]: "Guacamole" },
  "Falafels": { [Language.DE]: "Falafel", [Language.IT]: "Falafel", [Language.EN]: "Falafel" },
  "Pita": { [Language.DE]: "Pita", [Language.IT]: "Pita", [Language.EN]: "Pita" },
  "Burrito Vegan": { [Language.DE]: "Veganer Burrito", [Language.IT]: "Burrito Vegano", [Language.EN]: "Vegan Burrito" },
  "Rôti Porc": { [Language.DE]: "Schweinebraten", [Language.IT]: "Arrosto di Maiale", [Language.EN]: "Roasted Pork" },
  "Pommes terre": { [Language.DE]: "Kartoffeln", [Language.IT]: "Patate", [Language.EN]: "Potatoes" },
  "Soupe Légumes": { [Language.DE]: "Gemüsesuppe", [Language.IT]: "Zuppa di Verdure", [Language.EN]: "Vegetable Soup" },
  "Croûtons": { [Language.DE]: "Croutons", [Language.IT]: "Crostini", [Language.EN]: "Croutons" },
  "Lasagnes Végé": { [Language.DE]: "Veggie-Lasagne", [Language.IT]: "Lasagne Vegane", [Language.EN]: "Veggie Lasagna" },
  "Chèvre": { [Language.DE]: "Ziegenkäse", [Language.IT]: "Caprino", [Language.EN]: "Goat cheese" },
  "Soupe": { [Language.DE]: "Suppe", [Language.IT]: "Zuppa", [Language.EN]: "Soup" },
  "Pain": { [Language.DE]: "Brot", [Language.IT]: "Pane", [Language.EN]: "Bread" },
  "Lasagnes Vegan": { [Language.DE]: "Vegane Lasagne", [Language.IT]: "Lasagne Vegane", [Language.EN]: "Vegan Lasagna" },
  "Lentilles": { [Language.DE]: "Linsen", [Language.IT]: "Lenticchie", [Language.EN]: "Lentils" },
  "Velouté Courge": { [Language.DE]: "Kürbiscremesuppe", [Language.IT]: "Vellutata di Zucca", [Language.EN]: "Pumpkin Cream Soup" },
  "Coco": { [Language.DE]: "Kokos", [Language.IT]: "Cocco", [Language.EN]: "Coconut" },
};

const INGREDIENT_DICTIONARY: Record<string, any> = {
  "Pain complet": { [Language.FR]: "Pain complet (tranché)", [Language.DE]: "Vollkornbrot (geschnitten)", [Language.IT]: "Pane integrale (a fette)", [Language.EN]: "Whole wheat bread (sliced)" },
  "Beurre": { [Language.FR]: "Beurre de cuisine (Suisse)", [Language.DE]: "Kochbutter (Schweiz)", [Language.IT]: "Burro da cucina (Svizzera)", [Language.EN]: "Cooking butter (Swiss)" },
  "Confiture": { [Language.FR]: "Confiture de fraises (Extra)", [Language.DE]: "Erdbeerkonfitüre (Extra)", [Language.IT]: "Confettura di fragole (Extra)", [Language.EN]: "Strawberry jam (Extra)" },
  "Pomme": { [Language.FR]: "Pommes (Gala, Suisse)", [Language.DE]: "Äpfel (Gala, Schweiz)", [Language.IT]: "Mele (Gala, Svizzera)", [Language.EN]: "Apples (Gala, Swiss)" },
  "Jus d'orange": { [Language.FR]: "Jus d'orange (100% pur jus)", [Language.DE]: "Orangensaft (100% Fruchtgehalt)", [Language.IT]: "Succo d'arancia (100% puro succo)", [Language.EN]: "Orange juice (100% pure juice)" },
  "Pain de mie": { [Language.FR]: "Pain de mie (complet, sans croûte)", [Language.DE]: "Toastbrot (Vollkorn, ohne Rinde)", [Language.IT]: "Pane in cassetta (integrale, senza crosta)", [Language.EN]: "Toast bread (whole wheat, crustless)" },
  "Pâte à tartiner": { [Language.FR]: "Pâte à tartiner (Choco-Noisette)", [Language.DE]: "Schoko-Haselnuss-Aufstrich", [Language.IT]: "Crema spalmabile alle nocciole", [Language.EN]: "Hazelnut spread" },
  "Banane": { [Language.FR]: "Bananes (mûres, Bio)", [Language.DE]: "Bananen (reif, Bio)", [Language.IT]: "Banane (mature, Bio)", [Language.EN]: "Bananas (ripe, Organic)" },
  "Jus de pomme": { [Language.FR]: "Jus de pomme (naturel, Suisse)", [Language.DE]: "Apfelsaft (naturtrüb, Schweiz)", [Language.IT]: "Succo di mela (naturale, Svizzera)", [Language.EN]: "Apple juice (natural, Swiss)" },
  "Oeuf": { [Language.FR]: "Oeufs (frais, plein air)", [Language.DE]: "Eier (frisch, Freiland)", [Language.IT]: "Uova (fresche, allevate all'aperto)", [Language.EN]: "Eggs (fresh, free-range)" },
  "Raisin": { [Language.FR]: "Raisins (blancs, sans pépins)", [Language.DE]: "Trauben (weiss, kernlos)", [Language.IT]: "Uva (bianca, senza semi)", [Language.EN]: "Grapes (white, seedless)" },
  "Jus multivitaminé": { [Language.FR]: "Jus multivitaminé (12 fruits)", [Language.DE]: "Multivitaminsaft (12 Früchte)", [Language.IT]: "Succo multivitaminico (12 frutti)", [Language.EN]: "Multivitamin juice (12 fruits)" },
  "Pain campagne": { [Language.FR]: "Pain de campagne (au levain)", [Language.DE]: "Bauernbrot (Sauerteig)", [Language.IT]: "Pane casereccio (lievito madre)", [Language.EN]: "Country bread (sourdough)" },
  "Fromage frais": { [Language.FR]: "Fromage frais (type Philadelphia)", [Language.DE]: "Frischkäse (Philadelphia-Art)", [Language.IT]: "Formaggio fresco (tipo Philadelphia)", [Language.EN]: "Fresh cheese (Philadelphia style)" },
  "Poire": { [Language.FR]: "Poires (Conférence, Suisse)", [Language.DE]: "Birnen (Conference, Schweiz)", [Language.IT]: "Pere (Conference, Svizzera)", [Language.EN]: "Pears (Conference, Swiss)" },
  "Jus de raisin": { [Language.FR]: "Jus de raisin (rouge, pur jus)", [Language.DE]: "Traubensaft (rot, pur)", [Language.IT]: "Succo d'uva (rosso, puro)", [Language.EN]: "Grape juice (red, pure)" },
  "Pain grillé": { [Language.FR]: "Biscottes (blé complet)", [Language.DE]: "Vollkorn-Zwieback", [Language.IT]: "Fette biscottate integrali", [Language.EN]: "Whole wheat rusks" },
  "Miel": { [Language.FR]: "Miel de fleurs (Suisse)", [Language.DE]: "Blütenhonig (Schweiz)", [Language.IT]: "Miele di fiori (Svizzera)", [Language.EN]: "Flower honey (Swiss)" },
  "Clémentines": { [Language.FR]: "Clémentines (sans pépins)", [Language.DE]: "Klementinen (kernlos)", [Language.IT]: "Clementine (senza semi)", [Language.EN]: "Clementines (seedless)" },
  "Kiwi": { [Language.FR]: "Kiwis (verts, Bio)", [Language.DE]: "Kiwis (grün, Bio)", [Language.IT]: "Kiwi (verdi, Bio)", [Language.EN]: "Kiwis (green, Organic)" },
  "Jus d'ananas": { [Language.FR]: "Jus d'ananas (sans sucre ajouté)", [Language.DE]: "Ananassaft (ohne Zuckerzusatz)", [Language.IT]: "Succo d'ananas (senza zuccheri aggiunti)", [Language.EN]: "Pineapple juice (no added sugar)" },
  "Brioche": { [Language.FR]: "Brioche tressée (au beurre)", [Language.DE]: "Butterzopf", [Language.IT]: "Treccia al burro", [Language.EN]: "Butter brioche" },
  "Lait": { [Language.FR]: "Lait entier (Suisse)", [Language.DE]: "Vollmilch (Schweiz)", [Language.IT]: "Latte intero (Svizzera)", [Language.EN]: "Whole milk (Swiss)" },
  "Cacao": { [Language.FR]: "Cacao en poudre (Nesquik)", [Language.DE]: "Kakaopulver (Nesquik)", [Language.IT]: "Cacao in polvere (Nesquik)", [Language.EN]: "Cocoa powder (Nesquik)" },
  "Salade de fruits": { [Language.FR]: "Salade de fruits (frais maison)", [Language.DE]: "Frischer Obstsalat", [Language.IT]: "Macedonia di frutta fresca", [Language.EN]: "Fresh fruit salad" },
  "Cuisse poulet": { [Language.FR]: "Cuisses de poulet (fermier, Suisse)", [Language.DE]: "Hähnchenschenkel (Freiland, Schweiz)", [Language.IT]: "Cosce di pollo (allevato all'aperto, Svizzera)", [Language.EN]: "Chicken legs (free-range, Swiss)" },
  "Haricots": { [Language.FR]: "Haricots verts (extra-fins)", [Language.DE]: "Grüne Bohnen (extra fein)", [Language.IT]: "Fagiolini (extra fini)", [Language.EN]: "Green beans (extra fine)" },
  "Pâtes": { [Language.FR]: "Pennes Rigate (Barilla No 73)", [Language.DE]: "Penne Rigate (Barilla No 73)", [Language.IT]: "Penne Rigate (Barilla No 73)", [Language.EN]: "Penne Rigate (Barilla No 73)" },
  "Lardons": { [Language.FR]: "Lardons fumés (qualité supérieure)", [Language.DE]: "Geräucherte Speckwürfel (Premium)", [Language.IT]: "Pancetta affumicata (Premium)", [Language.EN]: "Smoked bacon bits (Premium)" },
  "Boeuf haché": { [Language.FR]: "Pur Boeuf haché (15% MG)", [Language.DE]: "Rinderhackfleisch (15% Fett)", [Language.IT]: "Manzo macinato (15% grassi)", [Language.EN]: "Ground beef (15% fat)" },
  "Pommes terre": { [Language.FR]: "Pommes de terre (Charlotte, Suisse)", [Language.DE]: "Kartoffeln (Charlotte, Schweiz)", [Language.IT]: "Patate (Charlotte, Svizzera)", [Language.EN]: "Potatoes (Charlotte, Swiss)" },
  "Saumon": { [Language.FR]: "Filets de Saumon (frais, avec peau)", [Language.DE]: "Lachsfilets (frisch, mit Haut)", [Language.IT]: "Filetti di salmone (freschi, con pelle)", [Language.EN]: "Salmon fillets (fresh, with skin)" },
  "Riz": { [Language.FR]: "Riz Long Grain (Parfumé)", [Language.DE]: "Langkornreis (Parfümiert)", [Language.IT]: "Riso a chicco lungo (Profumato)", [Language.EN]: "Long grain rice (Scented)" },
  "Jambon": { [Language.FR]: "Jambon cuit (choix supérieur)", [Language.DE]: "Kochschinken (Premium)", [Language.IT]: "Prosciutto cotto (scelta superiore)", [Language.EN]: "Cooked ham (premium choice)" },
  "Pâte pizza": { [Language.FR]: "Pâte à pizza (ronde, prête à l'emploi)", [Language.DE]: "Pizzateig (rund, backfertig)", [Language.IT]: "Pasta per pizza (rotonda, pronta all'uso)", [Language.EN]: "Pizza dough (round, ready to use)" },
  "Mozzarella": { [Language.FR]: "Mozzarella di Bufala (DOP)", [Language.DE]: "Büffelmozzarella (DOP)", [Language.IT]: "Mozzarella di Bufala (DOP)", [Language.EN]: "Buffalo Mozzarella (DOP)" },
  "Champignons": { [Language.FR]: "Champignons de Paris (blancs, frais)", [Language.DE]: "Champignons (weiss, frisch)", [Language.IT]: "Champignons (bianchi, freschi)", [Language.EN]: "Mushrooms (white, fresh)" },
  "Lait coco": { [Language.FR]: "Lait de coco (onctueux, 18% MG)", [Language.DE]: "Kokosmilch (cremig, 18% Fett)", [Language.IT]: "Latte di cocco (cremoso, 18% grassi)", [Language.EN]: "Coconut milk (creamy, 18% fat)" },
  "Tofu": { [Language.FR]: "Tofu ferme (nature, Bio)", [Language.DE]: "Tofu (fest, Natur, Bio)", [Language.IT]: "Tofu (compatto, naturale, Bio)", [Language.EN]: "Tofu (firm, plain, Organic)" },
  "Brocolis": { [Language.FR]: "Brocolis (en bouquets frais)", [Language.DE]: "Brokkoli (frisch, Röschen)", [Language.IT]: "Broccoli (in cimette fresche)", [Language.EN]: "Broccoli (fresh florets)" },
  "Frites": { [Language.FR]: "Frites (coupe large, spécial four)", [Language.DE]: "Pommes (breit, ofenfertig)", [Language.IT]: "Patatine (taglio largo, per forno)", [Language.EN]: "Fries (thick cut, oven ready)" },
  "Sauce tomate": { [Language.FR]: "Sauce Tomate (Basilic & Origan)", [Language.DE]: "Tomatensauce (Basilikum & Oregano)", [Language.IT]: "Salsa di pomodoro (Basilico e Origano)", [Language.EN]: "Tomato sauce (Basil & Oregano)" },
  "Coulis tomate": { [Language.FR]: "Coulis de Tomate (Nature)", [Language.DE]: "Tomaten-Coulis (Natur)", [Language.IT]: "Passata di pomodoro (Naturale)", [Language.EN]: "Tomato coulis (Plain)" },
  "Steak": { [Language.FR]: "Entrecôte de Boeuf (Suisse)", [Language.DE]: "Rinds-Entrecôte (Schweiz)", [Language.IT]: "Entrecôte di manzo (Svizzera)", [Language.EN]: "Beef Entrecôte (Swiss)" },
  "Salade": { [Language.FR]: "Mélange de jeunes pousses", [Language.DE]: "Junger Blattsalat-Mix", [Language.IT]: "Misticanza di novelline", [Language.EN]: "Mixed baby greens" },
  "Origan": { [Language.FR]: "Origan séché (Bio)", [Language.DE]: "Oregano (getrocknet, Bio)", [Language.IT]: "Origano (essiccato, Bio)", [Language.EN]: "Oregano (dried, Organic)" },
  "Légumes grillés": { [Language.FR]: "Légumes grillés (Surgelés)", [Language.DE]: "Grillgemüse (Tiefgekühlt)", [Language.IT]: "Verdure grigliate (Surgelate)", [Language.EN]: "Grilled vegetables (Frozen)" },
  "Cordon bleu": { [Language.FR]: "Cordon Bleu (Porc, Suisse)", [Language.DE]: "Cordon Bleu (Schwein, Schweiz)", [Language.IT]: "Cordon Bleu (Maiale, Svizzera)", [Language.EN]: "Cordon Bleu (Pork, Swiss)" },
  "Petits pois": { [Language.FR]: "Petits pois (fins, conserve)", [Language.DE]: "Erbsen (fein, Dose)", [Language.IT]: "Piselli (fini, lattina)", [Language.EN]: "Peas (fine, canned)" },
  "Carottes": { [Language.FR]: "Carottes (Bio, Suisse)", [Language.DE]: "Karotten (Bio, Schweiz)", [Language.IT]: "Carote (Bio, Svizzera)", [Language.EN]: "Carrots (Organic, Swiss)" },
  "Tortillas": { [Language.FR]: "Tortillas de blé (souples)", [Language.DE]: "Weizentortillas (weich)", [Language.IT]: "Tortillas di grano (morbide)", [Language.EN]: "Wheat tortillas (soft)" },
  "Poivrons": { [Language.FR]: "Poivrons (Mix de couleurs)", [Language.DE]: "Paprika (Farbmix)", [Language.IT]: "Peperoni (misti)", [Language.EN]: "Peppers (mixed colors)" },
  "Épices fajitas": { [Language.FR]: "Épices Fajitas (Sachet)", [Language.DE]: "Fajita-Gewürze (Beutel)", [Language.IT]: "Spezie per fajitas (Bustina)", [Language.EN]: "Fajita spices (Sachet)" },
  "Nuggets soja": { [Language.FR]: "Nuggets de soja (Bio)", [Language.DE]: "Soja-Nuggets (Bio)", [Language.IT]: "Nuggets di soia (Bio)", [Language.EN]: "Soy nuggets (Organic)" },
  "Haricots rouges": { [Language.FR]: "Haricots rouges (Bio, conserve)", [Language.DE]: "Rote Bohnen (Bio, Dose)", [Language.IT]: "Fagioli rossi (Bio, lattina)", [Language.EN]: "Red beans (Organic, canned)" },
  "Falafels": { [Language.FR]: "Falafels (Pois chiches, frais)", [Language.DE]: "Falafel (frisch)", [Language.IT]: "Falafel (freschi)", [Language.EN]: "Falafels (fresh)" },
  "Sauce tahini": { [Language.FR]: "Sauce Tahini (Sésame)", [Language.DE]: "Tahini-Sauce (Sesam)", [Language.IT]: "Salsa tahini (Sesamo)", [Language.EN]: "Tahini sauce (Sesame)" },
  "Haricots noirs": { [Language.FR]: "Haricots noirs (conserve)", [Language.DE]: "Schwarze Bohnen (Dose)", [Language.IT]: "Fagioli neri (lattina)", [Language.EN]: "Black beans (canned)" },
  "Rôti porc": { [Language.FR]: "Rôti de porc (dans le filet)", [Language.DE]: "Schweinebraten (Filet)", [Language.IT]: "Arrosto di maiale (filetto)", [Language.EN]: "Roasted pork (tenderloin)" },
  "Légumes soupe": { [Language.FR]: "Légumes pour soupe (Mix frais)", [Language.DE]: "Suppengemüse (frischer Mix)", [Language.IT]: "Verdure per zuppa (misto fresco)", [Language.EN]: "Soup vegetables (fresh mix)" },
  "Feuilles lasagne": { [Language.FR]: "Feuilles de Lasagne (aux œufs)", [Language.DE]: "Lasagneblätter (Eier)", [Language.IT]: "Fogli di lasagna (all'uovo)", [Language.EN]: "Lasagna sheets (egg)" },
  "Epinards": { [Language.FR]: "Épinards (frais, en branches)", [Language.DE]: "Spinat (frisch, Blatt)", [Language.IT]: "Spinaci (freschi, in foglia)", [Language.EN]: "Spinach (fresh, leaf)" },
  "Chèvre": { [Language.FR]: "Bûche de Chèvre (Sainte-Maure)", [Language.DE]: "Ziegenkäse-Rolle", [Language.IT]: "Caprino (tronchetto)", [Language.EN]: "Goat cheese log" },
  "Bechamel": { [Language.FR]: "Sauce Béchamel (prête à l'emploi)", [Language.DE]: "Bechamelsauce (fertig)", [Language.IT]: "Besciamella (pronta)", [Language.EN]: "Bechamel sauce (ready to use)" },
  "Courge": { [Language.FR]: "Courge Butternut (Bio)", [Language.DE]: "Butternut-Kürbis (Bio)", [Language.IT]: "Zucca Butternut (Bio)", [Language.EN]: "Butternut squash (Organic)" },
  "Poisson": { [Language.FR]: "Poisson frais (selon arrivage)", [Language.DE]: "Frischer Fisch", [Language.IT]: "Pesce fresco", [Language.EN]: "Fresh fish" },
  "Viande": { [Language.FR]: "Viande de boucherie (Suisse)", [Language.DE]: "Fleisch (Schweiz)", [Language.IT]: "Carne (Svizzera)", [Language.EN]: "Meat (Swiss)" },
  "Fruits": { [Language.FR]: "Fruits de saison (Bio)", [Language.DE]: "Saisonfrüchte (Bio)", [Language.IT]: "Frutta di stagione (Bio)", [Language.EN]: "Seasonal fruits (Organic)" },
};

const tStr = (s: string, l: Language, dict: any) => {
  return dict[s]?.[l] || s;
};

const SERVICE_TRANSLATIONS: Record<Language, any> = {
  [Language.FR]: {
    defaultInstructions: [
      "Préparation : Laver soigneusement tous les légumes et préparer votre plan de travail.",
      "Découpe : Couper les ingrédients en morceaux réguliers (dés ou lamelles) pour une cuisson uniforme.",
      "Cuisson des protéines : Faire chauffer une poêle avec un filet d'huile. Saisir la viande ou le poisson pendant 6 à 8 minutes à feu moyen, en retournant à mi-cuisson.",
      "Accompagnement : Si nécessaire, cuire les féculents (riz, pâtes) dans une casserole d'eau bouillante salée selon le temps indiqué sur le paquet (environ 10 min).",
      "Assemblage : Mélanger les légumes avec la source de protéines, ajouter l'assaisonnement et laisser mijoter 3 à 5 minutes.",
      "Service : Dresser dans des assiettes chaudes, ajouter une touche d'herbes fraîches si vous en avez. Bon appétit !"
    ],
    categories: { veg: "Légumes", meat: "Viande", grocery: "Epicerie", dairy: "Crèmerie", bakery: "Boulangerie", drinks: "Boissons", frozen: "Surgelés", fish: "Poisson", fruit: "Fruits", fresh: "Frais", canned: "Conserve" },
    chefTip: "Conseil du Chef",
    chefTipDesc: "N'ayez pas peur de goûter votre plat en cours de route ! C'est le secret pour ajuster le sel et le poivre comme un pro.",
    prep: "Prép",
    min: "min",
    kcal: "kcal",
    serves: "pers.",
    back: "Retour",
    days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
  },
  [Language.DE]: {
    defaultInstructions: [
      "Alle Zutaten waschen und vorbereiten.",
      "Hauptzutaten (Fleisch, Kohlenhydrate) nach Geschmack kochen.",
      "Das Gericht mit Gemüse und Gewürzen zusammenstellen.",
      "Je nach Rezept warm oder kalt servieren."
    ],
    categories: { veg: "Gemüse", meat: "Fleisch", grocery: "Lebensmittel", dairy: "Molkerei", bakery: "Bäckerei", drinks: "Getränke", frozen: "Tiefkühlkost", fish: "Fisch", fruit: "Früchte", fresh: "Frisch", canned: "Konserve" },
    chefTip: "Tipp vom Chef",
    chefTipDesc: "Zögern Sie nicht, bei jedem Schritt nach Ihrem Geschmack zu würzen.",
    prep: "Vorb",
    min: "Min",
    kcal: "kcal",
    serves: "Pers.",
    back: "Zurück",
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
  },
  [Language.IT]: {
    defaultInstructions: [
      "Lavare e preparare tutti gli ingredienti.",
      "Cuocere gli elementi principali (carne, amidi) secondo i propri gusti.",
      "Assemblare il piatto con le verdure e il condimento.",
      "Servire caldo o freddo a seconda della ricetta."
    ],
    categories: { veg: "Verdure", meat: "Carne", grocery: "Alimentari", dairy: "Latticini", bakery: "Panetteria", drinks: "Bevande", frozen: "Surgelati", fish: "Pesce", fruit: "Frutta", fresh: "Fresco", canned: "Conserva" },
    chefTip: "Consiglio dello Chef",
    chefTipDesc: "Non esitate a condire secondo i vostri gusti in ogni fase.",
    prep: "Prep",
    min: "min",
    kcal: "kcal",
    serves: "pers.",
    back: "Indietro",
    days: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
  },
  [Language.EN]: {
    defaultInstructions: [
      "Wash and prepare all ingredients.",
      "Cook the main elements (meat, starches) to your taste.",
      "Assemble the dish with vegetables and seasoning.",
      "Serve hot or cold depending on the recipe."
    ],
    categories: { veg: "Vegetables", meat: "Meat", grocery: "Grocery", dairy: "Dairy", bakery: "Bakery", drinks: "Drinks", frozen: "Frozen", fish: "Fish", fruit: "Fruit", fresh: "Fresh", canned: "Canned" },
    chefTip: "Chef's Tip",
    chefTipDesc: "Don't hesitate to season to your taste at every step.",
    prep: "Prep",
    min: "min",
    kcal: "kcal",
    serves: "pers.",
    back: "Back",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  [Language.ES]: {
    defaultInstructions: [
      "Lavar y preparar todos los ingredientes.",
      "Cocinar los elementos principales (carne, almidones) a su gusto.",
      "Montar el plato con las verduras y el aderezo.",
      "Servir caliente o frío según la receta."
    ],
    categories: { veg: "Verduras", meat: "Carne", grocery: "Abarrotes", dairy: "Lácteos", bakery: "Panadería", drinks: "Bebidas", frozen: "Congelados", fish: "Pescado", fruit: "Fruta", fresh: "Fresco", canned: "Enlatado" },
    chefTip: "Consejo del Chef",
    chefTipDesc: "No dudes en sazonar a tu gusto en cada paso.",
    prep: "Prep",
    min: "min",
    kcal: "kcal",
    serves: "pers.",
    back: "Volver",
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  }
};

// --- CONFIGURATION ---
// Image Lomo Saltado style "Jenga/Tour de Frites" sur assiette noire (Haute Résolution)
const LOMO_SALTADO_IMAGE = "https://tse3.mm.bing.net/th?q=lomo%20saltado%20emplatado%20fino%20papas%20torre&w=1920&h=1920&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Panadero (Haute Résolution)
const PANADERO_IMAGE = "https://tse4.mm.bing.net/th?q=champinon%20relleno%20yema%20huevo%20frita&w=1920&h=1920&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Poulet Rôti (Haute Résolution)
const POULET_ROTI_IMAGE = "https://tse1.mm.bing.net/th?q=roasted%20chicken%20thighs%20with%20green%20beans%20gourmet%20plated&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Soupe (Haute Résolution)
const SOUPE_IMAGE = "https://tse4.mm.bing.net/th?q=vegetable%20soup%20gourmet%20plated%20bowl%20rustic&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Lasagnes (Haute Résolution)
const LASAGNES_IMAGE = "https://tse2.mm.bing.net/th?q=lasagna%20slice%20gourmet%20plated%20basil&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Burger (Haute Résolution)
const BURGER_IMAGE = "https://tse3.mm.bing.net/th?q=gourmet%20burger%20plated%20with%20fries&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Pizza (Haute Résolution)
const PIZZA_IMAGE = "https://tse1.mm.bing.net/th?q=gourmet%20pizza%20plated%20rustic%20wood%20oven&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Pâtes (Haute Résolution)
const PASTA_IMAGE = "https://tse4.mm.bing.net/th?q=gourmet%20pasta%20plated%20italian%20restaurant&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Poisson (Haute Résolution)
const FISH_IMAGE = "https://tse2.mm.bing.net/th?q=gourmet%20fish%20fillet%20plated%20lemon%20herbs&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Gratin (Haute Résolution)
const GRATIN_IMAGE = "https://tse1.mm.bing.net/th?q=potato%20gratin%20dauphinois%20plated%20gourmet&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Salade (Haute Résolution)
const SALAD_IMAGE = "https://tse3.mm.bing.net/th?q=gourmet%20fresh%20salad%20plated%20healthy&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Dahl (Haute Résolution)
const DAHL_IMAGE = "https://tse2.mm.bing.net/th?q=gourmet%20lentil%20dahl%20plated%20bowl%20cilantro&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Curry (Haute Résolution)
const CURRY_IMAGE = "https://tse4.mm.bing.net/th?q=gourmet%20vegetable%20curry%20plated%20rice&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Wok (Haute Résolution)
const WOK_IMAGE = "https://tse1.mm.bing.net/th?q=gourmet%20tofu%20vegetable%20wok%20plated&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Omelette (Haute Résolution)
const OMELETTE_IMAGE = "https://tse4.mm.bing.net/th?q=gourmet%20omelette%20plated%20herbs&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// Image Chili (Haute Résolution)
const CHILI_IMAGE = "https://tse2.mm.bing.net/th?q=gourmet%20chili%20con%20carne%20bowl%20plated&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate";

// --- UTILITAIRES ---
const createPrice = (base: number) => ({
  [Supermarket.MIGROS]: parseFloat((base).toFixed(2)),
  [Supermarket.COOP]: parseFloat((base * 1.05).toFixed(2)),
  [Supermarket.ALDI]: parseFloat((base * 0.70).toFixed(2)),
  [Supermarket.LIDL]: parseFloat((base * 0.65).toFixed(2)),
  [Supermarket.DENNER]: parseFloat((base * 0.75).toFixed(2)),
  [Supermarket.ALIGRO]: parseFloat((base * 0.68).toFixed(2)),
});

const makeRecipe = (title: string, desc: string, price: number, ings: {i:string,q:string,c:string}[], lang: Language = Language.FR): Recipe => {
  const t = SERVICE_TRANSLATIONS[lang];
  const translatedTitle = tStr(title, lang, RECIPE_DICTIONARY);
  const translatedDesc = tStr(desc, lang, RECIPE_DICTIONARY);
  let img = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(title + " " + desc + " gourmet plated food photography high resolution")}&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate`;
  
  // SÉLECTION D'IMAGE HAUTE QUALITÉ
  if (title === "Poulet Rôti") img = POULET_ROTI_IMAGE;
  else if (title.includes("Lomo Saltado")) img = LOMO_SALTADO_IMAGE;
  else if (title.includes("Panadero")) img = PANADERO_IMAGE;
  else if (title.includes("Soupe") || title.includes("Velouté")) img = SOUPE_IMAGE;
  else if (title.includes("Lasagnes")) img = LASAGNES_IMAGE;
  else if (title.includes("Burger")) img = BURGER_IMAGE;
  else if (title.includes("Pizza")) img = PIZZA_IMAGE;
  else if (title.includes("Pâtes") || title.includes("Spaghetti") || title.includes("Pennes")) img = PASTA_IMAGE;
  else if (title.includes("Poisson") || title.includes("Saumon") || title.includes("Perche")) img = FISH_IMAGE;
  else if (title.includes("Gratin") || title.includes("Hachis Parmentier")) img = GRATIN_IMAGE;
  else if (title.includes("Salade")) img = SALAD_IMAGE;
  else if (title.includes("Dahl")) img = DAHL_IMAGE;
  else if (title.includes("Curry")) img = CURRY_IMAGE;
  else if (title.includes("Wok")) img = WOK_IMAGE;
  else if (title.includes("Omelette")) img = OMELETTE_IMAGE;
  else if (title.includes("Chili")) img = CHILI_IMAGE;

  // Valeurs par défaut
  let instructions = [...t.defaultInstructions];
  let prepTime = 15;
  let cookTime = 20;
  let cals = 550;

  // Default macro breakdown (40/30/30)
  let carbsCal = Math.round(cals * 0.4);
  let fatCal = Math.round(cals * 0.3);
  let proteinCal = cals - carbsCal - fatCal;

  if (title === "Poulet Rôti") {
    if (lang === Language.FR) {
      instructions = [
        "Préchauffer le four à 200°C. Placer les cuisses de poulet dans un plat allant au four.",
        "Badigeonner le poulet d'huile d'olive, saler, poivrer et ajouter des herbes de Provence.",
        "Enfourner pour 35 à 40 minutes. À mi-cuisson, ajouter un petit fond d'eau dans le plat.",
        "Pendant ce temps, cuire les haricots à la vapeur ou dans l'eau bouillante pendant 10-12 minutes.",
        "Vérifier que le poulet est bien doré et croustillant avant de servir avec les haricots chauds."
      ];
    }
    prepTime = 10;
    cookTime = 40;
  }

  if (title.includes("Pâtes") || title.includes("Spaghetti") || title.includes("Pennes")) {
    if (lang === Language.FR) {
      if (title.includes("Carbonara")) {
        instructions = [
          "Porter une grande casserole d'eau salée à ébullition et cuire les pâtes selon le temps indiqué (souvent 9-11 min).",
          "Pendant ce temps, faire dorer les lardons dans une poêle sans ajout de matière grasse pendant 5 minutes.",
          "Dans un bol, battre les œufs avec du poivre et une bonne dose de parmesan (ou fromage râpé).",
          "Égoutter les pâtes, les remettre dans la casserole chaude (feu éteint) et ajouter les lardons.",
          "Verser le mélange d'œufs sur les pâtes chaudes et mélanger énergiquement : la chaleur des pâtes va cuire l'œuf pour créer une sauce crémeuse.",
          "Servir immédiatement avec un peu de fromage supplémentaire."
        ];
      } else if (title.includes("Champignons")) {
        instructions = [
          "Cuire les pâtes dans une grande casserole d'eau bouillante salée.",
          "Pendant ce temps, nettoyer et couper les champignons en lamelles.",
          "Faire revenir les champignons dans une poêle avec un peu d'huile et de l'ail haché pendant 8 minutes.",
          "Ajouter la crème liquide, saler, poivrer et laisser mijoter 2 minutes à feu doux.",
          "Égoutter les pâtes et les mélanger directement dans la poêle avec la sauce aux champignons.",
          "Parsemer de persil frais avant de servir."
        ];
      } else if (title.includes("Bolo")) {
        instructions = [
          "Cuire les pâtes dans l'eau bouillante salée.",
          "Dans une sauteuse, faire revenir l'oignon haché et la viande (ou soja) pendant 5 minutes.",
          "Ajouter la sauce tomate, saler, poivrer et laisser mijoter à feu doux pendant 10 minutes.",
          "Mélanger les pâtes égouttées avec la sauce bolognaise.",
          "Servir chaud avec un peu de fromage râpé."
        ];
      } else if (title.includes("Pesto")) {
        instructions = [
          "Cuire les pâtes dans l'eau bouillante salée.",
          "Pendant la cuisson, couper la mozzarella en petits dés.",
          "Égoutter les pâtes en réservant une cuillère à soupe d'eau de cuisson.",
          "Mélanger les pâtes avec le pesto, l'eau de cuisson réservée et les dés de mozzarella.",
          "Servir immédiatement."
        ];
      } else if (title.includes("Risotto")) {
        instructions = [
          "Faire chauffer le bouillon dans une casserole.",
          "Dans une sauteuse, faire revenir l'oignon haché dans un peu d'huile.",
          "Ajouter le riz et remuer jusqu'à ce qu'il soit translucide.",
          "Verser le vin blanc et laisser évaporer.",
          "Ajouter le bouillon louche après louche, en attendant que le liquide soit absorbé avant d'en remettre.",
          "Une fois le riz cuit et crémeux, ajouter le parmesan et les légumes (asperges ou champignons).",
          "Servir immédiatement."
        ];
      } else if (title.includes("Paella")) {
        instructions = [
          "Faire revenir les morceaux de viande ou de poisson dans une grande poêle à paella.",
          "Ajouter les légumes coupés en dés et faire sauter 5 minutes.",
          "Verser le riz et le safran, bien mélanger.",
          "Couvrir de bouillon chaud et laisser cuire sans remuer pendant 15-20 minutes.",
          "Le riz doit absorber tout le liquide. Servir avec des quartiers de citron."
        ];
      } else if (title.includes("Taboulé")) {
        instructions = [
          "Verser la semoule dans un saladier et ajouter le même volume d'eau bouillante salée. Couvrir et laisser gonfler 5 minutes.",
          "Pendant ce temps, couper les tomates, le concombre et les herbes très finement.",
          "Égrainer la semoule à la fourchette.",
          "Mélanger la semoule avec les légumes, le jus de citron, l'huile d'olive et les herbes.",
          "Laisser reposer au frais au moins 30 minutes avant de servir."
        ];
      } else if (title.includes("Salade Grecque")) {
        instructions = [
          "Couper les tomates, le concombre et les poivrons en gros dés.",
          "Ajouter les olives et l'oignon rouge coupé en fines lamelles.",
          "Disposer la feta coupée en cubes sur le dessus.",
          "Arroser d'huile d'olive, ajouter de l'origan, du sel et du poivre.",
          "Mélanger délicatement et servir frais."
        ];
      } else if (title.includes("Tomates Farcies")) {
        instructions = [
          "Préchauffer le four à 180°C.",
          "Couper le chapeau des tomates et les évider à la petite cuillère.",
          "Mélanger la chair des tomates avec la farce (viande ou légumes) et des herbes.",
          "Remplir les tomates avec ce mélange et replacer les chapeaux.",
          "Disposer dans un plat avec un peu de riz au fond pour absorber le jus.",
          "Enfourner pour 40 minutes."
        ];
      } else {
        instructions = [
          "Porter une grande casserole d'eau salée à ébullition.",
          "Cuire les pâtes selon le temps indiqué sur le paquet.",
          "Égoutter les pâtes et ajouter une noisette de beurre ou un filet d'huile d'olive.",
          "Servir chaud en accompagnement."
        ];
      }
    }
    prepTime = 5;
    cookTime = 12;
  }

  if (title.includes("Gratin") || title.includes("Hachis Parmentier")) {
    if (title === "Hachis Parmentier") {
      if (lang === Language.FR) {
        instructions = [
          "Éplucher les pommes de terre, les couper en morceaux et les cuire 20 min dans l'eau bouillante salée.",
          "Pendant ce temps, faire revenir le bœuf haché dans une poêle avec un peu d'huile pendant 8 minutes.",
          "Écraser les pommes de terre en purée avec un peu de lait et de beurre.",
          "Dans un plat à gratin, étaler la viande, puis recouvrir avec la purée de pommes de terre.",
          "Saupoudrer de fromage et enfourner 15 minutes à 200°C pour faire gratiner le dessus."
        ];
      }
      prepTime = 15;
      cookTime = 35;
    }
  }

  if (title === "Pavé Saumon") {
    if (lang === Language.FR) {
      instructions = [
        "Cuire le riz dans l'eau bouillante salée (environ 10-12 minutes).",
        "Assaisonner le saumon de sel et poivre côté chair.",
        "Faire chauffer une poêle avec un peu d'huile. Déposer le saumon côté peau en premier.",
        "Cuire 4 minutes côté peau, puis retourner délicatement et cuire 3 minutes de l'autre côté.",
        "Servir le saumon bien chaud sur le lit de riz avec un quartier de citron."
      ];
    }
    prepTime = 5;
    cookTime = 15;
  }

  if (title === "Curry Légumes") {
    if (lang === Language.FR) {
      instructions = [
        "Cuire le riz dans l'eau bouillante salée (10-12 min).",
        "Couper les légumes en dés. Les faire revenir dans une sauteuse avec un peu d'huile pendant 5 minutes.",
        "Ajouter le lait de coco et une cuillère à soupe de curry en poudre.",
        "Laisser mijoter à feu doux pendant 15 minutes jusqu'à ce que les légumes soient tendres.",
        "Servir le curry bien crémeux sur le riz chaud."
      ];
    }
    prepTime = 10;
    cookTime = 20;
  }

  if (title === "Dahl Lentilles") {
    if (lang === Language.FR) {
      instructions = [
        "Rincer les lentilles à l'eau froide.",
        "Dans une casserole, mélanger les lentilles, les tomates concassées et deux fois leur volume d'eau.",
        "Porter à ébullition, puis baisser le feu et laisser mijoter 20 minutes en remuant de temps en temps.",
        "Ajouter un peu de lait de coco ou de crème en fin de cuisson pour plus d'onctuosité.",
        "Assaisonner généreusement et servir avec du riz ou du pain."
      ];
    }
    prepTime = 5;
    cookTime = 25;
  }

  if (title === "Wok Tofu") {
    if (lang === Language.FR) {
      instructions = [
        "Couper le tofu en dés et les brocolis en petits bouquets.",
        "Faire chauffer un wok ou une grande poêle avec de l'huile.",
        "Saisir le tofu jusqu'à ce qu'il soit doré (environ 5 minutes).",
        "Ajouter les brocolis et un petit fond d'eau, couvrir et laisser cuire 5 minutes à la vapeur.",
        "Ajouter un trait de sauce soja et faire sauter le tout à feu vif pendant 2 minutes avant de servir."
      ];
    }
    prepTime = 10;
    cookTime = 12;
  }

  if (title === "Lomo Saltado") {
    img = LOMO_SALTADO_IMAGE;
    if (lang === Language.FR) {
      instructions = [
        "Couper le bœuf en lanières et le faire sauter très rapidement au wok fumant (flambé).",
        "Ajouter l'oignon rouge et la tomate coupés en gros quartiers, faire sauter 1 minute pour garder le croquant.",
        "Déglacer avec la sauce soja et un trait de vinaigre.",
        "Dressage Gastronomique : Mouler le riz blanc. Disposer la viande en sauce à côté. Empiler les grosses frites en 'tour' (style Jenga) par-dessus la viande."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Rindfleisch in Streifen schneiden und sehr schnell im rauchenden Wok anbraten (flambieren).",
        "Rote Zwiebel und Tomate in grobe Spalten schneiden, 1 Minute mitbraten, um die Knackigkeit zu bewahren.",
        "Mit Sojasauce und einem Schuss Essig ablöschen.",
        "Gastronomisches Anrichten: Weißen Reis formen. Fleisch in Sauce daneben anrichten. Große Pommes als 'Turm' (Jenga-Stil) über das Fleisch stapeln."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Tagliare il manzo a strisce e saltarlo molto velocemente nel wok fumante (flambé).",
        "Aggiungere la cipolla rossa e il pomodoro tagliati a grossi spicchi, saltare per 1 minuto per mantenere la croccantezza.",
        "Sfumare con salsa di soia e un goccio di aceto.",
        "Impiattamento Gastronomico: Modellare il riso bianco. Disporre la carne in salsa a lato. Impilare le patatine fritte a 'torre' (stile Jenga) sopra la carne."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Cortar la carne en tiras y saltearla muy rápidamente en un wok humeante (flambeado).",
        "Añadir la cebolla roja y el tomate cortados en gajos grandes, saltear durante 1 minuto para mantener el crujiente.",
        "Desglasar con salsa de soja y un chorrito de vinagre.",
        "Emplatado Gastronómico: Moldear el arroz blanco. Disponer la carne en salsa a un lado. Apilar las patatas fritas gruesas en 'torre' (estilo Jenga) sobre la carne."
      ];
    } else {
      instructions = [
        "Cut the beef into strips and sauté very quickly in a smoking wok (flambé).",
        "Add the red onion and tomato cut into large wedges, sauté for 1 minute to keep the crunch.",
        "Deglaze with soy sauce and a dash of vinegar.",
        "Gourmet Plating: Mold the white rice. Arrange the meat in sauce next to it. Stack the large fries in a 'tower' (Jenga style) over the meat."
      ];
    }
    prepTime = 20;
    cookTime = 10;
    cals = 750;
    carbsCal = 300;
    fatCal = 250;
    proteinCal = 200;
  }
  
  if (title === "Panadero") {
    img = PANADERO_IMAGE;
    if (lang === Language.FR) {
      instructions = [
        "Badigeonner les champignons d'huile et les cuire à l'Airfryer ou au four à 180°C pendant 15 à 20 minutes.",
        "Séparer les jaunes d'œufs, les recouvrir délicatement de chapelure et les placer au réfrigérateur pendant au moins 2 heures (étape essentielle !).",
        "Faire frire les jaunes panés dans l'huile bien chaude pendant 15 à 20 secondes seulement.",
        "Dresser : Placer un morceau de fromage Cabrales (ou Bleu) dans chaque champignon chaud.",
        "Déposer le jaune croustillant par-dessus. Au moment de couper, le jaune doit couler sur le fromage et le champignon."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Pilze mit Öl bestreichen und im Airfryer oder Ofen bei 180°C für 15 bis 20 Minuten garen.",
        "Eigelbe trennen, vorsichtig mit Paniermehl bedecken und für mindestens 2 Stunden in den Kühlschrank stellen (wichtiger Schritt!).",
        "Panierte Eigelbe nur 15 bis 20 Sekunden in sehr heißem Öl frittieren.",
        "Anrichten: Ein Stück Cabrales-Käse (oder Blauschimmelkäse) in jeden heißen Pilz geben.",
        "Das knusprige Eigelb darauf platzieren. Beim Aufschneiden sollte das Eigelb über den Käse und den Pilz fließen."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Spennellare i funghi con olio e cuocerli in Airfryer o in forno a 180°C per 15-20 minuti.",
        "Separare i tuorli, coprirli delicatamente con il pangrattato e metterli in frigorifero per almeno 2 ore (passaggio essenziale!).",
        "Friggere i tuorli impanati in olio ben caldo per soli 15-20 secondi.",
        "Impiattare: Mettere un pezzetto di formaggio Cabrales (o Blu) in ogni fungo caldo.",
        "Posizionare il tuorlo croccante sopra. Al momento di tagliare, il tuorlo deve colare sul formaggio e sul fungo."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Pincelar los champiñones con aceite y cocinarlos en la Airfryer o en el horno a 180°C durante 15 a 20 minutos.",
        "Separar las yemas de huevo, cubrirlas delicadamente con pan rallado y meterlas en la nevera durante al menos 2 horas (¡paso esencial!).",
        "Freír las yemas empanadas en aceite muy caliente durante solo 15 a 20 segundos.",
        "Emplatar: Colocar un trozo de queso Cabrales (o queso azul) en cada champiñón caliente.",
        "Colocar la yema crujiente encima. Al cortar, la yema debe fluir sobre el queso y el champiñón."
      ];
    } else {
      instructions = [
        "Brush the mushrooms with oil and cook in the Airfryer or oven at 180°C for 15 to 20 minutes.",
        "Separate the egg yolks, gently cover them with breadcrumbs and place in the refrigerator for at least 2 hours (essential step!).",
        "Fry the breaded yolks in very hot oil for only 15 to 20 seconds.",
        "Plate: Place a piece of Cabrales cheese (or Blue cheese) in each hot mushroom.",
        "Place the crispy yolk on top. When cutting, the yolk should flow over the cheese and the mushroom."
      ];
    }
    prepTime = 130;
    cookTime = 20;
    cals = 400;
    carbsCal = 100;
    fatCal = 200;
    proteinCal = 100;
  }

  if (title.includes("Burger")) {
    if (lang === Language.FR) {
      instructions = [
        "Faire griller les pains burger au grille-pain ou à la poêle.",
        "Cuire le steak (viande ou végétal) dans une poêle avec un peu d'huile (4 min par face).",
        "Pendant ce temps, préparer la garniture : laver la salade, couper les tomates et l'oignon.",
        "Monter le burger : étaler la sauce sur le pain, ajouter la salade, le steak chaud, le fromage et les légumes.",
        "Servir avec des frites ou une salade."
      ];
    }
    prepTime = 10;
    cookTime = 10;
  }

  if (title.includes("Croque")) {
    if (lang === Language.FR) {
      instructions = [
        "Beurrer légèrement les tranches de pain de mie.",
        "Disposer le jambon (ou les tomates) et le fromage entre deux tranches de pain.",
        "Faire dorer à la poêle 3 minutes de chaque côté ou utiliser un appareil à croque-monsieur.",
        "Le fromage doit être bien fondu et le pain croustillant.",
        "Servir chaud avec une petite salade verte."
      ];
    }
    prepTime = 5;
    cookTime = 6;
  }

  if (title.includes("Filet Perche") || title.includes("Poisson") || title.includes("Saumon")) {
    if (title.includes("Filet Perche")) {
      if (lang === Language.FR) {
        instructions = [
          "Rincer les filets de perche et les éponger avec du papier absorbant.",
          "Passer les filets dans la farine, secouer pour enlever l'excédent.",
          "Faire fondre le beurre dans une poêle jusqu'à ce qu'il mousse.",
          "Cuire les filets 2 minutes de chaque côté jusqu'à ce qu'ils soient bien dorés.",
          "Arroser de jus de citron et parsemer de persil frais avant de servir."
        ];
      }
      prepTime = 10;
      cookTime = 5;
    }
  }

  if (title.includes("Gratin")) {
    if (lang === Language.FR) {
      instructions = [
        "Préchauffer le four à 180°C.",
        "Éplucher et couper les légumes (pommes de terre, courgettes) en fines rondelles.",
        "Disposer les légumes dans un plat à gratin beurré, en alternant les couches.",
        "Mélanger la crème avec l'ail haché, du sel et du poivre, puis verser sur les légumes.",
        "Enfourner pour 45 minutes jusqu'à ce que les légumes soient tendres et le dessus gratiné."
      ];
    }
    prepTime = 15;
    cookTime = 45;
  }

  if (title.includes("Rôti Porc")) {
    if (lang === Language.FR) {
      instructions = [
        "Préchauffer le four à 180°C.",
        "Saisir le rôti dans une cocotte avec un peu d'huile pour le colorer sur toutes les faces.",
        "Ajouter les pommes de terre coupées en morceaux et les gousses d'ail autour du rôti.",
        "Enfourner pour 45 à 60 minutes selon la taille du rôti. Arroser régulièrement avec le jus de cuisson.",
        "Laisser reposer 10 minutes avant de trancher et de servir."
      ];
    }
    prepTime = 10;
    cookTime = 60;
  }

  if (title.includes("Soupe") || title.includes("Velouté")) {
    if (lang === Language.FR) {
      instructions = [
        "Laver et couper les légumes en gros morceaux.",
        "Mettre les légumes dans une grande casserole et couvrir d'eau (ou de bouillon).",
        "Porter à ébullition et laisser cuire 20 à 25 minutes à feu moyen.",
        "Mixer le tout à l'aide d'un mixeur plongeant jusqu'à obtenir une texture lisse.",
        "Ajouter un peu de crème ou de lait de coco, assaisonner et servir avec des croûtons."
      ];
    }
    prepTime = 10;
    cookTime = 25;
  }

  if (title.includes("Fajitas")) {
    if (lang === Language.FR) {
      instructions = [
        "Couper le poulet (ou les légumes) en lanières et les poivrons en lamelles.",
        "Faire sauter le tout dans une poêle avec un peu d'huile et les épices fajitas pendant 10 minutes.",
        "Réchauffer les tortillas quelques secondes au micro-ondes ou à la poêle.",
        "Garnir les tortillas avec le mélange chaud, ajouter un peu de crème ou de guacamole.",
        "Rouler et déguster immédiatement."
      ];
    }
    prepTime = 15;
    cookTime = 10;
  }

  if (title.includes("Lasagnes")) {
    if (lang === Language.FR) {
      instructions = [
        "Préchauffer le four à 180°C.",
        "Préparer la garniture (épinards/chèvre ou lentilles/tomate) dans une casserole.",
        "Dans un plat à gratin, alterner les couches : sauce, feuilles de lasagne, béchamel.",
        "Terminer par une couche de béchamel et de fromage râpé.",
        "Enfourner pour 30 à 35 minutes jusqu'à ce que le dessus soit bien doré."
      ];
    }
    prepTime = 20;
    cookTime = 35;
  }

  if (title.includes("Tian")) {
    if (lang === Language.FR) {
      instructions = [
        "Préchauffer le four à 180°C. Laver les légumes.",
        "Couper les courgettes, aubergines et tomates en fines rondelles régulières.",
        "Dans un plat à gratin huilé, disposer les rondelles de légumes verticalement, en alternant les couleurs (comme un accordéon).",
        "Arroser généreusement d'huile d'olive, ajouter l'ail haché, saler, poivrer et saupoudrer d'herbes de Provence.",
        "Enfourner pour 45 minutes environ, jusqu'à ce que les légumes soient confits. Servir avec l'accompagnement (riz ou quinoa)."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Ofen auf 180°C vorheizen. Gemüse waschen.",
        "Zucchini, Auberginen und Tomaten in feine, gleichmäßige Scheiben schneiden.",
        "In einer geölten Auflaufform die Gemüsescheiben vertikal anordnen, dabei die Farben abwechseln (wie ein Akkordeon).",
        "Großzügig mit Olivenöl beträufeln, gehackten Knoblauch hinzufügen, salzen, pfeffern und mit Kräutern der Provence bestreuen.",
        "Etwa 45 Minuten backen, bis das Gemüse weich ist. Mit Beilage (Reis oder Quinoa) servieren."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Preriscaldare il forno a 180°C. Lavare le verdure.",
        "Tagliare zucchine, melanzane e pomodori a fette sottili e regolari.",
        "In una pirofila oliata, disporre le fette di verdura verticalmente, alternando i colori (come una fisarmonica).",
        "Irrorare generosamente con olio d'oliva, aggiungere l'aglio tritato, sale, pepe e spolverare con erbe di Provenza.",
        "Infornare per circa 45 minuti, finché le verdure non saranno candite. Servire con il contorno (riso o quinoa)."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Precalentar el horno a 180°C. Lavar las verduras.",
        "Cortar los calabacines, berenjenas y tomates en rodajas finas y regulares.",
        "En una fuente para gratinar aceitada, disponer las rodajas de verdura verticalmente, alternando los colores (como un acordeón).",
        "Rociar generosamente con aceite de oliva, añadir el ajo picado, sal, pimienta y espolvorear con hierbas de Provenza.",
        "Hornear durante unos 45 minutos hasta que las verduras estén confitadas. Servir con el acompañamiento (arroz o quinoa)."
      ];
    } else {
      instructions = [
        "Preheat the oven to 180°C. Wash the vegetables.",
        "Cut the zucchini, eggplant, and tomatoes into thin, even slices.",
        "In an oiled gratin dish, arrange the vegetable slices vertically, alternating colors (like an accordion).",
        "Drizzle generously with olive oil, add minced garlic, salt, pepper, and sprinkle with herbs de Provence.",
        "Bake for about 45 minutes until the vegetables are candied. Serve with the side dish (rice or quinoa)."
      ];
    }
    prepTime = 20;
    cookTime = 45;
    cals = 350;
  }

  if (title.includes("Steak Frites")) {
    if (lang === Language.FR) {
      instructions = [
        "Cuire les frites (four ou friteuse) jusqu'à ce qu'elles soient dorées.",
        "Assaisonner le steak de sel et poivre.",
        "Poêler le steak avec une noisette de beurre selon la cuisson désirée (saignant: 2min/face).",
        "Servir immédiatement avec la salade verte."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Pommes (Ofen oder Fritteuse) goldbraun garen.",
        "Steak mit Salz und Pfeffer würzen.",
        "Steak mit einem Stück Butter nach gewünschter Garstufe braten (medium: 2 Min./Seite).",
        "Sofort mit grünem Salat servieren."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Cuocere le patatine (forno o friggitrice) fino a doratura.",
        "Condire la bistecca con sale e pepe.",
        "Cuocere la bistecca in padella con una noce di burro secondo la cottura desiderata (al sangue: 2 min/lato).",
        "Servire immediatamente con l'insalata verde."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Cocinar las patatas fritas (horno o freidora) hasta que estén doradas.",
        "Sazonar el bistec con sal y pimienta.",
        "Freír el bistec en una sartén con una nuez de mantequilla según el punto de cocción deseado (poco hecho: 2 min/lado).",
        "Servir inmediatamente con la ensalada verde."
      ];
    } else {
      instructions = [
        "Cook the fries (oven or fryer) until golden brown.",
        "Season the steak with salt and pepper.",
        "Pan-fry the steak with a knob of butter according to desired doneness (rare: 2min/side).",
        "Serve immediately with the green salad."
      ];
    }
  }

  if (title.includes("Pâtes Bolo")) {
    if (lang === Language.FR) {
      instructions = [
        "Faire revenir la viande (ou protéines soja) avec un oignon émincé.",
        "Ajouter la sauce tomate et laisser mijoter 15 minutes.",
        "Cuire les pâtes al dente dans l'eau bouillante salée.",
        "Mélanger les pâtes et la sauce, servir avec du fromage râpé."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Fleisch (oder Sojaprotein) mit einer gehackten Zwiebel anbraten.",
        "Tomatensauce hinzufügen und 15 Minuten köcheln lassen.",
        "Nudeln in kochendem Salzwasser al dente garen.",
        "Nudeln und Sauce mischen, mit geriebenem Käse servieren."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Soffriggere la carne (o proteine di soia) con una cipolla tritata.",
        "Aggiungere la salsa di pomodoro e lasciare sobbollire per 15 minuti.",
        "Cuocere la pasta al dente in acqua bollente salata.",
        "Mescolare la pasta e il sugo, servire con formaggio grattugiato."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Sofreír la carne (o proteínas de soja) con una cebolla picada.",
        "Añadir la salsa de tomate y dejar cocer a fuego lento durante 15 minutos.",
        "Cocer la pasta al dente en agua hirviendo con sal.",
        "Mezclar la pasta y la salsa, servir con queso rallado."
      ];
    } else {
      instructions = [
        "Brown the meat (or soy protein) with a chopped onion.",
        "Add the tomato sauce and simmer for 15 minutes.",
        "Cook the pasta al dente in boiling salted water.",
        "Mix the pasta and sauce, serve with grated cheese."
      ];
    }
  }

  if (title.includes("Pizza")) {
    if (lang === Language.FR) {
      instructions = [
        "Préchauffer le four à 220°C.",
        "Dérouler la pâte à pizza sur une plaque.",
        "Étaler la sauce tomate et disposer les ingrédients (jambon, champignons, fromage...).",
        "Cuire 10 à 12 minutes jusqu'à ce que le fromage soit fondu et la pâte dorée."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Ofen auf 220°C vorheizen.",
        "Pizzateig auf einem Backblech ausrollen.",
        "Tomatensauce verteilen und Zutaten (Schinken, Pilze, Käse...) darauflegen.",
        "10 bis 12 Minuten backen, bis der Käse geschmolzen und der Teig goldbraun ist."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Preriscaldare il forno a 220°C.",
        "Stendere la pasta della pizza su una teglia.",
        "Spalmare la salsa di pomodoro e disporre gli ingredienti (prosciutto, funghi, formaggio...).",
        "Cuocere per 10-12 minuti finché il formaggio non si scioglie e la pasta è dorata."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Precalentar el horno a 220°C.",
        "Desenrollar la masa de pizza en una bandeja de horno.",
        "Extender la salsa de tomate y colocar los ingredientes (jamón, champiñones, queso...).",
        "Hornear de 10 a 12 minutos hasta que el queso se derrita y la masa esté dorada."
      ];
    } else {
      instructions = [
        "Preheat the oven to 220°C.",
        "Unroll the pizza dough on a baking sheet.",
        "Spread the tomato sauce and arrange the ingredients (ham, mushrooms, cheese...).",
        "Bake for 10 to 12 minutes until the cheese is melted and the dough is golden."
      ];
    }
  }

  if (title.includes("Salade")) {
    if (lang === Language.FR) {
      instructions = [
        "Laver et essorer la salade et les légumes.",
        "Couper les ingrédients (tomates, concombres, protéines) en morceaux.",
        "Préparer une vinaigrette (huile, vinaigre, moutarde).",
        "Mélanger le tout juste avant de servir pour garder la fraîcheur."
      ];
    } else if (lang === Language.DE) {
      instructions = [
        "Salat und Gemüse waschen und trocknen.",
        "Zutaten (Tomaten, Gurken, Proteine) in Stücke schneiden.",
        "Vinaigrette (Öl, Essig, Senf) zubereiten.",
        "Alles kurz vor dem Servieren mischen, um die Frische zu bewahren."
      ];
    } else if (lang === Language.IT) {
      instructions = [
        "Lavare e asciugare l'insalata e le verdure.",
        "Tagliare gli ingredienti (pomodori, cetrioli, proteine) a pezzi.",
        "Preparare una vinaigrette (olio, aceto, senape).",
        "Mescolare il tutto appena prima di servire per mantenere la freschezza."
      ];
    } else if (lang === Language.ES) {
      instructions = [
        "Lavar y secar la ensalada y las verduras.",
        "Cortar los ingredientes (tomates, pepinos, proteínas) en trozos.",
        "Preparar una vinagreta (aceite, vinagre, mostaza).",
        "Mezclar todo justo antes de servir para mantener la frescura."
      ];
    } else {
      instructions = [
        "Wash and dry the salad and vegetables.",
        "Cut the ingredients (tomatoes, cucumbers, proteins) into pieces.",
        "Prepare a vinaigrette (oil, vinegar, mustard).",
        "Mix everything just before serving to keep it fresh."
      ];
    }
    cookTime = 0;
  }

  return {
    title: translatedTitle, description: translatedDesc,
    ingredients: ings.map(x => ({ item: tStr(x.i, lang, INGREDIENT_DICTIONARY), quantity: x.q, category: t.categories[x.c] || x.c })),
    instructions: instructions,
    prepTimeMinutes: prepTime, cookTimeMinutes: cookTime, calories: cals,
    carbsCal, fatCal, proteinCal,
    priceComparison: createPrice(price),
    isPremiumVideoAvailable: false,
    protein: "20g", starch: "60g", vegetable: "80g",
    imageUrl: img
  };
};

// Générateur spécial Petit-Déj < 10 min (Maman pressée)
// Force une image "dressée" (bol, assiette) en haute résolution (1920x1080)
const mkBf = (title: string, desc: string, price: number, ings: {i:string,q:string,c:string}[], lang: Language = Language.FR): Recipe => {
  const translatedTitle = tStr(title, lang, RECIPE_DICTIONARY);
  const translatedDesc = tStr(desc, lang, RECIPE_DICTIONARY);
  let instructions = ["Griller le pain ou disposer les tranches.", "Laver et couper les fruits en quartiers.", "Servir avec le verre de jus."];
  if (lang === Language.DE) {
    instructions = ["Brot rösten oder Scheiben anrichten.", "Früchte waschen und in Spalten schneiden.", "Mit einem Glas Saft servieren."];
  } else if (lang === Language.IT) {
    instructions = ["Tostare il pane o disporre le fette.", "Lavare e tagliare la frutta a spicchi.", "Servire con un bicchiere di succo."];
  } else if (lang === Language.EN) {
    instructions = ["Toast the bread or arrange the slices.", "Wash and cut the fruit into wedges.", "Serve with a glass of juice."];
  } else if (lang === Language.ES) {
    instructions = ["Tostar el pan o disponer las rebanadas.", "Lavar y cortar la fruta en gajos.", "Servir con un vaso de zumo."];
  }

  const t = SERVICE_TRANSLATIONS[lang];
  const cals = 350;
  const carbsCal = Math.round(cals * 0.4);
  const fatCal = Math.round(cals * 0.3);
  const proteinCal = cals - carbsCal - fatCal;

  return {
    title: translatedTitle, description: translatedDesc,
    ingredients: ings.map(x => ({ item: tStr(x.i, lang, INGREDIENT_DICTIONARY), quantity: x.q, category: t.categories[x.c] || x.c })),
    instructions: instructions,
    prepTimeMinutes: 5, cookTimeMinutes: 0, calories: cals,
    carbsCal, fatCal, proteinCal,
    priceComparison: createPrice(price),
    isPremiumVideoAvailable: false,
    protein: "10g", starch: "40g", vegetable: "10g",
    imageUrl: `https://tse2.mm.bing.net/th?q=${encodeURIComponent(title + " " + desc + " food photography high resolution")}&w=1920&h=1080&c=7&rs=1&p=0&dpr=2&pid=1.7&mkt=fr-CH&adlt=moderate`
  };
};

// --- DEFINITION DES PETITS DÉJEUNERS (ROTATION SEMAINE) ---
// LOGIQUE : PAIN + FRUIT + JUS (+ OEUF PARFOIS)

// --- STYLE 1 : CLASSIQUE / FAMILLE ---
const BF_V1_OPTS = [
  // Lundi
  { 
    std: mkBf("Tartines Beurre & Confiture", "Pomme & Jus d'Orange", 3.0, [{i:"Pain complet",q:"4tr",c:"Boulangerie"},{i:"Beurre",q:"20g",c:"Crèmerie"},{i:"Confiture",q:"30g",c:"Epicerie"},{i:"Pomme",q:"2",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Tartines Beurre & Confiture", "Pomme & Jus d'Orange", 3.0, [{i:"Pain complet",q:"4tr",c:"Boulangerie"},{i:"Beurre",q:"20g",c:"Crèmerie"},{i:"Confiture",q:"30g",c:"Epicerie"},{i:"Pomme",q:"2",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Tartines Margarine", "Pomme & Jus d'Orange", 3.0, [{i:"Pain complet",q:"4tr",c:"Boulangerie"},{i:"Margarine",q:"20g",c:"Epicerie"},{i:"Confiture",q:"30g",c:"Epicerie"},{i:"Pomme",q:"2",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}])
  },
  // Mardi
  {
    std: mkBf("Tartines Chocolat", "Banane & Jus de Pomme", 3.5, [{i:"Pain de mie",q:"4tr",c:"Boulangerie"},{i:"Pâte à tartiner",q:"30g",c:"Epicerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Tartines Chocolat", "Banane & Jus de Pomme", 3.5, [{i:"Pain de mie",q:"4tr",c:"Boulangerie"},{i:"Pâte à tartiner",q:"30g",c:"Epicerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Tartines Choco Noir", "Banane & Jus de Pomme", 3.8, [{i:"Pain de mie",q:"4tr",c:"Boulangerie"},{i:"Chocolat noir fondu",q:"30g",c:"Epicerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}])
  },
  // Mercredi (Jour des enfants - Oeuf)
  {
    std: mkBf("Oeuf Coque & Mouillettes", "Raisin & Jus Vitaminé", 4.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Beurre",q:"10g",c:"Crèmerie"},{i:"Raisin",q:"100g",c:"Fruits"},{i:"Jus multivitaminé",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Oeuf Coque & Mouillettes", "Raisin & Jus Vitaminé", 4.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Beurre",q:"10g",c:"Crèmerie"},{i:"Raisin",q:"100g",c:"Fruits"},{i:"Jus multivitaminé",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Toast Avocat Rapide", "Raisin & Jus Vitaminé", 4.5, [{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Raisin",q:"100g",c:"Fruits"},{i:"Jus multivitaminé",q:"50cl",c:"Boissons"}])
  },
  // Jeudi
  {
    std: mkBf("Tartines Fromage Frais", "Poire & Jus de Raisin", 3.5, [{i:"Pain campagne",q:"4tr",c:"Boulangerie"},{i:"Fromage frais",q:"40g",c:"Crèmerie"},{i:"Poire",q:"2",c:"Fruits"},{i:"Jus de raisin",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Tartines Fromage Frais", "Poire & Jus de Raisin", 3.5, [{i:"Pain campagne",q:"4tr",c:"Boulangerie"},{i:"Fromage frais",q:"40g",c:"Crèmerie"},{i:"Poire",q:"2",c:"Fruits"},{i:"Jus de raisin",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Tartines Beurre Amande", "Poire & Jus de Raisin", 4.0, [{i:"Pain campagne",q:"4tr",c:"Boulangerie"},{i:"Beurre amande",q:"30g",c:"Epicerie"},{i:"Poire",q:"2",c:"Fruits"},{i:"Jus de raisin",q:"50cl",c:"Boissons"}])
  },
  // Vendredi
  {
    std: mkBf("Pain Grillé & Miel", "Clémentines & Jus Orange", 3.0, [{i:"Pain grillé",q:"4tr",c:"Epicerie"},{i:"Miel",q:"30g",c:"Epicerie"},{i:"Clémentines",q:"4",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Pain Grillé & Miel", "Clémentines & Jus Orange", 3.0, [{i:"Pain grillé",q:"4tr",c:"Epicerie"},{i:"Miel",q:"30g",c:"Epicerie"},{i:"Clémentines",q:"4",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pain Grillé & Sirop Érable", "Clémentines & Jus Orange", 3.5, [{i:"Pain grillé",q:"4tr",c:"Epicerie"},{i:"Sirop d'érable",q:"30g",c:"Epicerie"},{i:"Clémentines",q:"4",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}])
  },
  // Samedi (Oeuf)
  {
    std: mkBf("Oeuf Brouillé Minute", "Toast & Kiwi & Jus", 4.5, [{i:"Oeuf",q:"3",c:"Crèmerie"},{i:"Pain de mie",q:"2tr",c:"Boulangerie"},{i:"Kiwi",q:"2",c:"Fruits"},{i:"Jus d'ananas",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Oeuf Brouillé Minute", "Toast & Kiwi & Jus", 4.5, [{i:"Oeuf",q:"3",c:"Crèmerie"},{i:"Pain de mie",q:"2tr",c:"Boulangerie"},{i:"Kiwi",q:"2",c:"Fruits"},{i:"Jus d'ananas",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Tofu Brouillé Minute", "Toast & Kiwi & Jus", 4.5, [{i:"Tofu soyeux",q:"150g",c:"Frais"},{i:"Pain de mie",q:"2tr",c:"Boulangerie"},{i:"Kiwi",q:"2",c:"Fruits"},{i:"Jus d'ananas",q:"50cl",c:"Boissons"}])
  },
  // Dimanche (Gourmand)
  {
    std: mkBf("Brioche & Chocolat Chaud", "Salade Fruits & Jus", 5.0, [{i:"Brioche",q:"4tr",c:"Boulangerie"},{i:"Lait",q:"200ml",c:"Crèmerie"},{i:"Cacao",q:"2cs",c:"Epicerie"},{i:"Salade de fruits",q:"200g",c:"Frais"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Brioche & Chocolat Chaud", "Salade Fruits & Jus", 5.0, [{i:"Brioche",q:"4tr",c:"Boulangerie"},{i:"Lait",q:"200ml",c:"Crèmerie"},{i:"Cacao",q:"2cs",c:"Epicerie"},{i:"Salade de fruits",q:"200g",c:"Frais"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pain Perdu Vegan", "Salade Fruits & Jus", 5.0, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Lait amande",q:"100ml",c:"Epicerie"},{i:"Salade de fruits",q:"200g",c:"Frais"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}])
  }
];

// --- STYLE 2 : ÉTÉ / MÉDITERRANÉE ---
const BF_V2_OPTS = [
  // Lundi
  {
    std: mkBf("Pain Huile d'Olive", "Tomate & Jus", 3.5, [{i:"Pain Ciabatta",q:"4tr",c:"Boulangerie"},{i:"Huile d'olive",q:"2cs",c:"Epicerie"},{i:"Tomate",q:"2",c:"Légumes"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Pain Huile d'Olive", "Tomate & Jus", 3.5, [{i:"Pain Ciabatta",q:"4tr",c:"Boulangerie"},{i:"Huile d'olive",q:"2cs",c:"Epicerie"},{i:"Tomate",q:"2",c:"Légumes"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pain Huile d'Olive", "Tomate & Jus", 3.5, [{i:"Pain Ciabatta",q:"4tr",c:"Boulangerie"},{i:"Huile d'olive",q:"2cs",c:"Epicerie"},{i:"Tomate",q:"2",c:"Légumes"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}])
  },
  // Mardi
  {
    std: mkBf("Pain Grillé & Ricotta", "Pêche & Jus", 4.0, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Ricotta",q:"50g",c:"Crèmerie"},{i:"Pêche",q:"2",c:"Fruits"},{i:"Jus d'abricot",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Pain Grillé & Ricotta", "Pêche & Jus", 4.0, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Ricotta",q:"50g",c:"Crèmerie"},{i:"Pêche",q:"2",c:"Fruits"},{i:"Jus d'abricot",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pain Grillé & Hummus", "Concombre & Jus", 4.0, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Hummus",q:"50g",c:"Frais"},{i:"Concombre",q:"1/2",c:"Légumes"},{i:"Jus de légumes",q:"50cl",c:"Boissons"}])
  },
  // Mercredi (Oeuf)
  {
    std: mkBf("Oeuf Dur & Pain", "Melon & Jus", 4.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Melon",q:"1/4",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Oeuf Dur & Pain", "Melon & Jus", 4.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Melon",q:"1/4",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Toast Tapenade", "Melon & Jus", 4.0, [{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Tapenade",q:"30g",c:"Epicerie"},{i:"Melon",q:"1/4",c:"Fruits"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}])
  },
  // Jeudi
  {
    std: mkBf("Tartines Miel", "Figues & Jus", 4.5, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Miel",q:"2cs",c:"Epicerie"},{i:"Figues fraîches",q:"4",c:"Fruits"},{i:"Jus de raisin",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Tartines Miel", "Figues & Jus", 4.5, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Miel",q:"2cs",c:"Epicerie"},{i:"Figues fraîches",q:"4",c:"Fruits"},{i:"Jus de raisin",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Tartines Sirop Agave", "Figues & Jus", 4.5, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Sirop d'agave",q:"2cs",c:"Epicerie"},{i:"Figues fraîches",q:"4",c:"Fruits"},{i:"Jus de raisin",q:"50cl",c:"Boissons"}])
  },
  // Vendredi
  {
    std: mkBf("Baguette & Jambon", "Abricots & Jus", 5.0, [{i:"Baguette",q:"1/2",c:"Boulangerie"},{i:"Jambon cru",q:"2tr",c:"Viande"},{i:"Abricots",q:"4",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Baguette & Fromage", "Abricots & Jus", 4.5, [{i:"Baguette",q:"1/2",c:"Boulangerie"},{i:"Fromage",q:"40g",c:"Crèmerie"},{i:"Abricots",q:"4",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Baguette & Tomates S.", "Abricots & Jus", 4.5, [{i:"Baguette",q:"1/2",c:"Boulangerie"},{i:"Tomates séchées",q:"4",c:"Epicerie"},{i:"Abricots",q:"4",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}])
  },
  // Samedi (Oeuf)
  {
    std: mkBf("Tortilla Rapide (Oeuf)", "Pain & Orange & Jus", 4.0, [{i:"Oeuf",q:"3",c:"Crèmerie"},{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Orange",q:"1",c:"Fruits"},{i:"Jus de pamplemousse",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Tortilla Rapide (Oeuf)", "Pain & Orange & Jus", 4.0, [{i:"Oeuf",q:"3",c:"Crèmerie"},{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Orange",q:"1",c:"Fruits"},{i:"Jus de pamplemousse",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Toast Avocat Citron", "Orange & Jus", 4.5, [{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Orange",q:"1",c:"Fruits"},{i:"Jus de pamplemousse",q:"50cl",c:"Boissons"}])
  },
  // Dimanche
  {
    std: mkBf("Fougasse Sucrée", "Fruits Rouges & Jus", 5.0, [{i:"Fougasse",q:"1",c:"Boulangerie"},{i:"Fruits rouges",q:"100g",c:"Frais"},{i:"Jus de framboise",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Fougasse Sucrée", "Fruits Rouges & Jus", 5.0, [{i:"Fougasse",q:"1",c:"Boulangerie"},{i:"Fruits rouges",q:"100g",c:"Frais"},{i:"Jus de framboise",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pain aux Raisins Vegan", "Fruits & Jus", 5.0, [{i:"Pain raisins",q:"2",c:"Boulangerie"},{i:"Fruits rouges",q:"100g",c:"Frais"},{i:"Jus de framboise",q:"50cl",c:"Boissons"}])
  }
];

// --- STYLE 3 : MODERNE / FUSION ---
const BF_V3_OPTS = [
  // Lundi
  {
    std: mkBf("Toast Beurre Cacahuète", "Banane & Jus Vert", 4.5, [{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Beurre cacahuète",q:"30g",c:"Epicerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Jus vert",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Toast Beurre Cacahuète", "Banane & Jus Vert", 4.5, [{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Beurre cacahuète",q:"30g",c:"Epicerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Jus vert",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Toast Beurre Cacahuète", "Banane & Jus Vert", 4.5, [{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Beurre cacahuète",q:"30g",c:"Epicerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Jus vert",q:"50cl",c:"Boissons"}])
  },
  // Mardi
  {
    std: mkBf("Avocado Toast Simple", "Pomme & Jus", 5.0, [{i:"Pain graines",q:"2tr",c:"Boulangerie"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Pomme",q:"1",c:"Fruits"},{i:"Jus de carotte",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Avocado Toast Simple", "Pomme & Jus", 5.0, [{i:"Pain graines",q:"2tr",c:"Boulangerie"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Pomme",q:"1",c:"Fruits"},{i:"Jus de carotte",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Avocado Toast Simple", "Pomme & Jus", 5.0, [{i:"Pain graines",q:"2tr",c:"Boulangerie"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Pomme",q:"1",c:"Fruits"},{i:"Jus de carotte",q:"50cl",c:"Boissons"}])
  },
  // Mercredi (Oeuf)
  {
    std: mkBf("Oeuf Poché sur Toast", "Myrtilles & Jus", 5.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Myrtilles",q:"100g",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Oeuf Poché sur Toast", "Myrtilles & Jus", 5.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Myrtilles",q:"100g",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Toast Tahini & Miel", "Myrtilles & Jus", 4.5, [{i:"Pain complet",q:"2tr",c:"Boulangerie"},{i:"Tahini",q:"2cs",c:"Epicerie"},{i:"Sirop d'érable",q:"1cs",c:"Epicerie"},{i:"Myrtilles",q:"100g",c:"Fruits"},{i:"Jus de pomme",q:"50cl",c:"Boissons"}])
  },
  // Jeudi
  {
    std: mkBf("Pain Banane Écrasée", "Amandes & Jus", 4.0, [{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Amandes",q:"20g",c:"Epicerie"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Pain Banane Écrasée", "Amandes & Jus", 4.0, [{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Amandes",q:"20g",c:"Epicerie"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pain Banane Écrasée", "Amandes & Jus", 4.0, [{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Banane",q:"2",c:"Fruits"},{i:"Amandes",q:"20g",c:"Epicerie"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
  },
  // Vendredi
  {
    std: mkBf("Bagel Cream Cheese", "Poire & Jus", 4.5, [{i:"Bagel",q:"2",c:"Boulangerie"},{i:"Cream cheese",q:"40g",c:"Crèmerie"},{i:"Poire",q:"2",c:"Fruits"},{i:"Jus de poire",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Bagel Cream Cheese", "Poire & Jus", 4.5, [{i:"Bagel",q:"2",c:"Boulangerie"},{i:"Cream cheese",q:"40g",c:"Crèmerie"},{i:"Poire",q:"2",c:"Fruits"},{i:"Jus de poire",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Bagel & Faux-Mage", "Poire & Jus", 4.5, [{i:"Bagel",q:"2",c:"Boulangerie"},{i:"Fromage frais vegan",q:"40g",c:"Frais"},{i:"Poire",q:"2",c:"Fruits"},{i:"Jus de poire",q:"50cl",c:"Boissons"}])
  },
  // Samedi (Oeuf)
  {
    std: mkBf("Oeuf Mollet & Pain", "Mangue & Jus", 5.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Mangue",q:"1",c:"Fruits"},{i:"Jus exotique",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Oeuf Mollet & Pain", "Mangue & Jus", 5.0, [{i:"Oeuf",q:"2",c:"Crèmerie"},{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Mangue",q:"1",c:"Fruits"},{i:"Jus exotique",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Toast Coco & Fruit", "Mangue & Jus", 4.5, [{i:"Pain",q:"2tr",c:"Boulangerie"},{i:"Yaourt coco",q:"50g",c:"Frais"},{i:"Mangue",q:"1",c:"Fruits"},{i:"Jus exotique",q:"50cl",c:"Boissons"}])
  },
  // Dimanche
  {
    std: mkBf("Pancakes Express (Sachet)", "Sirop & Jus", 5.0, [{i:"Mix Pancakes",q:"1sachet",c:"Epicerie"},{i:"Lait",q:"10cl",c:"Crèmerie"},{i:"Sirop d'érable",q:"2cs",c:"Epicerie"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    veg: mkBf("Pancakes Express (Sachet)", "Sirop & Jus", 5.0, [{i:"Mix Pancakes",q:"1sachet",c:"Epicerie"},{i:"Lait",q:"10cl",c:"Crèmerie"},{i:"Sirop d'érable",q:"2cs",c:"Epicerie"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}]),
    vgn: mkBf("Pancakes Express Vegan", "Sirop & Jus", 5.0, [{i:"Mix Pancakes Vegan",q:"1sachet",c:"Epicerie"},{i:"Lait soja",q:"10cl",c:"Epicerie"},{i:"Sirop d'érable",q:"2cs",c:"Epicerie"},{i:"Jus d'orange",q:"50cl",c:"Boissons"}])
  }
];


// --- GENERATION DES JOURS ---

const makeDay = (title: string, p: any, bfs: any) => ({
  day: title,
  breakfast: { standard: bfs.std, vegetarian: bfs.veg, vegan: bfs.vgn, world: bfs.std },
  // Restauration du Lomo Saltado pour le midi (World)
  lunch: { standard: p.std.l, vegetarian: p.veg.l, vegan: p.vgn.l, world: makeRecipe("Lomo Saltado", "Sauté de Boeuf Péruvien", 14, [{i:"Boeuf",q:"300g",c:"Viande"},{i:"Oignon rouge",q:"1",c:"Légumes"},{i:"Tomate",q:"2",c:"Légumes"},{i:"Frites épaisses",q:"300g",c:"Surgelés"},{i:"Sauce soja",q:"5cl",c:"Epicerie"}]) },
  dinner: { 
    standard: p.std.d, 
    vegetarian: p.veg.d, 
    vegan: p.vgn.d, 
    // Panadero conservé pour le soir (World)
    world: makeRecipe("Panadero", "Champignons, Jaune Croustillant & Cabrales", 18.0, [
      {i:"Gros Champignons",q:"8",c:"Légumes"},
      {i:"Jaunes d'oeufs",q:"4",c:"Crèmerie"},
      {i:"Chapelure",q:"100g",c:"Epicerie"},
      {i:"Fromage Cabrales",q:"150g",c:"Crèmerie"},
      {i:"Huile d'olive",q:"5cl",c:"Epicerie"}
    ]) 
  }
});

// --- PROPOSITION 1 : CLASSIQUE / FAMILLE (Complet) ---
const PLAN_V1 = [
  makeDay("Lundi", {
    std: { l: makeRecipe("Poulet Rôti", "Haricots", 8.2, [{i:"Cuisse poulet",q:"2",c:"Viande"},{i:"Haricots",q:"300g",c:"Légumes"},{i:"Huile d'olive",q:"2cs",c:"Epicerie"},{i:"Herbes Provence",q:"1cs",c:"Epicerie"}]), d: makeRecipe("Pâtes Carbonara", "Lardons", 7.8, [{i:"Pâtes",q:"250g",c:"Epicerie"},{i:"Lardons",q:"100g",c:"Viande"},{i:"Oeufs",q:"2",c:"Crèmerie"},{i:"Parmesan",q:"50g",c:"Crèmerie"}]) },
    veg: { l: makeRecipe("Curry Légumes", "Riz", 6.5, [{i:"Légumes",q:"400g",c:"Légumes"},{i:"Lait coco",q:"200ml",c:"Epicerie"},{i:"Curry",q:"1cs",c:"Epicerie"},{i:"Riz",q:"150g",c:"Epicerie"}]), d: makeRecipe("Pâtes Champignons", "Crème", 6.0, [{i:"Pâtes",q:"250g",c:"Epicerie"},{i:"Champignons",q:"200g",c:"Légumes"},{i:"Crème",q:"200ml",c:"Crèmerie"},{i:"Ail",q:"1",c:"Légumes"},{i:"Persil",q:"1b",c:"Frais"}]) },
    vgn: { l: makeRecipe("Dahl Lentilles", "Corail", 5.0, [{i:"Lentilles",q:"200g",c:"Epicerie"},{i:"Tomates",q:"300g",c:"Légumes"},{i:"Lait coco",q:"100ml",c:"Epicerie"}]), d: makeRecipe("Wok Tofu", "Brocolis", 7.0, [{i:"Tofu",q:"200g",c:"Frais"},{i:"Brocolis",q:"300g",c:"Légumes"},{i:"Sauce soja",q:"5cl",c:"Epicerie"}]) }
  }, BF_V1_OPTS[0]),
  makeDay("Mardi", {
    std: { l: makeRecipe("Pavé Saumon", "Riz", 14.5, [{i:"Saumon",q:"2",c:"Poisson"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Citron",q:"1",c:"Fruits"}]), d: makeRecipe("Hachis Parmentier", "Boeuf", 8.5, [{i:"Boeuf haché",q:"300g",c:"Viande"},{i:"Pommes terre",q:"500g",c:"Légumes"},{i:"Lait",q:"10cl",c:"Crèmerie"},{i:"Beurre",q:"30g",c:"Crèmerie"}]), },
    veg: { l: makeRecipe("Omelette Feta", "Epinards", 7.0, [{i:"Oeufs",q:"4",c:"Crèmerie"},{i:"Feta",q:"100g",c:"Crèmerie"},{i:"Persil",q:"1b",c:"Frais"}]), d: makeRecipe("Chili Végé", "Haricots", 6.0, [{i:"Haricots r.",q:"400g",c:"Conserve"},{i:"Maïs",q:"150g",c:"Conserve"},{i:"Coulis tomate",q:"200g",c:"Epicerie"},{i:"Épices chili",q:"1cs",c:"Epicerie"}]), },
    vgn: { l: makeRecipe("Steak Soja", "Quinoa", 7.5, [{i:"Steak soja",q:"2",c:"Frais"},{i:"Quinoa",q:"150g",c:"Epicerie"}]), d: makeRecipe("Chili Sin Carne", "Riz", 5.5, [{i:"Haricots r.",q:"400g",c:"Conserve"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Coulis tomate",q:"200g",c:"Epicerie"}]), }
  }, BF_V1_OPTS[1]),
  makeDay("Mercredi", { 
    std: {l:makeRecipe("Steak Frites","Salade",12,[{i:"Steak",q:"2",c:"Viande"},{i:"Frites",q:"300g",c:"Surgelés"},{i:"Salade",q:"1",c:"Légumes"}]), d:makeRecipe("Salade César","Poulet",9,[{i:"Poulet",q:"200g",c:"Viande"},{i:"Salade romaine",q:"1",c:"Légumes"},{i:"Croûtons",q:"50g",c:"Epicerie"},{i:"Parmesan",q:"30g",c:"Crèmerie"}])}, 
    veg: {l:makeRecipe("Burger Végé","Frites",9,[{i:"Steak végé",q:"2",c:"Frais"},{i:"Pain burger",q:"2",c:"Boulangerie"},{i:"Frites",q:"300g",c:"Surgelés"}]), d:makeRecipe("Salade Chèvre","Miel",8,[{i:"Salade",q:"1",c:"Légumes"},{i:"Chèvre chaud",q:"4",c:"Crèmerie"},{i:"Miel",q:"2cs",c:"Epicerie"}])}, 
    vgn: {l:makeRecipe("Burger Vegan","Salade",10,[{i:"Steak soja",q:"2",c:"Frais"},{i:"Pain burger",q:"2",c:"Boulangerie"},{i:"Salade",q:"1",c:"Légumes"}]), d:makeRecipe("Salade Quinoa","Avocat",8,[{i:"Quinoa",q:"150g",c:"Epicerie"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Tomates",q:"2",c:"Légumes"}])} 
  }, BF_V1_OPTS[2]),
  makeDay("Jeudi", { 
    std: {l:makeRecipe("Pâtes Bolo","Boeuf",8,[{i:"Pâtes",q:"250g",c:"Epicerie"},{i:"Boeuf haché",q:"200g",c:"Viande"},{i:"Sauce tomate",q:"300g",c:"Epicerie"},{i:"Oignon",q:"1",c:"Légumes"}]), d:makeRecipe("Croque Monsieur","Jambon",6,[{i:"Pain de mie",q:"4tr",c:"Boulangerie"},{i:"Jambon",q:"2tr",c:"Viande"},{i:"Fromage",q:"50g",c:"Crèmerie"}]), }, 
    veg: {l:makeRecipe("Pâtes Pesto","Mozza",7,[{i:"Pâtes",q:"250g",c:"Epicerie"},{i:"Pesto",q:"100g",c:"Epicerie"},{i:"Mozzarella",q:"1",c:"Crèmerie"}]), d:makeRecipe("Croque Végé","Tomate",6,[{i:"Pain de mie",q:"4tr",c:"Boulangerie"},{i:"Tomate",q:"1",c:"Légumes"},{i:"Fromage",q:"50g",c:"Crèmerie"}]), }, 
    vgn: {l:makeRecipe("Pâtes Bolo Soja","Protéines",7,[{i:"Pâtes",q:"250g",c:"Epicerie"},{i:"Protéines soja",q:"100g",c:"Epicerie"},{i:"Sauce tomate",q:"300g",c:"Epicerie"},{i:"Oignon",q:"1",c:"Légumes"}]), d:makeRecipe("Tartines Houmous","Légumes",6,[{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Houmous",q:"100g",c:"Frais"},{i:"Concombre",q:"1",c:"Légumes"}]), } 
  }, BF_V1_OPTS[3]),
  makeDay("Vendredi", { 
    std: {l:makeRecipe("Filet Perche","Meunière",15,[{i:"Filets perche",q:"300g",c:"Poisson"},{i:"Beurre",q:"50g",c:"Crèmerie"},{i:"Citron",q:"1",c:"Fruits"}]), d:makeRecipe("Pizza Reine","Jambon",9,[{i:"Pâte pizza",q:"1",c:"Frais"},{i:"Jambon",q:"100g",c:"Viande"},{i:"Mozzarella",q:"1",c:"Crèmerie"},{i:"Champignons",q:"100g",c:"Légumes"}])}, 
    veg: {l:makeRecipe("Gratin Dauphinois","Salade",7,[{i:"Pommes terre",q:"600g",c:"Légumes"},{i:"Crème",q:"200ml",c:"Crèmerie"},{i:"Ail",q:"1",c:"Légumes"}]), d:makeRecipe("Pizza 4 Fromages","Miel",9,[{i:"Pâte pizza",q:"1",c:"Frais"},{i:"Mélange fromages",q:"150g",c:"Crèmerie"},{i:"Origan",q:"1cc",c:"Epicerie"}])}, 
    vgn: {l:makeRecipe("Gratin Légumes","Bechamel Soja",8,[{i:"Pommes terre",q:"400g",c:"Légumes"},{i:"Courgettes",q:"200g",c:"Légumes"},{i:"Crème soja",q:"200ml",c:"Epicerie"}]), d:makeRecipe("Pizza Végétale","Légumes",8,[{i:"Pâte pizza",q:"1",c:"Frais"},{i:"Légumes grillés",q:"200g",c:"Surgelés"},{i:"Coulis tomate",q:"100g",c:"Epicerie"}])} 
  }, BF_V1_OPTS[4]),
  makeDay("Samedi", { 
    std: {l:makeRecipe("Cordon Bleu","Petits pois",9,[{i:"Cordon bleu",q:"2",c:"Viande"},{i:"Petits pois",q:"200g",c:"Conserve"},{i:"Carottes",q:"200g",c:"Légumes"}]), d:makeRecipe("Fajitas Poulet","Poivrons",11,[{i:"Tortillas",q:"4",c:"Epicerie"},{i:"Poulet",q:"200g",c:"Viande"},{i:"Poivrons",q:"2",c:"Légumes"},{i:"Épices fajitas",q:"1s",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Nuggets Végé","Petits pois",8,[{i:"Nuggets soja",q:"200g",c:"Frais"},{i:"Petits pois",q:"200g",c:"Conserve"},{i:"Riz",q:"100g",c:"Epicerie"}]), d:makeRecipe("Fajitas Haricots","Guacamole",9,[{i:"Tortillas",q:"4",c:"Epicerie"},{i:"Haricots rouges",q:"200g",c:"Conserve"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Poivrons",q:"2",c:"Légumes"}])}, 
    vgn: {l:makeRecipe("Falafels","Pita",8,[{i:"Falafels",q:"6",c:"Frais"},{i:"Pita",q:"2",c:"Boulangerie"},{i:"Sauce tahini",q:"50g",c:"Epicerie"}]), d:makeRecipe("Burrito Vegan","Riz",9,[{i:"Tortillas",q:"2",c:"Epicerie"},{i:"Riz",q:"100g",c:"Epicerie"},{i:"Haricots noirs",q:"200g",c:"Conserve"},{i:"Maïs",q:"100g",c:"Conserve"}])} 
  }, BF_V1_OPTS[5]),
  makeDay("Dimanche", { 
    std: {l:makeRecipe("Rôti Porc","Pommes terre",12,[{i:"Rôti porc",q:"600g",c:"Viande"},{i:"Pommes terre",q:"500g",c:"Légumes"},{i:"Ail",q:"2",c:"Légumes"}]), d:makeRecipe("Soupe Légumes","Croûtons",5,[{i:"Légumes soupe",q:"500g",c:"Légumes"},{i:"Croûtons",q:"50g",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Lasagnes Végé","Chèvre",9,[{i:"Feuilles lasagne",q:"6",c:"Epicerie"},{i:"Epinards",q:"300g",c:"Légumes"},{i:"Chèvre",q:"100g",c:"Crèmerie"},{i:"Bechamel",q:"200ml",c:"Frais"}]), d:makeRecipe("Soupe","Pain",5,[{i:"Légumes soupe",q:"500g",c:"Légumes"},{i:"Pain",q:"100g",c:"Boulangerie"}])}, 
    vgn: {l:makeRecipe("Lasagnes Vegan","Lentilles",9,[{i:"Feuilles lasagne",q:"6",c:"Epicerie"},{i:"Lentilles",q:"200g",c:"Epicerie"},{i:"Sauce tomate",q:"300g",c:"Epicerie"},{i:"Crème soja",q:"200ml",c:"Epicerie"}]), d:makeRecipe("Velouté Courge","Coco",5,[{i:"Courge",q:"500g",c:"Légumes"},{i:"Lait coco",q:"200ml",c:"Epicerie"}])} 
  }, BF_V1_OPTS[6]),
];

// --- PROPOSITION 2 : ÉTÉ / MÉDITERRANÉE (Complet) ---

const PLAN_V2 = [
  // LUNDI
  makeDay("Lundi", {
    std: { l: makeRecipe("Salade Grecque", "Feta", 8, [{i:"Feta",q:"200g",c:"Crèmerie"},{i:"Olives",q:"50g",c:"Epicerie"},{i:"Tomates",q:"2",c:"Légumes"},{i:"Concombre",q:"1",c:"Légumes"},{i:"Huile d'olive",q:"5cl",c:"Epicerie"}]), d: makeRecipe("Carpaccio", "Boeuf", 12, [{i:"Carpaccio",q:"200g",c:"Viande"},{i:"Parmesan",q:"30g",c:"Crèmerie"},{i:"Huile d'olive",q:"2cs",c:"Epicerie"}]), },
    veg: { l: makeRecipe("Salade Grecque", "Feta", 8, [{i:"Feta",q:"200g",c:"Crèmerie"},{i:"Concombre",q:"1",c:"Légumes"},{i:"Tomates",q:"2",c:"Légumes"},{i:"Huile d'olive",q:"5cl",c:"Epicerie"}]), d: makeRecipe("Bruschetta", "Tomate", 7, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Tomate",q:"4",c:"Légumes"},{i:"Ail",q:"1",c:"Légumes"},{i:"Basilic",q:"1b",c:"Frais"}]), },
    vgn: { l: makeRecipe("Salade Grecque Vegan", "Tofu", 8, [{i:"Tofu lactofermenté",q:"200g",c:"Frais"},{i:"Olives",q:"50g",c:"Epicerie"},{i:"Tomates",q:"2",c:"Légumes"},{i:"Huile d'olive",q:"5cl",c:"Epicerie"}]), d: makeRecipe("Bruschetta", "Ail", 6, [{i:"Pain",q:"4tr",c:"Boulangerie"},{i:"Ail",q:"1",c:"Légumes"},{i:"Huile d'olive",q:"2cs",c:"Epicerie"}]), }
  }, BF_V2_OPTS[0]),

  // MARDI
  makeDay("Mardi", { 
    std: {l:makeRecipe("Tomates Farcies","Riz",9,[{i:"Tomates à farcir",q:"4",c:"Légumes"},{i:"Chair à saucisse",q:"300g",c:"Viande"},{i:"Riz",q:"150g",c:"Epicerie"}]), d:makeRecipe("Taboulé","Menthe",7,[{i:"Semoule",q:"200g",c:"Epicerie"},{i:"Tomates",q:"2",c:"Légumes"},{i:"Menthe",q:"1b",c:"Frais"},{i:"Citron",q:"1",c:"Fruits"}])}, 
    veg: {l:makeRecipe("Tomates Farcies Végé","Riz",8,[{i:"Tomates à farcir",q:"4",c:"Légumes"},{i:"Farce légumes",q:"300g",c:"Frais"},{i:"Riz",q:"150g",c:"Epicerie"}]), d:makeRecipe("Taboulé","Feta",7,[{i:"Semoule",q:"200g",c:"Epicerie"},{i:"Feta",q:"100g",c:"Crèmerie"},{i:"Menthe",q:"1b",c:"Frais"}])}, 
    vgn: {l:makeRecipe("Légumes Farcis","Riz",8,[{i:"Poivrons",q:"2",c:"Légumes"},{i:"Riz",q:"100g",c:"Epicerie"},{i:"Protéines soja",q:"50g",c:"Epicerie"}]), d:makeRecipe("Taboulé Libanais","Persil",7,[{i:"Boulgour",q:"100g",c:"Epicerie"},{i:"Persil plat",q:"2b",c:"Frais"},{i:"Tomates",q:"2",c:"Légumes"}])} 
  }, BF_V2_OPTS[1]),

  // MERCREDI
  makeDay("Mercredi", { 
    std: {l:makeRecipe("Grillade Porc","Poivrons",11,[{i:"Echine porc",q:"2",c:"Viande"},{i:"Poivrons",q:"2",c:"Légumes"},{i:"Herbes",q:"1cc",c:"Epicerie"}]), d:makeRecipe("Melon Jambon","Cru",9,[{i:"Melon",q:"1",c:"Fruits"},{i:"Jambon cru",q:"6tr",c:"Viande"}])}, 
    veg: {l:makeRecipe("Brochettes Halloumi","Poivrons",10,[{i:"Halloumi",q:"200g",c:"Crèmerie"},{i:"Poivrons",q:"2",c:"Légumes"},{i:"Courgettes",q:"1",c:"Légumes"}]), d:makeRecipe("Melon Feta","Menthe",8,[{i:"Melon",q:"1",c:"Fruits"},{i:"Feta",q:"100g",c:"Crèmerie"},{i:"Menthe",q:"1b",c:"Frais"}])}, 
    vgn: {l:makeRecipe("Brochettes Tofu","Poivrons",9,[{i:"Tofu fumé",q:"200g",c:"Frais"},{i:"Poivrons",q:"2",c:"Légumes"},{i:"Champignons",q:"100g",c:"Légumes"}]), d:makeRecipe("Salade Melon","Menthe",7,[{i:"Melon",q:"1",c:"Fruits"},{i:"Menthe",q:"1b",c:"Frais"},{i:"Concombre",q:"1",c:"Légumes"}])} 
  }, BF_V2_OPTS[2]),

  // JEUDI
  makeDay("Jeudi", { 
    std: {l:makeRecipe("Risotto Asperges","Parmesan",10,[{i:"Riz Arborio",q:"200g",c:"Epicerie"},{i:"Asperges",q:"1botte",c:"Légumes"},{i:"Parmesan",q:"50g",c:"Crèmerie"},{i:"Vin blanc",q:"10cl",c:"Boissons"},{i:"Bouillon",q:"1l",c:"Epicerie"}]), d:makeRecipe("Salade Niçoise","Thon",9,[{i:"Salade",q:"1",c:"Légumes"},{i:"Thon",q:"1boite",c:"Conserve"},{i:"Oeufs",q:"2",c:"Crèmerie"},{i:"Olives",q:"50g",c:"Epicerie"},{i:"Haricots verts",q:"150g",c:"Légumes"}]), }, 
    veg: {l:makeRecipe("Risotto Vert","Petits pois",9,[{i:"Riz Arborio",q:"200g",c:"Epicerie"},{i:"Petits pois",q:"150g",c:"Surgelés"},{i:"Parmesan",q:"50g",c:"Crèmerie"},{i:"Bouillon",q:"1l",c:"Epicerie"}]), d:makeRecipe("Salade Niçoise Végé","Oeufs",8,[{i:"Salade",q:"1",c:"Légumes"},{i:"Oeufs",q:"3",c:"Crèmerie"},{i:"Haricots verts",q:"150g",c:"Légumes"},{i:"Olives",q:"50g",c:"Epicerie"}]), }, 
    vgn: {l:makeRecipe("Risotto Crémeux","Crème soja",9,[{i:"Riz Arborio",q:"200g",c:"Epicerie"},{i:"Champignons",q:"200g",c:"Légumes"},{i:"Crème soja",q:"10cl",c:"Epicerie"},{i:"Bouillon",q:"1l",c:"Epicerie"}]), d:makeRecipe("Salade Composée","Pois chiches",7,[{i:"Salade",q:"1",c:"Légumes"},{i:"Pois chiches",q:"200g",c:"Conserve"},{i:"Mais",q:"100g",c:"Conserve"},{i:"Avocat",q:"1",c:"Fruits"}]), } 
  }, BF_V2_OPTS[3]),

  // VENDREDI
  makeDay("Vendredi", { 
    std: {l:makeRecipe("Spaghetti Vongole","Palourdes",14,[{i:"Spaghetti",q:"250g",c:"Epicerie"},{i:"Palourdes",q:"300g",c:"Poisson"},{i:"Ail",q:"2",c:"Légumes"},{i:"Persil",q:"1b",c:"Frais"}]), d:makeRecipe("Pizza Margherita","Basilic",8,[{i:"Pâte pizza",q:"1",c:"Frais"},{i:"Mozzarella",q:"2",c:"Crèmerie"},{i:"Basilic",q:"1b",c:"Frais"}])}, 
    veg: {l:makeRecipe("Spaghetti Ail","Piment",7,[{i:"Spaghetti",q:"250g",c:"Epicerie"},{i:"Ail",q:"4",c:"Légumes"},{i:"Piment",q:"1",c:"Epicerie"},{i:"Huile d'olive",q:"5cl",c:"Epicerie"}]), d:makeRecipe("Pizza Margherita","Mozzarella",8,[{i:"Pâte pizza",q:"1",c:"Frais"},{i:"Mozzarella",q:"2",c:"Crèmerie"},{i:"Origan",q:"1cc",c:"Epicerie"}])}, 
    vgn: {l:makeRecipe("Spaghetti Tomates","Séchées",8,[{i:"Spaghetti",q:"250g",c:"Epicerie"},{i:"Tomates séchées",q:"100g",c:"Epicerie"},{i:"Ail",q:"2",c:"Légumes"}]), d:makeRecipe("Pizza Marinara","Origan",7,[{i:"Pâte pizza",q:"1",c:"Frais"},{i:"Sauce tomate",q:"200g",c:"Epicerie"},{i:"Origan",q:"1cs",c:"Epicerie"},{i:"Ail",q:"1",c:"Légumes"}])} 
  }, BF_V2_OPTS[4]),

  // SAMEDI
  makeDay("Samedi", { 
    std: {l:makeRecipe("Paella Royale","Fruits mer",16,[{i:"Riz rond",q:"200g",c:"Epicerie"},{i:"Mélange fruits mer",q:"300g",c:"Surgelés"},{i:"Chorizo",q:"50g",c:"Viande"},{i:"Safran",q:"1d",c:"Epicerie"}]), d:makeRecipe("Tapas Variées","Charcuterie",14,[{i:"Jambon serrano",q:"100g",c:"Viande"},{i:"Manchego",q:"100g",c:"Crèmerie"},{i:"Pain",q:"1",c:"Boulangerie"},{i:"Olives",q:"100g",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Paella Végétarienne","Artichauts",12,[{i:"Riz rond",q:"200g",c:"Epicerie"},{i:"Artichauts",q:"1boite",c:"Conserve"},{i:"Poivrons",q:"2",c:"Légumes"},{i:"Petits pois",q:"100g",c:"Surgelés"}]), d:makeRecipe("Tapas Tortilla","Patatas",10,[{i:"Oeufs",q:"4",c:"Crèmerie"},{i:"Pommes terre",q:"300g",c:"Légumes"},{i:"Oignon",q:"1",c:"Légumes"}]),}, 
    vgn: {l:makeRecipe("Paella Légumes","Safran",11,[{i:"Riz rond",q:"200g",c:"Epicerie"},{i:"Poivrons",q:"2",c:"Légumes"},{i:"Haricots plats",q:"100g",c:"Légumes"},{i:"Safran",q:"1d",c:"Epicerie"}]), d:makeRecipe("Tapas Patatas","Bravas",9,[{i:"Pommes terre",q:"500g",c:"Légumes"},{i:"Sauce bravas",q:"100g",c:"Epicerie"},{i:"Olives",q:"100g",c:"Epicerie"}])} 
  }, BF_V2_OPTS[5]),

  // DIMANCHE
  makeDay("Dimanche", { 
    std: {l:makeRecipe("Gigot Agneau","Haricots",18,[{i:"Tranche gigot",q:"2",c:"Viande"},{i:"Haricots blancs",q:"300g",c:"Conserve"},{i:"Ail",q:"2",c:"Légumes"}]), d:makeRecipe("Soupe Pistou","Basilic",6,[{i:"Mélange soupe",q:"500g",c:"Surgelés"},{i:"Pesto",q:"50g",c:"Epicerie"},{i:"Pâtes",q:"50g",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Tian Légumes","Riz",9,[{i:"Courgettes",q:"2",c:"Légumes"},{i:"Aubergines",q:"1",c:"Légumes"},{i:"Tomates",q:"3",c:"Légumes"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Herbes Provence",q:"1cs",c:"Epicerie"}]), d:makeRecipe("Soupe Minestrone","Parmesan",6,[{i:"Mélange minestrone",q:"500g",c:"Surgelés"},{i:"Parmesan",q:"30g",c:"Crèmerie"}])}, 
    vgn: {l:makeRecipe("Tian Provençal","Quinoa",9,[{i:"Courgettes",q:"2",c:"Légumes"},{i:"Aubergines",q:"1",c:"Légumes"},{i:"Tomates",q:"3",c:"Légumes"},{i:"Quinoa",q:"150g",c:"Epicerie"}]), d:makeRecipe("Minestrone","Haricots",6,[{i:"Mélange minestrone",q:"500g",c:"Surgelés"},{i:"Haricots rouges",q:"100g",c:"Conserve"}])} 
  }, BF_V2_OPTS[6]),
];

// --- PROPOSITION 3 : MODERNE / FUSION (Complet) ---

const PLAN_V3 = [
  // LUNDI
  makeDay("Lundi", {
    std: { l: makeRecipe("Wok Boeuf", "Nouilles", 11, [{i:"Boeuf",q:"200g",c:"Viande"},{i:"Nouilles",q:"200g",c:"Epicerie"}]), d: makeRecipe("Poke Bowl", "Saumon", 14, [{i:"Saumon cru",q:"200g",c:"Poisson"},{i:"Avocat",q:"1",c:"Fruits"}]) },
    veg: { l: makeRecipe("Wok Oeuf", "Nouilles", 9, [{i:"Oeufs",q:"3",c:"Crèmerie"},{i:"Nouilles",q:"200g",c:"Epicerie"}]), d: makeRecipe("Poke Bowl Tofu", "Mangue", 12, [{i:"Tofu",q:"200g",c:"Frais"},{i:"Mangue",q:"1",c:"Fruits"}]) },
    vgn: { l: makeRecipe("Wok Tofu Frit", "Nouilles riz", 9, [{i:"Tofu",q:"200g",c:"Frais"},{i:"Nouilles riz",q:"200g",c:"Epicerie"}]), d: makeRecipe("Poke Bowl Edamame", "Algues", 11, [{i:"Edamame",q:"100g",c:"Surgelés"},{i:"Avocat",q:"1",c:"Fruits"}]) }
  }, BF_V3_OPTS[0]),

  // MARDI
  makeDay("Mardi", { 
    std: {l:makeRecipe("Curry Vert","Poulet",12,[{i:"Poulet",q:"200g",c:"Viande"},{i:"Pâte curry vert",q:"50g",c:"Epicerie"},{i:"Lait coco",q:"200ml",c:"Epicerie"}]), d:makeRecipe("Rouleaux Printemps","Crevette",10,[{i:"Galettes riz",q:"6",c:"Epicerie"},{i:"Crevettes",q:"100g",c:"Poisson"},{i:"Vermicelles",q:"50g",c:"Epicerie"},{i:"Menthe",q:"1b",c:"Frais"}])}, 
    veg: {l:makeRecipe("Curry Légumes","Coco",10,[{i:"Légumes wok",q:"400g",c:"Surgelés"},{i:"Lait coco",q:"200ml",c:"Epicerie"},{i:"Curry",q:"1cs",c:"Epicerie"}]), d:makeRecipe("Rouleaux Végé","Omelette",9,[{i:"Galettes riz",q:"6",c:"Epicerie"},{i:"Oeufs",q:"2",c:"Crèmerie"},{i:"Carottes",q:"2",c:"Légumes"}])}, 
    vgn: {l:makeRecipe("Curry Pois","Coco",9,[{i:"Pois chiches",q:"200g",c:"Conserve"},{i:"Epinards",q:"200g",c:"Surgelés"},{i:"Lait coco",q:"200ml",c:"Epicerie"}]), d:makeRecipe("Rouleaux Tofu","Menthe",9,[{i:"Galettes riz",q:"6",c:"Epicerie"},{i:"Tofu fumé",q:"100g",c:"Frais"},{i:"Concombre",q:"1",c:"Légumes"}])} 
  }, BF_V3_OPTS[1]),

  // MERCREDI
  makeDay("Mercredi", { 
    std: {l:makeRecipe("Pad Thai","Crevettes",13,[{i:"Nouilles riz",q:"200g",c:"Epicerie"},{i:"Crevettes",q:"150g",c:"Poisson"},{i:"Sauce Pad Thai",q:"1s",c:"Epicerie"},{i:"Cahuètes",q:"30g",c:"Epicerie"}]), d:makeRecipe("Salade Papaye","Cahuètes",10,[{i:"Papaye verte",q:"1",c:"Fruits"},{i:"Tomates cerises",q:"10",c:"Légumes"},{i:"Cahuètes",q:"30g",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Pad Thai Tofu","Oeuf",11,[{i:"Nouilles riz",q:"200g",c:"Epicerie"},{i:"Tofu",q:"100g",c:"Frais"},{i:"Oeufs",q:"2",c:"Crèmerie"},{i:"Germes soja",q:"50g",c:"Frais"}]), d:makeRecipe("Salade Mangue","Menthe",9,[{i:"Mangue",q:"1",c:"Fruits"},{i:"Concombre",q:"1",c:"Légumes"},{i:"Menthe",q:"1b",c:"Frais"}])}, 
    vgn: {l:makeRecipe("Pad Thai Végé","Tofu",11,[{i:"Nouilles riz",q:"200g",c:"Epicerie"},{i:"Tofu",q:"150g",c:"Frais"},{i:"Cahuètes",q:"30g",c:"Epicerie"}]), d:makeRecipe("Salade Exotique","Citron vert",9,[{i:"Ananas",q:"1/2",c:"Fruits"},{i:"Avocat",q:"1",c:"Fruits"},{i:"Citron vert",q:"1",c:"Fruits"}])} 
  }, BF_V3_OPTS[2]),

  // JEUDI
  makeDay("Jeudi", { 
    std: {l:makeRecipe("Bao Buns Porc","Confits",12,[{i:"Bao buns",q:"4",c:"Surgelés"},{i:"Porc effiloché",q:"150g",c:"Viande"},{i:"Sauce hoisin",q:"2cs",c:"Epicerie"}]), d:makeRecipe("Gyoza","Salade",10,[{i:"Gyoza poulet",q:"8",c:"Surgelés"},{i:"Salade chou",q:"150g",c:"Frais"},{i:"Sauce soja",q:"1cs",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Bao Buns Tofu","Carottes",11,[{i:"Bao buns",q:"4",c:"Surgelés"},{i:"Tofu mariné",q:"150g",c:"Frais"},{i:"Carottes rapées",q:"100g",c:"Légumes"}]), d:makeRecipe("Gyoza Légumes","Soja",9,[{i:"Gyoza légumes",q:"8",c:"Surgelés"},{i:"Edamame",q:"100g",c:"Surgelés"}])}, 
    vgn: {l:makeRecipe("Bao Buns Champis","Hoisin",11,[{i:"Bao buns",q:"4",c:"Surgelés"},{i:"Champignons",q:"200g",c:"Légumes"},{i:"Coriandre",q:"1b",c:"Frais"}]), d:makeRecipe("Gyoza Végétaux","Sésame",9,[{i:"Gyoza légumes",q:"8",c:"Surgelés"},{i:"Huile sésame",q:"1cc",c:"Epicerie"},{i:"Chou",q:"100g",c:"Légumes"}])} 
  }, BF_V3_OPTS[3]),

  // VENDREDI
  makeDay("Vendredi", { 
    std: {l:makeRecipe("Fish & Chips","Tempura",14,[{i:"Filet poisson",q:"300g",c:"Poisson"},{i:"Frites",q:"300g",c:"Surgelés"},{i:"Sauce tartare",q:"50g",c:"Epicerie"}]), d:makeRecipe("Burger Ramen","Boeuf",13,[{i:"Nouilles ramen",q:"200g",c:"Epicerie"},{i:"Steak haché",q:"2",c:"Viande"},{i:"Oeuf",q:"2",c:"Crèmerie"}])}, 
    veg: {l:makeRecipe("Halloumi Chips","Pois",12,[{i:"Halloumi",q:"200g",c:"Crèmerie"},{i:"Frites",q:"300g",c:"Surgelés"},{i:"Petits pois",q:"100g",c:"Conserve"}]), d:makeRecipe("Burger Ramen Végé","Oeuf",11,[{i:"Nouilles ramen",q:"200g",c:"Epicerie"},{i:"Steak soja",q:"2",c:"Frais"},{i:"Oeuf",q:"2",c:"Crèmerie"}])}, 
    vgn: {l:makeRecipe("Tofu Fish & Chips","Algues",11,[{i:"Tofu ferme",q:"250g",c:"Frais"},{i:"Algues nori",q:"1F",c:"Epicerie"},{i:"Frites",q:"300g",c:"Surgelés"}]), d:makeRecipe("Burger Ramen Tofu","Teriyaki",11,[{i:"Nouilles ramen",q:"200g",c:"Epicerie"},{i:"Tofu",q:"200g",c:"Frais"},{i:"Sauce Teriyaki",q:"30g",c:"Epicerie"}])} 
  }, BF_V3_OPTS[4]),

  // SAMEDI
  makeDay("Samedi", { 
    std: {l:makeRecipe("Poulet Karaage","Riz",13,[{i:"Haut cuisse poulet",q:"300g",c:"Viande"},{i:"Fécule",q:"50g",c:"Epicerie"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Soja",q:"2cl",c:"Epicerie"}]), d:makeRecipe("Chirashi Saumon","Avocat",15,[{i:"Riz sushi",q:"200g",c:"Epicerie"},{i:"Saumon cru",q:"200g",c:"Poisson"},{i:"Avocat",q:"1",c:"Fruits"}])}, 
    veg: {l:makeRecipe("Chou-fleur Karaage","Mayo",10,[{i:"Chou-fleur",q:"1/2",c:"Légumes"},{i:"Fécule",q:"50g",c:"Epicerie"},{i:"Mayonnaise",q:"2cs",c:"Epicerie"}]), d:makeRecipe("Chirashi Omelette","Concombre",11,[{i:"Riz sushi",q:"200g",c:"Epicerie"},{i:"Oeufs",q:"3",c:"Crèmerie"},{i:"Concombre",q:"1",c:"Légumes"}])}, 
    vgn: {l:makeRecipe("Tempura Légumes","Riz",10,[{i:"Mélange légumes",q:"300g",c:"Légumes"},{i:"Farine tempura",q:"100g",c:"Epicerie"},{i:"Riz",q:"150g",c:"Epicerie"}]), d:makeRecipe("Chirashi Tofu","Mangue",11,[{i:"Riz sushi",q:"200g",c:"Epicerie"},{i:"Tofu soyeux",q:"150g",c:"Frais"},{i:"Mangue",q:"1",c:"Fruits"}])} 
  }, BF_V3_OPTS[5]),

  // DIMANCHE
  makeDay("Dimanche", { 
    std: {l:makeRecipe("Katsu Curry","Porc pané",14,[{i:"Escalope porc",q:"2",c:"Viande"},{i:"Chapelure Panko",q:"50g",c:"Epicerie"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Cube Curry Japonais",q:"2",c:"Epicerie"}]), d:makeRecipe("Onigiri","Thon mayo",8,[{i:"Riz sushi",q:"200g",c:"Epicerie"},{i:"Thon boite",q:"1",c:"Conserve"},{i:"Mayonnaise",q:"1cs",c:"Epicerie"},{i:"Nori",q:"2F",c:"Epicerie"}])}, 
    veg: {l:makeRecipe("Curry Japonais","Tofu pané",12,[{i:"Tofu ferme",q:"200g",c:"Frais"},{i:"Panko",q:"50g",c:"Epicerie"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Cube Curry",q:"2",c:"Epicerie"}]), d:makeRecipe("Onigiri Prune","Umeboshi",7,[{i:"Riz sushi",q:"200g",c:"Epicerie"},{i:"Prunes Umeboshi",q:"2",c:"Epicerie"},{i:"Nori",q:"2F",c:"Epicerie"}])}, 
    vgn: {l:makeRecipe("Curry Aubergine","Riz",11,[{i:"Aubergines",q:"2",c:"Légumes"},{i:"Riz",q:"150g",c:"Epicerie"},{i:"Cube Curry",q:"2",c:"Epicerie"},{i:"Carottes",q:"2",c:"Légumes"}]), d:makeRecipe("Onigiri Kombu","Algues",7,[{i:"Riz sushi",q:"200g",c:"Epicerie"},{i:"Kombu",q:"10g",c:"Epicerie"},{i:"Sésame",q:"1cc",c:"Epicerie"}])} 
  }, BF_V3_OPTS[6]),
];


const PLANS = [PLAN_V1, PLAN_V2, PLAN_V3];

const translateRecipe = (r: Recipe, lang: Language): Recipe => {
  // We use the original French title/description from the static PLANS as keys
  // Since makeRecipe and mkBf now handle translation internally, we just need to pass the original strings
  const isBf = r.prepTimeMinutes === 5 && r.cookTimeMinutes === 0;
  const creator = isBf ? mkBf : makeRecipe;
  
  return creator(
    r.title, 
    r.description, 
    r.priceComparison[Supermarket.MIGROS], 
    r.ingredients.map(i => ({ i: i.item, q: i.quantity, c: i.category })), 
    lang
  );
};

const translatePlan = (plan: DailyPlan[], lang: Language): DailyPlan[] => {
  if (lang === Language.FR) return plan;
  return plan.map(day => ({
    ...day,
    breakfast: {
      standard: translateRecipe(day.breakfast.standard, lang),
      vegetarian: translateRecipe(day.breakfast.vegetarian, lang),
      vegan: translateRecipe(day.breakfast.vegan, lang),
      world: translateRecipe(day.breakfast.world, lang),
    },
    lunch: {
      standard: translateRecipe(day.lunch.standard, lang),
      vegetarian: translateRecipe(day.lunch.vegetarian, lang),
      vegan: translateRecipe(day.lunch.vegan, lang),
      world: translateRecipe(day.lunch.world, lang),
    },
    dinner: {
      standard: translateRecipe(day.dinner.standard, lang),
      vegetarian: translateRecipe(day.dinner.vegetarian, lang),
      vegan: translateRecipe(day.dinner.vegan, lang),
      world: translateRecipe(day.dinner.world, lang),
    },
  }));
};

export const generateWeeklyPlan = async (planIndex: number = 0, lang: Language = Language.FR): Promise<DailyPlan[]> => {
  // Simulation rapide
  await new Promise(resolve => setTimeout(resolve, 100)); 
  const safeIndex = Math.abs(planIndex) % 3;
  return translatePlan(PLANS[safeIndex], lang);
};

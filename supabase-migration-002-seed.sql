-- ============================================================
-- Migration 002: Seed Data – 15 Dutch Recipes
-- Run this AFTER migration 001
-- ============================================================

-- Insert all ingredients (unique by name)
INSERT INTO public.ingredients (name, default_unit, category) VALUES
  ('Boerenkool', 'g', 'groente'),
  ('Aardappelen', 'g', 'groente'),
  ('Rookworst', 'stuk', 'vlees_vis'),
  ('Melk', 'ml', 'zuivel'),
  ('Boter', 'g', 'zuivel'),
  ('Mosterd', 'el', 'kruiden'),
  ('Spliterwten', 'g', 'droog'),
  ('Spekblokjes', 'g', 'vlees_vis'),
  ('Prei', 'stuk', 'groente'),
  ('Knolselderij', 'g', 'groente'),
  ('Selderij', 'stengels', 'groente'),
  ('Bloem', 'g', 'droog'),
  ('Eieren', 'stuk', 'zuivel'),
  ('Zout', 'snuf', 'kruiden'),
  ('Klapstuk', 'g', 'vlees_vis'),
  ('Winterwortelen', 'g', 'groente'),
  ('Uien', 'stuk', 'groente'),
  ('Spaghetti', 'g', 'droog'),
  ('Garnalen', 'g', 'vlees_vis'),
  ('Knoflook', 'teentjes', 'groente'),
  ('Cherry tomaatjes', 'g', 'groente'),
  ('Roomkaas', 'g', 'zuivel'),
  ('Peterselie', 'bosje', 'kruiden'),
  ('Gepelde tomaten (blik)', 'g', 'droog'),
  ('Ui', 'stuk', 'groente'),
  ('Groentebouillon', 'ml', 'droog'),
  ('Basilicum', 'bosje', 'kruiden'),
  ('Olijfolie', 'el', 'overig'),
  ('Bami-noedels', 'g', 'droog'),
  ('Kipfilet', 'g', 'vlees_vis'),
  ('Spitskool', 'g', 'groente'),
  ('Ketjap manis', 'el', 'kruiden'),
  ('Sambal', 'el', 'kruiden'),
  ('Rijst', 'g', 'droog'),
  ('Bosui', 'stuk', 'groente'),
  ('Nasi kruiden', 'pakje', 'kruiden'),
  ('Kidneybonen (blik)', 'g', 'droog'),
  ('Zoete aardappel', 'g', 'groente'),
  ('Havermout', 'g', 'droog'),
  ('Komijn', 'tl', 'kruiden'),
  ('Paprikapoeder', 'tl', 'kruiden'),
  ('Hamburgerbroodjes', 'stuk', 'droog'),
  ('Zalmfilet', 'stuk', 'vlees_vis'),
  ('Courgette', 'stuk', 'groente'),
  ('Paprika', 'stuk', 'groente'),
  ('Citroen', 'stuk', 'fruit'),
  ('Tijm', 'el', 'kruiden'),
  ('Oud brood', 'sneetjes', 'droog'),
  ('Kaneel', 'tl', 'kruiden'),
  ('Suiker', 'el', 'droog'),
  ('Rode linzen', 'g', 'droog'),
  ('Wortelen', 'stuk', 'groente'),
  ('Mosselen', 'kg', 'vlees_vis'),
  ('Witte wijn', 'ml', 'overig'),
  ('Laurierblad', 'stuk', 'kruiden'),
  ('Appels (Goudrenet)', 'g', 'fruit'),
  ('Rozijnen', 'g', 'droog'),
  ('Romaine sla', 'kroppen', 'groente'),
  ('Parmezaanse kaas', 'g', 'zuivel'),
  ('Brood (voor croutons)', 'sneetjes', 'droog'),
  ('Ansjovis', 'filets', 'vlees_vis')
ON CONFLICT (name) DO NOTHING;

-- Insert recipes
INSERT INTO public.recipes (slug, title, description, prep_time_minutes, type, course, allergens, tags, base_servings, steps) VALUES
  ('stamppot-boerenkool', 'Stamppot Boerenkool', 'Klassieke Nederlandse stamppot met boerenkool en rookworst. Stevig wintergerecht voor het hele gezin.', 45, 'vlees', 'diner', '{lactose}', '{Klassiek,Winter}', 4,
    '{
      "Schil de aardappelen en snijd ze in stukken. Kook ze in gezouten water in ca. 20 minuten gaar.",
      "Was de boerenkool en snijd grof. Voeg na 10 minuten bij de aardappelen.",
      "Verwarm de rookworst in heet water (niet koken).",
      "Giet het kookwater af. Stamp aardappelen en boerenkool met melk en boter.",
      "Serveer met rookworst en een flinke schep mosterd."
    }'),
  ('erwtensoep', 'Erwtensoep', 'Dikke, hartige erwtensoep met spek en rookworst. Wordt de volgende dag nog lekkerder.', 90, 'vlees', 'diner', '{}', '{Soep,Winter,"60+"}', 6,
    '{
      "Week de spliterwten minimaal 12 uur in ruim water.",
      "Kook de erwten met 2 liter water in ca. 45 minuten halfgaar.",
      "Voeg de gesneden groenten en spekblokjes toe. Kook nog 30 minuten.",
      "Snijd de rookworst in plakjes en voeg de laatste 10 minuten toe.",
      "Roer regelmatig en breng op smaak met peper en zout."
    }'),
  ('pannenkoeken', 'Hollandse Pannenkoeken', 'Dunne, goudbruine pannenkoeken. Lekker met stroop, poedersuiker of spek.', 20, 'vegetarisch', 'lunch', '{gluten,lactose,ei}', '{Snel,Kinderen}', 4,
    '{
      "Meng bloem en zout. Maak een kuiltje en voeg de eieren toe.",
      "Giet de melk er beetje bij beetje bij terwijl je roert tot een glad beslag.",
      "Laat 15 minuten rusten.",
      "Verhit boter in een koekenpan en schep een dunne laag beslag erin.",
      "Bak elke kant ca. 2 minuten goudbruin."
    }'),
  ('hutspot', 'Hutspot met Klapstuk', 'Traditioneel Leids gerecht met wortelen, uien en aardappelen, geserveerd met malse klapstuk.', 75, 'vlees', 'diner', '{lactose}', '{Klassiek,Winter,"60+"}', 4,
    '{
      "Breng het klapstuk aan de kook in ruim water. Laat 1,5 uur zachtjes koken.",
      "Schil aardappelen en wortelen, snijd in stukken. Snipper de uien.",
      "Kook groenten in het vleesbouillon ca. 25 minuten gaar.",
      "Giet af (bewaar wat vocht). Stamp alles grof met boter.",
      "Snijd het klapstuk in plakken en serveer op de hutspot."
    }'),
  ('garnalen-pasta', 'Garnalen Pasta', 'Romige pasta met knoflookgarnalen, cherry tomaatjes en verse peterselie.', 25, 'vis', 'diner', '{gluten,lactose}', '{Snel,Pasta}', 4,
    '{
      "Kook de spaghetti volgens de verpakking.",
      "Bak knoflook in olijfolie. Voeg garnalen toe en bak 2 minuten.",
      "Halveer de tomaatjes en voeg toe. Bak nog 3 minuten.",
      "Roer de roomkaas erdoor tot een romige saus.",
      "Schep de pasta erdoor en garneer met peterselie."
    }'),
  ('tomatensoep', 'Romige Tomatensoep', 'Fluweelzachte tomatensoep met basilicum. Simpel, snel en vol smaak.', 25, 'vegan', 'lunch', '{}', '{Soep,Snel,Vegan}', 4,
    '{
      "Fruit de gesnipperde ui en knoflook in olijfolie.",
      "Voeg de tomaten en bouillon toe. Laat 15 minuten zachtjes koken.",
      "Pureer met een staafmixer tot een gladde soep.",
      "Breng op smaak met zout, peper en verse basilicum."
    }'),
  ('bami-goreng', 'Bami Goreng', 'Indonesisch-Nederlands comfort food. Gebakken noedels met groenten en kip.', 35, 'vlees', 'diner', '{gluten,soja,ei}', '{Aziatisch,Comfort}', 4,
    '{
      "Kook de noedels volgens de verpakking. Giet af en zet apart.",
      "Snijd de kip in blokjes en bak in een wok op hoog vuur.",
      "Voeg de gesneden groenten toe en roerbak 3 minuten.",
      "Voeg noedels, ketjap en sambal toe. Meng goed door.",
      "Serveer met een gebakken eitje en atjar."
    }'),
  ('nasi-goreng', 'Nasi Goreng', 'Gebakken rijst op z''n Indisch. Met garnalen, groenten en een spiegelei.', 40, 'vis', 'diner', '{soja,ei}', '{Aziatisch,Populair}', 4,
    '{
      "Kook de rijst en laat volledig afkoelen (liefst een dag van tevoren).",
      "Bak de garnalen in een wok. Haal eruit en houd warm.",
      "Roerbak de bosui en kruiden. Voeg de koude rijst toe.",
      "Bak op hoog vuur tot de rijst licht bruin wordt. Voeg ketjap toe.",
      "Bak spiegeleieren apart. Serveer nasi met ei en garnalen."
    }'),
  ('vegan-groenteburger', 'Vegan Groenteburger', 'Zelfgemaakte groenteburger met bonen, zoete aardappel en kruiden.', 30, 'vegan', 'diner', '{}', '{Vegan,Burger}', 4,
    '{
      "Schil de zoete aardappel, snijd in blokjes en kook gaar.",
      "Prak de bonen en zoete aardappel samen met een vork.",
      "Meng havermout en kruiden erdoor. Vorm 4 burgers.",
      "Bak de burgers in een pan met olie, 4 minuten per kant.",
      "Serveer op een broodje met sla, tomaat en je favoriete saus."
    }'),
  ('zalm-groenten', 'Zalm met Geroosterde Groenten', 'Mals zalmfilet uit de oven met seizoensgroenten en citroen.', 40, 'vis', 'diner', '{}', '{Gezond,Oven}', 4,
    '{
      "Verwarm de oven voor op 200°C.",
      "Snijd de groenten en verdeel over een bakplaat. Besprenkel met olijfolie.",
      "Rooster de groenten 15 minuten in de oven.",
      "Leg de zalm op de groenten. Besprenkel met citroensap en tijm.",
      "Bak nog 12-15 minuten tot de zalm gaar is."
    }'),
  ('wentelteefjes', 'Wentelteefjes', 'Goudbruine wentelteefjes met kaneel en suiker. Het perfecte weekend-ontbijt.', 15, 'vegetarisch', 'ontbijt', '{gluten,lactose,ei}', '{Snel,Ontbijt}', 4,
    '{
      "Klop eieren, melk, kaneel en suiker door elkaar.",
      "Doop het brood kort in het mengsel (beide kanten).",
      "Verhit boter in een koekenpan.",
      "Bak de wentelteefjes goudbruin, ca. 2 minuten per kant.",
      "Bestrooi met kaneel en suiker naar smaak."
    }'),
  ('linzensoep', 'Linzensoep met Komijn', 'Hartige rode linzensoep met komijn en citroen. Voedzaam en verwarmend.', 35, 'vegan', 'lunch', '{}', '{Soep,Vegan,Gezond}', 4,
    '{
      "Fruit de ui met komijn in olijfolie tot zacht.",
      "Voeg gesneden wortelen en linzen toe. Roer 1 minuut.",
      "Giet de bouillon erbij en breng aan de kook.",
      "Laat 20 minuten zachtjes koken tot de linzen gaar zijn.",
      "Pureer gedeeltelijk. Breng op smaak met citroensap, zout en peper."
    }'),
  ('mosselen', 'Mosselen in Witte Wijn', 'Verse Zeeuwse mosselen gestoomd in witte wijn met groenten. Serveer met friet of brood.', 30, 'vis', 'diner', '{}', '{Zeeland,Seizoen}', 4,
    '{
      "Spoel de mosselen goed af. Verwijder kapotte mosselen.",
      "Snijd de groenten fijn en fruit ze in een grote pan.",
      "Voeg witte wijn en laurierblad toe. Breng aan de kook.",
      "Voeg de mosselen toe, deksel erop. Stoom 5-7 minuten.",
      "Schud de pan af en toe. Serveer zodra alle mosselen open zijn."
    }'),
  ('appeltaart', 'Hollandse Appeltaart', 'De enige echte: knapperige bodem, sappige appelvulling met kaneel en rozijnen.', 75, 'vegetarisch', 'dessert', '{gluten,lactose,ei,noten}', '{Bakken,Klassiek,"60+"}', 8,
    '{
      "Meng bloem, 100g suiker, ei en boter tot een deeg. Laat 30 min rusten in de koelkast.",
      "Schil de appels, snijd in partjes. Meng met kaneel, rozijnen en rest suiker.",
      "Verwarm oven voor op 180°C. Vet een springvorm in.",
      "Bekleed de bodem en rand met ⅔ van het deeg. Vul met appelmengsel.",
      "Maak van de rest deeg repen voor een ruitpatroon.",
      "Bak 50-60 minuten goudbruin. Laat afkoelen voor het snijden."
    }'),
  ('caesar-salade', 'Caesar Salade met Kip', 'Krokante Romaanse sla met gegrilde kip, Parmezaan en zelfgemaakte dressing.', 20, 'vlees', 'lunch', '{gluten,lactose,ei}', '{Snel,Salade}', 4,
    '{
      "Grill de kipfilet met olijfolie, zout en peper. Snijd in plakken.",
      "Snijd brood in blokjes en bak krokant in de pan met knoflook.",
      "Maak dressing: mix ansjovis, knoflook, citroensap, olie en Parmezaan.",
      "Scheur de sla in stukken. Meng met dressing, croutons en kip.",
      "Serveer met extra Parmezaan en versgemalen peper."
    }');

-- Link ingredients to recipes via recipe_ingredients
-- Helper: use subqueries to resolve IDs

-- Stamppot Boerenkool
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Boerenkool', 500, 'g', 1),
  ('Aardappelen', 1000, 'g', 2),
  ('Rookworst', 1, 'stuk', 3),
  ('Melk', 100, 'ml', 4),
  ('Boter', 30, 'g', 5),
  ('Mosterd', 2, 'el', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'stamppot-boerenkool'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Erwtensoep
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Spliterwten', 500, 'g', 1),
  ('Rookworst', 1, 'stuk', 2),
  ('Spekblokjes', 150, 'g', 3),
  ('Prei', 2, 'stuk', 4),
  ('Knolselderij', 200, 'g', 5),
  ('Aardappelen', 300, 'g', 6),
  ('Selderij', 3, 'stengels', 7)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'erwtensoep'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Pannenkoeken
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Bloem', 250, 'g', 1),
  ('Eieren', 3, 'stuk', 2),
  ('Melk', 500, 'ml', 3),
  ('Boter', 30, 'g', 4),
  ('Zout', 1, 'snuf', 5)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'pannenkoeken'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Hutspot
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Klapstuk', 500, 'g', 1),
  ('Aardappelen', 800, 'g', 2),
  ('Winterwortelen', 500, 'g', 3),
  ('Uien', 3, 'stuk', 4),
  ('Boter', 40, 'g', 5)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'hutspot'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Garnalen Pasta
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Spaghetti', 400, 'g', 1),
  ('Garnalen', 300, 'g', 2),
  ('Knoflook', 3, 'teentjes', 3),
  ('Cherry tomaatjes', 250, 'g', 4),
  ('Roomkaas', 100, 'g', 5),
  ('Peterselie', 1, 'bosje', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'garnalen-pasta'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Tomatensoep
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Gepelde tomaten (blik)', 800, 'g', 1),
  ('Ui', 1, 'stuk', 2),
  ('Knoflook', 2, 'teentjes', 3),
  ('Groentebouillon', 500, 'ml', 4),
  ('Basilicum', 1, 'bosje', 5),
  ('Olijfolie', 2, 'el', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'tomatensoep'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Bami Goreng
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Bami-noedels', 300, 'g', 1),
  ('Kipfilet', 300, 'g', 2),
  ('Spitskool', 200, 'g', 3),
  ('Prei', 1, 'stuk', 4),
  ('Ketjap manis', 4, 'el', 5),
  ('Sambal', 1, 'el', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'bami-goreng'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Nasi Goreng
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Rijst', 300, 'g', 1),
  ('Garnalen', 200, 'g', 2),
  ('Eieren', 4, 'stuk', 3),
  ('Bosui', 4, 'stuk', 4),
  ('Nasi kruiden', 1, 'pakje', 5),
  ('Ketjap manis', 3, 'el', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'nasi-goreng'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Vegan Groenteburger
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Kidneybonen (blik)', 400, 'g', 1),
  ('Zoete aardappel', 200, 'g', 2),
  ('Havermout', 60, 'g', 3),
  ('Komijn', 1, 'tl', 4),
  ('Paprikapoeder', 1, 'tl', 5),
  ('Hamburgerbroodjes', 4, 'stuk', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'vegan-groenteburger'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Zalm met Geroosterde Groenten
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Zalmfilet', 4, 'stuk', 1),
  ('Courgette', 2, 'stuk', 2),
  ('Paprika', 2, 'stuk', 3),
  ('Cherry tomaatjes', 200, 'g', 4),
  ('Citroen', 1, 'stuk', 5),
  ('Tijm', 1, 'el', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'zalm-groenten'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Wentelteefjes
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Oud brood', 8, 'sneetjes', 1),
  ('Eieren', 3, 'stuk', 2),
  ('Melk', 150, 'ml', 3),
  ('Kaneel', 2, 'tl', 4),
  ('Suiker', 2, 'el', 5),
  ('Boter', 30, 'g', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'wentelteefjes'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Linzensoep
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Rode linzen', 250, 'g', 1),
  ('Ui', 1, 'stuk', 2),
  ('Wortelen', 2, 'stuk', 3),
  ('Komijn', 2, 'tl', 4),
  ('Groentebouillon', 1000, 'ml', 5),
  ('Citroen', 1, 'stuk', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'linzensoep'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Mosselen
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Mosselen', 2, 'kg', 1),
  ('Witte wijn', 200, 'ml', 2),
  ('Prei', 1, 'stuk', 3),
  ('Selderij', 2, 'stengels', 4),
  ('Ui', 1, 'stuk', 5),
  ('Laurierblad', 2, 'stuk', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'mosselen'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Appeltaart
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Bloem', 300, 'g', 1),
  ('Boter', 200, 'g', 2),
  ('Suiker', 150, 'g', 3),
  ('Eieren', 1, 'stuk', 4),
  ('Appels (Goudrenet)', 1500, 'g', 5),
  ('Kaneel', 2, 'tl', 6),
  ('Rozijnen', 75, 'g', 7)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'appeltaart'
JOIN public.ingredients i ON i.name = v.ingredient_name;

-- Caesar Salade
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit, sort_order)
SELECT r.id, i.id, v.amount, v.unit, v.sort_order
FROM (VALUES
  ('Romaine sla', 2, 'kroppen', 1),
  ('Kipfilet', 400, 'g', 2),
  ('Parmezaanse kaas', 60, 'g', 3),
  ('Brood (voor croutons)', 4, 'sneetjes', 4),
  ('Knoflook', 1, 'teentje', 5),
  ('Ansjovis', 4, 'filets', 6)
) AS v(ingredient_name, amount, unit, sort_order)
JOIN public.recipes r ON r.slug = 'caesar-salade'
JOIN public.ingredients i ON i.name = v.ingredient_name;

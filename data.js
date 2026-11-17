/* Meal plans and guidance content. Plan day 1 = Monday ... day 7 = Sunday. */
window.DIET = {
  early: 'Warm water + black tea/coffee without sugar + 5 soaked almonds',
  bedtime: 'Optional: 1 glass moru (buttermilk)',

  slots: [
    { key: 'b', label: 'Breakfast', time: '8:00–9:00 am', kcal: 450 },
    { key: 'm', label: 'Mid-morning', time: '11:00 am', kcal: 80 },
    { key: 'l', label: 'Lunch', time: '1:00–2:00 pm', kcal: 650 },
    { key: 's', label: 'Evening', time: '4:30 pm', kcal: 250, prefix: 'Tea without sugar + ' },
    { key: 'd', label: 'Dinner', time: '7:30–8:00 pm', kcal: 500 }
  ],

  plans: {
    A: {
      name: 'Pure vegetarian',
      short: 'Pure veg',
      summary: 'No egg, no meat; milk and curd included. About 2,000 kcal and 100 g protein a day.',
      tip: 'Protein comes from soya chunks, tofu, low-fat paneer, curd, milk and pulses. Have one of them in every meal. Paneer: at most 75 g a day, low-fat only.',
      days: [
        { b: '3 idli + 1 bowl sambar + tomato/mint chutney + 1 cup low-fat curd', m: '1 guava', l: '1 cup matta rice + parippu curry + beans thoran + cucumber-carrot salad + 1 glass moru', s: 'Soya chunks sundal (40 g dry)', d: '2 chapati + low-fat paneer bhurji (75 g) with capsicum + onion-tomato salad' },
        { b: 'Vegetable oats upma (50 g oats) + 1 glass toned milk + 10 peanuts', m: '1 apple', l: '1 cup matta rice + rajma curry + avial (less coconut) + salad + 1 glass moru', s: '1 cup kadala sundal', d: '2 ragi/wheat dosa + mixed vegetable kurma (thin gravy) + 1 cup curd' },
        { b: '1 small piece red-rice puttu + 1 bowl kadala curry + 1 glass toned milk', m: '1 orange', l: '1 cup matta rice + sambar + soya chunk curry (40 g) + beetroot thoran + 1 glass moru', s: 'Roasted chana 30 g + 1 pear', d: '2 chapati + dal palak + tofu / low-fat paneer stir-fry (75 g) + salad' },
        { b: '2 appam (no sugar) + vegetable stew made with toned milk + 1 cup curd', m: 'Papaya (1 cup)', l: '1 cup matta rice + cherupayar curry + cabbage thoran + salad + 1 glass moru', s: 'Sprouts salad (1 cup green gram sprouts, onion, tomato, lemon)', d: 'Vegetable oats kanji (50 g oats) + low-fat paneer tikka (75 g, pan-grilled)' },
        { b: '2 ragi dosa + 1 bowl sambar + 1 cup low-fat curd + 5 walnuts', m: '1 guava', l: '1 cup matta rice + vanpayar (red cowpea) curry + vendakka mezhukkupuratti + salad + 1 glass moru', s: 'Soya chunks sundal (40 g dry)', d: '2 chapati + chana masala (1 cup) + cucumber raita' },
        { b: 'Broken-wheat (gothambu nurukku) vegetable upma, 1 cup + 1 glass toned milk', m: '1 apple', l: '1 cup matta rice + sambar + low-fat paneer curry (75 g) + pavakka/beans thoran + 1 glass moru', s: '1 glass moru + 10 almonds + 1 orange', d: '2 small wheat puttu pieces or 2 wheat dosa + cherupayar curry + salad' },
        { b: '3 red-rice idiyappam + green peas curry (light coconut) + 1 cup curd', m: 'Papaya (1 cup)', l: '1 cup matta rice + parippu + avial + soya chunk roast (40 g, 1 tsp oil) + 1 glass moru', s: '1 cup kadala sundal', d: '2 chapati + tofu bhurji (100 g) + clear vegetable soup + salad' }
      ]
    },
    B: {
      name: 'Veg + egg + chicken',
      short: 'Non-veg',
      summary: 'About 2,000 kcal and 130 g protein a day. At most 1 egg yolk a day. Chicken always skinless, never fried.',
      tip: 'Any chicken meal can become mathi or ayala curry (not fried) for extra heart benefit. Cook chicken in a tomato-onion-pepper masala; if you use coconut, only thin coconut milk.',
      days: [
        { b: '3 idli + 1 bowl sambar + 1 boiled egg + 2 boiled egg whites', m: '1 guava', l: '1 cup matta rice + chicken curry (150 g, light coconut) + cabbage thoran + salad + 1 glass moru', s: '1 cup cherupayar sundal', d: '2 chapati + parippu / dal + mixed vegetable stir-fry + salad' },
        { b: 'Oats (50 g) cooked in toned milk, no sugar, with ½ apple + 1 boiled egg + 2 egg whites', m: '1 orange', l: '1 cup matta rice + kadala curry + beans thoran + salad + 1 glass moru', s: '3 boiled egg whites + 10 peanuts', d: '2 chapati + pepper chicken (150 g, 1 tsp oil) + cucumber-onion salad' },
        { b: '1 small piece red-rice puttu + kadala curry + 2 boiled egg whites', m: '1 apple', l: '1 cup matta rice + chicken curry (150 g) + avial (less coconut) + 1 glass moru', s: 'Soya chunks sundal (40 g dry)', d: '2 wheat/ragi dosa + sambar + 1-egg vegetable omelette (1 tsp oil)' },
        { b: '2 appam (no sugar) + egg curry (1 egg + 2 whites, tomato-onion base)', m: 'Papaya (1 cup)', l: '1 cup matta rice + sambar + low-fat paneer / soya curry + beetroot thoran + 1 glass moru', s: '1 cup kadala sundal', d: 'Grilled / tandoori chicken (150 g) + 1 chapati + big salad + clear vegetable soup' },
        { b: '2 ragi dosa + sambar + 1 boiled egg + 2 egg whites', m: '1 guava', l: '1 cup matta rice + chicken curry (150 g) + vendakka mezhukkupuratti + salad + 1 glass moru', s: 'Roasted chana 30 g + 1 pear', d: 'Vegetable oats kanji (50 g oats) + egg-white bhurji (4 whites) with vegetables' },
        { b: 'Broken-wheat vegetable upma (1 cup) + 1-egg omelette with onion & tomato', m: '1 apple', l: '1 cup matta rice + rajma curry + cabbage thoran + salad + 1 glass moru', s: 'Sprouts salad (1 cup) + 2 boiled egg whites', d: '2 chapati + chicken curry (150 g) + salad' },
        { b: '3 red-rice idiyappam + egg curry (1 egg + 2 whites)', m: 'Papaya (1 cup)', l: '1 cup matta rice + chicken roast (150 g, less oil) + sambar + beans thoran + 1 glass moru', s: '1 cup cherupayar sundal', d: '2 dosa + parippu curry + vegetable stir-fry + 1 cup curd' }
      ]
    },
    C: {
      name: 'Busy workweek (meal-prep)',
      short: 'Busy week',
      summary: 'Overnight oats, one-pot lunchboxes cooked on Sunday and Wednesday night, desk snacks and 15-minute salad dinners. About 2,000 kcal and 125 g protein a day.',
      tip: 'Veg swaps: chicken → 40 g dry soya chunks, 100 g tofu or 75 g low-fat paneer; eggs → 100 g curd or ½ cup sprouts. Canteen days: chapati + dal + vegetable + curd or grilled chicken; skip porotta, biryani and fried items.',
      days: [
        { b: 'Apple-cinnamon overnight oats: 50 g oats + 150 ml toned milk + 100 g curd + 1 tsp chia + ½ apple + cinnamon + 5 almonds', m: '1 guava', l: 'Lunchbox (prepped Sun): one-pot chicken & vegetable pulao (¾ cup cooked matta rice, 120 g chicken) + cucumber sticks + 1 pack moru', s: '2 boiled egg whites + 20 g roasted chana', d: 'Kadala salad bowl (1 cup boiled kadala, cucumber, tomato, onion, capsicum, lemon, 1 tsp oil) + 1 chapati + 1 cup curd' },
        { b: 'Papaya-walnut overnight oats: 50 g oats + 150 ml milk + 100 g curd + 1 tsp flax seeds + 1 cup papaya + 4 walnuts', m: '1 orange', l: 'Lunchbox (prepped Sun): one-pot moong dal & vegetable khichdi (40 g rice + 40 g dal, spinach, carrot) + 2 boiled egg whites + salad', s: '1 pack moru + 10 peanuts + 1 apple', d: 'Grilled chicken salad bowl (150 g pepper chicken, cabbage, carrot, cucumber, sprouts, lemon-pepper dressing) + 1 chapati' },
        { b: 'Apple-cinnamon overnight oats + 1 boiled egg', m: '1 guava', l: 'Lunchbox (prepped Sun): one-pot soya chunk pulao (¾ cup cooked rice, 40 g dry soya, mixed veg) + cucumber raita', s: 'Sprouts chaat (1 cup green gram sprouts, onion, tomato, lemon)', d: 'Egg bhurji wraps (1 egg + 3 whites with onion, tomato, capsicum) in 2 chapati + big salad' },
        { b: 'Banana-peanut overnight oats: 50 g oats + 150 ml milk + 100 g curd + ½ small banana + 1 tsp unsweetened peanut butter', m: '1 pear', l: 'Lunchbox (prepped Wed): one-pot chicken & broken-wheat biryani (¼ cup raw gothambu nurukku, 120 g chicken, mint) + onion-cucumber salad', s: '30 g roasted chana + 1 pack moru', d: 'Paneer or tofu salad bowl (75 g low-fat paneer or 100 g tofu, grilled, mixed veg, sprouts, lemon) + 1 chapati' },
        { b: 'Papaya-walnut overnight oats + 1 boiled egg', m: '1 apple', l: 'Lunchbox (prepped Wed): one-pot rajma & vegetable rice (¾ cup cooked rice, ¾ cup rajma, capsicum, onion, tomato) + salad', s: '2 boiled egg whites + 1 orange', d: 'One-pot chicken clear soup (120 g chicken, cabbage, carrot, beans, pepper, ginger) + 2 chapati' },
        { b: '2 ragi dosa + sambar + 1 boiled egg + 2 egg whites', m: 'Papaya (1 cup)', l: '1 cup matta rice + mathi/ayala or chicken curry (not fried) + thoran + 1 glass moru', s: 'Sprouts salad (1 cup)', d: 'Kadala salad bowl + 1 chapati + 1 cup curd' },
        { b: '1 small piece red-rice puttu + kadala curry + 2 egg whites', m: '1 guava', l: '1 cup matta rice + chicken curry (150 g) + avial (less coconut) + 1 glass moru. Then the Sunday prep session.', s: '10 almonds + 1 apple', d: 'Vegetable oats kanji (50 g oats) + egg-white bhurji (3 whites)' }
      ]
    }
  },

  habits: [
    { key: 'noSugar', label: 'No sugar' },
    { key: 'noFried', label: 'No fried food / maida' },
    { key: 'oil', label: 'Oil ≤ 3 tsp' },
    { key: 'rice', label: 'Rice ≤ 1 cup per meal' },
    { key: 'dinner8', label: 'Dinner by 8 pm' },
    { key: 'strength', label: 'Strength training' }
  ],

  guide: [
    { title: 'Daily targets', items: [
      'Calories: 1,950–2,050 kcal',
      'Protein: 120–140 g (non-veg plan) or 95–110 g (veg plan)',
      'Cooked rice: at most 1 cup per meal, matta / red rice',
      'Oil: 3 teaspoons a day in total; grated coconut at most 2 tablespoons',
      'Egg yolk: at most 1 a day (whites are unlimited)',
      'Water: 2.5–3 litres (10–12 glasses)',
      'Walking: 30–45 min brisk, 5 days a week; 7,000–8,000 steps',
      'Strength training: 2 days a week',
      'Sleep 7+ hours; finish dinner 2–3 hours before bed'
    ]},
    { title: 'Eat more', items: [
      'Vegetables: half of every lunch and dinner plate',
      'Pulses: kadala, cherupayar, vanpayar, rajma, parippu',
      'Oats, ragi and broken wheat in place of refined grains',
      'Soya chunks and tofu',
      'Moru, low-fat curd, toned milk',
      'Egg whites and skinless chicken (curry, roast or grilled)',
      '10–15 almonds or walnuts a day',
      'Fruit: guava, apple, papaya, orange, pear (1–2 a day)',
      'Optional: mathi or ayala curry 2–3 times a week'
    ]},
    { title: 'Avoid or strictly limit', items: [
      'Sugar: in tea or coffee, sweets, payasam, soft drinks, packed juice',
      'Maida: porotta, bakery items, puffs, cakes, biscuits, white bread',
      'Fried food: pazhampori, parippuvada, chips, mixture, fried chicken or fish',
      'Alcohol: stop completely (fatty liver)',
      'Red meat: beef, mutton, pork, processed meat',
      'Ghee, butter, vanaspati, full-cream milk, cheese',
      'Heavy coconut-milk gravies',
      'Banana, mango, chikoo, jackfruit: small portions only, occasionally',
      'Late-night eating and second helpings of rice'
    ]},
{ title: 'Meal prep (Busy week plan)', items: [
      'Sunday (~90 min): cook kadala and rajma; cook Mon–Wed lunchboxes (chicken pulao, moong dal khichdi, soya pulao); boil 6 eggs; chop salad veg; marinate the chicken for Tuesday; make 3 overnight-oats jars; start sprouts',
      'Wednesday night (~45 min): cook Thu–Fri lunchboxes (chicken broken-wheat biryani, rajma rice); make 2 oats jars; top up salad veg',
      'Overnight oats: 50 g oats + 150 ml toned milk + 100 g curd + 1 tsp chia or flax + cinnamon, no sugar. Keeps 3 days; add fruit and nuts in the morning',
      'One-pot pulao (per box): 1 tsp oil, jeera, onion, ginger-garlic; 120 g chicken or 40 g soaked soya; ⅔ cup veg; ¼ cup matta rice + ¾ cup water; 4–5 whistles',
      'Salad bowl: 2 cups raw veg + 1 protein + something crunchy + lemon, 1 tsp oil, pepper, chaat masala. Keep dressing separate',
      'Food safety: cool food within 1 hour, refrigerate, eat within 3 days, reheat until steaming, never reheat twice',
      'Desk drawer: roasted chana, small portions of nuts, fruit for 2 days, tea bags'
    ]},
    { title: 'Portion guide', items: [
      '1 cup = a standard 200–250 ml tea cup',
      'Chapati: wheat, palm-size, no ghee',
      'Dosa: medium, made with 1 tsp oil or less',
      'Puttu: 1 small piece = ½ cup red-rice puttu',
      'Chicken: 150 g raw skinless ≈ 6–7 medium pieces',
      'Paneer: low-fat, 75 g ≈ 8 small cubes',
      'Soya chunks: 40 g dry ≈ 1 cup after soaking'
    ]},
    { title: 'Cooking tips', items: [
      'Measure oil with a teaspoon; mix coconut oil with rice-bran or groundnut oil',
      'Thoran: 1 tbsp coconut per serving, not a handful',
      'Curries: thin coconut milk or none; tomato, onion or curd base instead',
      'Make stew with toned milk in place of thick coconut milk',
      'Grill, roast, steam or bake chicken; no deep-frying',
      'Less salt; no pappadam or pickles every day'
    ]}
  ],

  /* Blood test fields with simple reference targets. dir: 'max' = lower is better, 'min' = higher is better. */
  labs: [
    { key: 'chol', label: 'Total cholesterol', unit: 'mg/dl', target: 200, dir: 'max' },
    { key: 'ldl', label: 'LDL', unit: 'mg/dl', target: 130, dir: 'max' },
    { key: 'hdl', label: 'HDL', unit: 'mg/dl', target: 40, dir: 'min' },
    { key: 'tg', label: 'Triglycerides', unit: 'mg/dl', target: 150, dir: 'max' },
    { key: 'sgpt', label: 'SGPT (ALT)', unit: 'U/L', target: 40, dir: 'max' },
    { key: 'fbs', label: 'Fasting sugar', unit: 'mg/dl', target: 100, dir: 'max' },
    { key: 'hba1c', label: 'HbA1c', unit: '%', target: 5.7, dir: 'max' }
  ]
};

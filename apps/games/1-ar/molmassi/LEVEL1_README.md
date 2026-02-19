# Mólmassi - Level 1 Prototype

## What Changed?

### OLD (Calculation-Heavy):
```
Student Task: Calculate molar mass of H₂O
- See formula: "H₂O"
- Look up: H = 1.008, O = 15.999
- Calculate: 2×1.008 + 15.999 = 18.015
- Type: "18.015"
- Click "Svara"
- OR: Click "Sýna útreikning" → Copy answer
```

### NEW (Conceptual):
```
Student Task: Understand molecules through visual interaction
- See visual atoms (circles of different sizes/colors)
- Count atoms in a molecule
- Compare which molecule is heavier
- Build molecules by adding atoms
- Estimate mass ranges
- NO calculator, NO typing numbers
```

---

## Pedagogical Improvements

### 1. **Conceptual Before Computational**
Students understand WHAT molar mass means before HOW to calculate it:
- "Molecules are made of atoms" (visual building blocks)
- "Different atoms have different masses" (size = mass correlation)
- "Formula subscripts show atom count" (H₂O = 2 H + 1 O)
- "More/bigger atoms = more mass" (intuitive relationship)

### 2. **Immediate Visual Feedback**
- Atoms shown as colored circles (H = white, O = red, C = black, etc.)
- Circle size correlates with atomic mass (heavier = bigger)
- Mass bar shows relative "weight" of molecule
- Students SEE the relationship, not just calculate it

### 3. **Can't Cheat**
| Old Game | New Game |
|----------|----------|
| "Sýna útreikning" shows full solution | No solution button |
| Type any number and check | Must interact with atoms |
| Calculator does the thinking | Understanding demonstrated through action |

### 4. **Progressive Challenge Types**
1. **Telja frumeindir** (Count atoms): "How many H atoms in H₂O?"
2. **Bera saman massa** (Compare mass): "Which is heavier: CO₂ or H₂O?"
3. **Byggja sameind** (Build molecule): Add atoms to match formula
4. **Áætla massabil** (Estimate range): "Is this 0-25, 25-50, or 50-100 g/mol?"

---

## Visual Design

### Atom Representation
| Element | Color | Size | Icelandic |
|---------|-------|------|-----------|
| H (Hydrogen) | White | Small (20px) | Vetni |
| C (Carbon) | Black | Medium (34px) | Kolefni |
| N (Nitrogen) | Blue | Medium (32px) | Köfnunarefni |
| O (Oxygen) | Red | Medium (30px) | Súrefni |
| S (Sulfur) | Yellow | Large (40px) | Brennisteinn |
| Cl (Chlorine) | Green | Large (38px) | Klór |
| Na (Sodium) | Purple | Large (44px) | Natríum |
| Ca (Calcium) | Orange | Large (48px) | Kalsíum |

Size correlates with mass: **Heavier atoms are shown as larger circles.**

### Molecule Visualization
```
H₂O (Water):
┌─────────────────────────┐
│  ⚪ ⚪  🔴               │
│  H  H   O               │
└─────────────────────────┘

Mass Bar:
[████░░░░░░░░░░░░░░░░░░░░]
 Létt              Þungt
```

---

## How to Test

### Option 1: Replace current App.tsx
```bash
cd games/1-ar/molmassi
cp src/App.tsx src/App.BACKUP.tsx
cp src/App-Level1-Demo.tsx src/App.tsx
npm run dev
```

### Option 2: Direct component import
```typescript
// In main.tsx or App.tsx
import { Level1 } from './components/Level1';
```

---

## What Students Learn (No Calculations!)

### Core Concepts:
1. **Molecules are built from atoms** - Visual building blocks
2. **Different atoms have different masses** - Size correlation
3. **Formula shows atom count** - Subscript interpretation
4. **Total mass = sum of parts** - Additive concept

### What They DON'T Learn (Yet):
- Exact atomic masses (Level 2/3)
- Molar mass calculations (Level 3)
- Significant figures (Level 3)
- Unit conversions (Level 3)

Those are for **Level 2 and 3** after conceptual foundation is solid.

---

## Challenge Breakdown

### Challenge 1: Telja frumeindir (Count Atoms)
```
"Hversu margar Vetni (H) frumeindir eru í H₂O?"

[Visual: ⚪ ⚪ 🔴]

Options: [1] [2] [3] [4] [5] [6]
```
**Skill:** Reading chemical formulas, understanding subscripts

### Challenge 2: Bera saman massa (Compare Mass)
```
"Hvort efnið er þyngra?"

┌──────────┐  ┌──────────┐
│  H₂O     │  │  CO₂     │
│  ⚪⚪🔴   │  │  ⚫🔴🔴  │
│  Vatn    │  │ Koltvísýr│
└──────────┘  └──────────┘
```
**Skill:** Relative mass intuition, comparing atom counts and sizes

### Challenge 3: Byggja sameind (Build Molecule)
```
Target: NH₃ (Ammóníak)

Your molecule: [empty]

Available atoms:
  🔵 N  [−][0][+]
  ⚪ H  [−][0][+]

[Athuga sameind]
```
**Skill:** Formula interpretation, hands-on construction

### Challenge 4: Áætla massabil (Estimate Range)
```
"Í hvaða massabil fellur NaCl?"

[Visual: 🟣 🟢]

Options:
[0-25 g/mol]
[25-50 g/mol]
[50-100 g/mol]
```
**Skill:** Rough estimation, atom mass awareness

---

## Educational Rationale

### Why This Order?

1. **Count first** - Establishes that formulas encode quantity
2. **Compare second** - Builds mass intuition without numbers
3. **Build third** - Active construction reinforces understanding
4. **Estimate fourth** - Bridges to quantitative thinking

### Why No Exact Numbers?

Students often:
- Memorize formulas without understanding
- Use calculators without conceptual grounding
- Can solve problems but can't explain concepts

Level 1 forces **conceptual engagement** before procedural skill.

---

## Icelandic Terminology

All terms verified against `Orðasafn í efnafræði.md`:

| English | Icelandic | Usage |
|---------|-----------|-------|
| atom | frumeind | "Hversu margar frumeindir?" |
| molecule | sameind | "Byggðu sameindina" |
| molar mass | mólmassi | Game title |
| element | frumefni | In educational notes |
| mass | massi | "Bera saman massa" |

---

## Next Steps (Level 2 & 3)

### Level 2: Application/Reasoning
**"Massa Meistarar"** - Estimate and reason about molar mass
- Given visual molecule, estimate molar mass
- Compare multiple molecules (order by mass)
- Introduce approximate atomic masses (H≈1, C≈12, O≈16)

### Level 3: Calculation
**"Mólmassi Leikur"** - Current game with calculations
- Use periodic table lookup
- Calculate exact molar mass
- Students NOW understand WHY the formula works

---

## Files Created

```
molmassi/
├── src/
│   └── components/
│       └── Level1.tsx              ← New conceptual game (~500 lines)
├── App-Level1-Demo.tsx             ← Demo wrapper
├── LEVEL1_README.md                ← This file
└── VISUAL_COMPARISON.md            ← Old vs new comparison
```

---

## Questions for Siggi

1. **Does the visual representation work?** Are atom sizes/colors intuitive?
2. **Is 8 challenges the right length?** Too short? Too long?
3. **Should we add more compound types?** Currently using simple molecules.
4. **Animation ideas?** Atoms could bounce when added, pulse when correct.
5. **Sound effects?** Pling for correct, buzz for wrong?

---

## Success Metrics

### How to Measure If This Works:
1. Can students explain what a formula means without calculating?
2. Can students predict which molecule is heavier without numbers?
3. Do students engage more with visual vs. calculation version?
4. Do students perform better in Level 3 after completing Level 1?

### Expected Outcomes:
- Faster conceptual grasp of molar mass concept
- Better retention of atom-molecule relationship
- Smoother transition to calculation-based problems
- Higher engagement (visual > abstract)

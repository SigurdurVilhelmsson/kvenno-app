# Lausnir - Level 1 Prototype (Conceptual)

## What Changed?

### OLD (Calculation-Heavy):
```
Student Task: Calculate molarity using formulas
- Input: Numerical answer (0.432 M)
- Click "Athuga" (Check)
- Uses M₁V₁ = M₂V₂ formula
- Requires calculator, unit conversions
- "Sýna lausn" button reveals answer
```

### NEW (Conceptual):
```
Student Task: Manipulate molecules and volume visually
- Drag slider to change volume
- Click +/- to add/remove molecules
- Watch concentration change in REAL-TIME
- Match target concentration by understanding relationships
- NO calculations, NO formulas shown
```

---

## Pedagogical Improvements

### 1. **Conceptual Before Computational**
Students understand WHAT concentration means before HOW to calculate it:
- "Concentration = molecules per volume" (visual)
- "More molecules in same space = higher concentration" (manipulate to see)
- "Adding water spreads molecules out → lower concentration" (dilution concept)

### 2. **Immediate Visual Feedback**
- Concentration display updates in REAL-TIME as students adjust
- Color-coded feedback (green = correct, yellow = close, red = far)
- Direction arrows (↑↑ = need more, ↓↓ = need less)
- Visual molecule density changes as concentration changes

### 3. **Can't Cheat**
Old game: Click "Sýna lausn" → Copy answer
New game: Must manipulate to understand relationships

### 4. **Progressive Difficulty**
1. Challenge 1: Simple dilution (volume only)
2. Challenge 2: Build concentration (both variables)
3. Challenge 3-4: More dilution practice
4. Challenge 5-6: Advanced manipulation

---

## What Students Learn (No Calculations!)

### ✅ Core Concepts:
1. **Concentration = molecules per volume** (M = n/V visualized)
2. **Dilution preserves molecules** (only volume changes)
3. **Inverse relationship** (more volume → less concentration)
4. **Direct relationship** (more molecules → more concentration)

### ❌ What They DON'T Learn (Yet):
- M₁V₁ = M₂V₂ formula (Level 2/3)
- Unit conversions (mL → L) (Level 3)
- Molar mass calculations (Level 3)
- Significant figures (Level 3)

Those are for **Level 2/3** after conceptual foundation is solid.

---

## Design Principles Applied

| Principle | Implementation | ✓ |
|-----------|---------------|---|
| Visual First | Molecules as dots, concentration as density | ✓ |
| Interactive | Slider for volume, buttons for molecules | ✓ |
| Immediate Feedback | Real-time concentration updates | ✓ |
| Guided Discovery | Hints explain concepts, not formulas | ✓ |
| Can't Cheat | Must manipulate to match target | ✓ |
| Mobile-Friendly | Large touch targets, no keyboard needed | ✓ |

---

## How to Test

### Option 1: Replace current App.tsx
```bash
cd games/1-ar/lausnir
cp src/App.tsx src/App-OLD-BACKUP.tsx
cp src/App-Level1-Demo.tsx src/App.tsx
npm run dev
```

### Option 2: Keep both versions
Add routing to switch between Level 1 (conceptual) and Level 3 (calculation).

---

## Challenge Types

### 1. Útþynning (Dilution)
**Student action:** Adjust volume slider only (molecules fixed)
**Concept learned:** Adding water spreads molecules → lower concentration

```
Fixed: 50 molecules
Adjust: Volume 100-500 mL
Target: Various concentrations
```

### 2. Byggja lausn (Build Solution)
**Student action:** Adjust both molecules AND volume
**Concept learned:** Multiple ways to achieve same concentration

```
Adjust: Molecules 10-100
Adjust: Volume 100-400 mL
Target: Specific concentration
```

### 3. Styrkjamöt (Concentration Match)
**Student action:** Adjust molecules only (volume fixed)
**Concept learned:** Direct relationship between molecules and concentration

```
Fixed: Volume 150 mL
Adjust: Molecules 10-100
Target: Specific concentration
```

---

## Visual Design

### Beaker Visualization
```
┌─────────────┐
│  ●  ●  ●    │ ← Molecules (dots)
│    ●  ●     │
│  ●  ●  ●  ● │
│═════════════│ ← Fill level shows volume
│             │
└─────────────┘
     250 mL
```

### Concentration Feedback
```
┌─────────────────────────────────┐
│     Núverandi styrkur           │
│        2.34 M  ↑                │
│     Markmið: 2.50 M             │
│                                 │
│ [████████░░░░░░░░░░░] 93%       │
└─────────────────────────────────┘
```

- Green border: Within tolerance ✓
- Yellow border: Close (within 2× tolerance)
- Red border: Far off

---

## Comparison: Old vs New

| Aspect | Old Game | New Level 1 |
|--------|----------|-------------|
| Input | Number field | Sliders/buttons |
| Feedback | After submit | Real-time |
| Formulas | Shown in hints | Hidden |
| Calculator | Required | Not needed |
| Cheating | "Show solution" | Must manipulate |
| Understanding | Procedural | Conceptual |
| Time per problem | 2-5 minutes | 30-60 seconds |

---

## Next Steps

### Level 2: Application/Reasoning
"What happens when...?" questions
- "You have 100 mL of 2 M solution. If you add 100 mL water, the concentration will be..."
- Multiple choice, prediction-based
- Reinforces concepts without calculation

### Level 3: Analysis/Calculation
Move current game content here
- Now students understand WHY M₁V₁ = M₂V₂ works
- Formula application with solid conceptual base
- Unit conversions and molar mass calculations

---

## Technical Notes

- Pure TypeScript/React (no new dependencies)
- ~400 lines of code
- Responsive design (mobile-friendly)
- CSS transitions for smooth visual feedback
- Can coexist with old version for A/B testing

---

## Terminology Fixes Needed

Based on Orðasafn í efnafræði.md:
- "mólþyngd" → "mólmassi" (molar mass)
- Keep: mólstyrkur, lausn, styrkur, rúmmál

---

## File Structure
```
lausnir/src/
├── components/
│   └── Level1.tsx          ← NEW: Conceptual game
├── App.tsx                 ← OLD: Calculation game
├── App-Level1-Demo.tsx     ← NEW: Demo wrapper
└── ...
```

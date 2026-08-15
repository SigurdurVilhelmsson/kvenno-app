# Shared Component Library

This shared library provides common components, hooks, utilities, and types used across all ChemistryGames. It enables code reuse, consistency, and maintainability.

---

## 📦 Package Structure

```
shared/
├── components/                    # Shared React components
│   ├── Header.tsx                    # Site-wide header
│   ├── Breadcrumbs.tsx               # Breadcrumb navigation
│   ├── Footer.tsx                    # Site-wide footer
│   ├── AchievementsPanel/            # Achievement system UI
│   ├── HintSystem/                   # Tiered progressive hints
│   ├── FeedbackPanel/                # Detailed answer feedback
│   ├── InteractiveGraph/             # Canvas-based graph (spline curves, gradient fills)
│   ├── ParticleSimulation/           # Physics particle engine (sphere shading, trails, glow)
│   ├── AnimatedMolecule/             # Ball-and-stick molecule renderer
│   ├── DragDropBuilder/              # Drag-and-drop interface
│   ├── AnimatedCounter/              # Rolling numbers, ScorePopup, StreakCounter
│   └── index.ts                      # Barrel exports
├── hooks/                         # React hooks
│   ├── useI18n.ts                    # Internationalization
│   ├── useGameI18n.ts                # Game-specific i18n with custom translations
│   ├── useProgress.ts                # Progress tracking
│   ├── useAccessibility.ts           # Accessibility settings
│   ├── useAchievements.ts            # Achievement tracking
│   ├── useGameProgress.ts            # Game-specific progress persistence
│   └── index.ts                      # Hook exports
├── utils/                         # Utility functions
│   ├── storage.ts                    # localStorage helpers
│   ├── scoring.ts                    # Scoring algorithms
│   └── export.ts                     # Data export utilities
├── types/                         # TypeScript type definitions
│   ├── game.types.ts                 # Game-related types
│   └── index.ts                      # Type exports
├── i18n/                          # Translation files
│   ├── is.json                       # Icelandic (primary)
│   ├── en.json                       # English
│   └── pl.json                       # Polish
├── styles/                        # Theme and animation styles
│   ├── theme.css                     # Tailwind v4 @theme tokens, spring curves, keyframes
│   ├── game-base.css                 # Microinteraction utility classes
│   └── tailwind-preset.ts            # Shared Tailwind preset
└── index.ts                       # Main exports
```

---

## 🎣 Hooks

### `useI18n()`

Provides internationalization (i18n) support with automatic translation loading and language switching.

**Features:**

- Dynamic translation loading from JSON files
- Dot notation for nested translations (`mainMenu.title`)
- Automatic localStorage persistence of language preference
- Fallback support

**Usage:**

```typescript
import { useI18n } from '@shared/hooks';

function MyComponent() {
  const { t, language, setLanguage, availableLanguages } = useI18n();

  return (
    <div>
      <h1>{t('mainMenu.title')}</h1>
      <p>{t('mainMenu.welcome', 'Welcome!')}</p>

      {/* Language selector */}
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {availableLanguages.map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
    </div>
  );
}
```

**API:**

| Method/Property      | Type                                         | Description                                 |
| -------------------- | -------------------------------------------- | ------------------------------------------- |
| `t(key, fallback?)`  | `(key: string, fallback?: string) => string` | Translate a key using dot notation          |
| `language`           | `'is' \| 'en' \| 'pl'`                       | Current language code                       |
| `setLanguage`        | `(lang: Language) => void`                   | Change language and persist to localStorage |
| `availableLanguages` | `Language[]`                                 | Array of supported languages                |

**Translation File Structure:**

```json
{
  "mainMenu": {
    "title": "Efnafræði Leikur",
    "start": "Byrja",
    "settings": "Stillingar"
  },
  "feedback": {
    "correct": "Rétt!",
    "incorrect": "Rangt"
  }
}
```

---

### `useProgress()`

Manages game progress with automatic localStorage persistence.

**Features:**

- Automatic save on every update
- Auto-update last played timestamp
- Built-in reset functionality
- Level and problem tracking

**Usage:**

```typescript
import { useProgress } from '@shared/hooks';

function MyGame() {
  const {
    progress,
    updateProgress,
    resetProgress,
    incrementProblems,
    setLevel
  } = useProgress({
    gameId: 'dimensional-analysis',
    initialProgress: {
      currentLevel: 1,
      problemsCompleted: 0
    }
  });

  const handleCorrectAnswer = () => {
    incrementProblems();
    updateProgress({
      levelProgress: {
        ...progress.levelProgress,
        [progress.currentLevel]: (progress.levelProgress[progress.currentLevel] || 0) + 1
      }
    });
  };

  return (
    <div>
      <p>Level: {progress.currentLevel}</p>
      <p>Problems completed: {progress.problemsCompleted}</p>
      <button onClick={resetProgress}>Reset Progress</button>
    </div>
  );
}
```

**API:**

| Method/Property     | Type                                       | Description                      |
| ------------------- | ------------------------------------------ | -------------------------------- |
| `progress`          | `GameProgress`                             | Current progress object          |
| `updateProgress`    | `(updates: Partial<GameProgress>) => void` | Update progress fields           |
| `resetProgress`     | `() => void`                               | Reset to initial progress        |
| `incrementProblems` | `() => void`                               | Increment problemsCompleted by 1 |
| `setLevel`          | `(level: number) => void`                  | Set current level                |

**GameProgress Type:**

```typescript
interface GameProgress {
  currentLevel: number;
  problemsCompleted: number;
  lastPlayedDate: string;
  totalTimeSpent: number;
  levelProgress: Record<number, number>;
  // Game-specific fields can be added
}
```

---

### `useAccessibility()`

Manages accessibility settings with automatic DOM manipulation and localStorage persistence.

**Features:**

- High contrast mode
- Text size adjustment (small/medium/large)
- Reduced motion support
- Keyboard shortcuts toggle
- Automatic CSS class management

**Usage:**

```typescript
import { useAccessibility } from '@shared/hooks';

function AccessibilityMenu() {
  const {
    settings,
    toggleHighContrast,
    setTextSize,
    toggleReducedMotion,
    toggleKeyboardShortcuts,
    resetSettings
  } = useAccessibility();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={toggleHighContrast}
        />
        High Contrast Mode
      </label>

      <select
        value={settings.textSize}
        onChange={(e) => setTextSize(e.target.value as 'small' | 'medium' | 'large')}
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={toggleReducedMotion}
        />
        Reduce Motion
      </label>

      <button onClick={resetSettings}>Reset to Defaults</button>
    </div>
  );
}
```

**API:**

| Method/Property           | Type                                                | Description                    |
| ------------------------- | --------------------------------------------------- | ------------------------------ |
| `settings`                | `AccessibilitySettings`                             | Current accessibility settings |
| `updateSettings`          | `(updates: Partial<AccessibilitySettings>) => void` | Update multiple settings       |
| `toggleHighContrast`      | `() => void`                                        | Toggle high contrast mode      |
| `setTextSize`             | `(size: 'small' \| 'medium' \| 'large') => void`    | Set text size                  |
| `toggleReducedMotion`     | `() => void`                                        | Toggle reduced motion          |
| `toggleKeyboardShortcuts` | `() => void`                                        | Toggle keyboard shortcuts      |
| `resetSettings`           | `() => void`                                        | Reset to default settings      |

**CSS Classes Applied:**

- `.high-contrast` - Added to `<html>` when high contrast is enabled
- `.text-small`, `.text-medium`, `.text-large` - Text size variants
- `.reduced-motion` - Added when reduced motion is enabled

---

## 🎆 Graphics & Animation Components

### `AnimatedCounter`

Rolling number counter with easeOutExpo easing. Smoothly animates between numeric values using `requestAnimationFrame`. Uses `tabular-nums` for stable digit width and a brief scale-up spring on change.

**Usage:**

```typescript
import { AnimatedCounter } from '@shared/components/AnimatedCounter';

<AnimatedCounter value={score} suffix=" stig" />
<AnimatedCounter value={delta} prefix="+" duration={300} />
```

**Props:**

| Prop           | Type                    | Default          | Description                       |
| -------------- | ----------------------- | ---------------- | --------------------------------- |
| `value`        | `number`                | required         | Target value to animate to        |
| `duration`     | `number`                | `500`            | Animation duration in ms          |
| `prefix`       | `string`                | `''`             | Text before number (e.g., "+")    |
| `suffix`       | `string`                | `''`             | Text after number (e.g., " stig") |
| `className`    | `string`                | `''`             | Additional CSS classes            |
| `formatNumber` | `(n: number) => string` | Icelandic locale | Custom formatter                  |

---

### `ScorePopup` + `useScorePopups`

Floating "+N" indicators that rise and fade. Absolutely positioned within a parent container. Green for positive, red for negative.

**Usage:**

```typescript
import { ScorePopup, useScorePopups } from '@shared/components/AnimatedCounter';

function ScoreDisplay() {
  const { popups, addPopup, removePopup } = useScorePopups();

  const handleCorrectAnswer = (e: React.MouseEvent) => {
    addPopup(10, { x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative">
      {popups.map((popup) => (
        <ScorePopup
          key={popup.id}
          points={popup.points}
          position={popup.position}
          onComplete={() => removePopup(popup.id)}
        />
      ))}
    </div>
  );
}
```

**Hook API (`useScorePopups`):** `addPopup(points, position)`, `removePopup(id)`, `popups[]`. Max 5 concurrent (oldest evicted).

---

### `StreakCounter`

Escalating fire emoji streak badge. Hidden when streak < 3. Shows progressively more intense fire emojis with a pulse glow at 10+.

**Emoji progression:**

- 0-2: hidden
- 3-4: fire + count
- 5-9: fire fire + count
- 10+: boom fire fire + count (with glow)

**Usage:**

```typescript
import { StreakCounter } from '@shared/components/AnimatedCounter';

<StreakCounter count={currentStreak} />
```

**Props:** `count: number`, `className?: string`

---

## 🛠️ Utilities

### Storage (`storage.ts`)

localStorage helpers for game progress management.

**Functions:**

```typescript
// Save game progress
saveProgress(gameId: string, progress: GameProgress): void

// Load game progress
loadProgress(gameId: string): GameProgress | null

// Clear specific game progress
clearProgress(gameId: string): void

// Get all saved game IDs
getAllProgressKeys(): string[]

// Clear all game progress
clearAllProgress(): void

// Export all progress as object
exportAllProgress(): Record<string, GameProgress>
```

**Example:**

```typescript
import { saveProgress, loadProgress } from '@shared/utils/storage';

// Manual save (normally automatic with useProgress hook)
saveProgress('molmassi', {
  currentLevel: 3,
  problemsCompleted: 42,
  lastPlayedDate: new Date().toISOString(),
  totalTimeSpent: 1800,
  levelProgress: { 1: 10, 2: 15, 3: 17 },
});

// Load progress
const progress = loadProgress('molmassi');
```

---

### Scoring (`scoring.ts`)

Scoring algorithms and validation utilities.

**Functions:**

```typescript
// Calculate composite score from components
calculateCompositeScore(
  answerScore: number,
  methodScore: number,
  explanationScore: number,
  efficiencyScore: number,
  config?: ScoringConfig
): number

// Check if score passes threshold
isPassing(score: number, config?: ScoringConfig): boolean

// Calculate average from array
calculateAverage(scores: number[]): number

// Count significant figures
countSignificantFigures(numStr: string): number

// Validate significant figures
validateSignificantFigures(
  answer: string,
  expected: number,
  tolerance?: number
): boolean

// Calculate efficiency score
calculateEfficiencyScore(stepsTaken: number, optimalSteps: number): number

// Score text explanation
scoreExplanation(
  explanationText: string,
  qualityKeywords: string[],
  typeSpecificKeywords: string[],
  minLength?: number
): number
```

**Example:**

```typescript
import {
  calculateCompositeScore,
  countSignificantFigures,
  validateSignificantFigures,
} from '@shared/utils/scoring';

// Calculate composite score
const finalScore = calculateCompositeScore(
  1.0, // answer correct
  0.8, // good method
  0.6, // decent explanation
  0.9 // efficient solution
);
// Result: 0.83 (weighted average)

// Validate significant figures
const isValid = validateSignificantFigures('1.23', 3, 0);
// Result: true (3 sig figs)

const count = countSignificantFigures('0.00123');
// Result: 3
```

---

### Export (`export.ts`)

Data export utilities for progress tracking and reporting.

**Functions:**

```typescript
// Export progress as JSON file
exportProgressAsJSON(
  gameId: string,
  gameName: string,
  gameVersion: string,
  progress: GameProgress,
  summary: Record<string, any>
): void

// Export progress as CSV file
exportProgressAsCSV(
  gameId: string,
  rows: Array<Record<string, string | number>>
): void

// Format time in seconds to readable string
formatTimeSpent(seconds: number): string

// Calculate percentage
calculatePercentage(correct: number, total: number): number
```

**Example:**

```typescript
import { exportProgressAsJSON, formatTimeSpent } from '@shared/utils/export';

// Export progress as JSON
exportProgressAsJSON('molmassi', 'Mólmassi Leikur', '1.0.0', progress, {
  correctAnswers: 42,
  accuracy: 0.85,
  averageTime: formatTimeSpent(1800),
});
// Downloads: molmassi-progress-2025-11-29.json

// Format time
formatTimeSpent(3665);
// Result: "1h 1m"

formatTimeSpent(125);
// Result: "2m 5s"
```

---

## 📝 Types

### Core Types

```typescript
// Game progress tracking
interface GameProgress {
  currentLevel: number;
  problemsCompleted: number;
  lastPlayedDate: string;
  totalTimeSpent: number;
  levelProgress: Record<number, number>;
}

// Accessibility settings
interface AccessibilitySettings {
  highContrast: boolean;
  textSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  keyboardShortcutsEnabled: boolean;
}

// Scoring configuration
interface ScoringConfig {
  answerWeight: number;
  methodWeight: number;
  explanationWeight: number;
  efficiencyWeight: number;
  passingThreshold: number;
}

// Export data format
interface ExportData {
  exportTimestamp: string;
  gameName: string;
  gameVersion: string;
  studentProgress: GameProgress;
  summary: Record<string, any>;
}
```

---

## 🌍 Internationalization

### Supported Languages

| Code | Language             | Status                |
| ---- | -------------------- | --------------------- |
| `is` | Íslenska (Icelandic) | ✅ Complete (Primary) |
| `en` | English              | ✅ Complete           |
| `pl` | Polski (Polish)      | 🚧 In Progress        |

### Adding a New Language

1. **Create translation file:**

```bash
# Create new translation file
cp shared/i18n/en.json shared/i18n/de.json
```

2. **Translate all strings** in `de.json`

3. **Update type definition** in `useI18n.ts`:

```typescript
type Language = 'is' | 'en' | 'pl' | 'de';
```

4. **Add to available languages:**

```typescript
availableLanguages: ['is', 'en', 'pl', 'de'] as Language[];
```

All games will automatically support the new language!

---

## 🎨 Theme

The theme provides Kvennaskólinn brand colors and design tokens.

**Usage:**

```typescript
import { theme } from '@shared/styles/theme';

// Use in styled components or inline styles
const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text.light};
`;
```

**Theme Structure:**

```typescript
export const theme = {
  colors: {
    primary: '#f36b22', // Kvenno orange
    secondary: '#2c3e50',
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    text: {
      dark: '#2c3e50',
      light: '#ffffff',
      muted: '#7f8c8d',
    },
    background: {
      light: '#ffffff',
      gray: '#f8f9fa',
      dark: '#2c3e50',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
  },
};
```

---

## 🚀 Usage in New Games

### Step 1: Import from Shared Library

```typescript
// src/App.tsx
import { useI18n, useProgress, useAccessibility } from '@shared/hooks';
import { exportProgressAsJSON } from '@shared/utils/export';
import type { GameProgress } from '@shared/types';
```

### Step 2: Use Hooks in Component

```typescript
function App() {
  const { t } = useI18n();
  const { progress, incrementProblems } = useProgress({
    gameId: 'my-game'
  });
  const { settings } = useAccessibility();

  return (
    <div>
      <h1>{t('game.title')}</h1>
      {/* Your game content */}
    </div>
  );
}
```

### Step 3: Add Translations

```json
// shared/i18n/is.json
{
  "myGame": {
    "title": "Mitt Leikur",
    "start": "Byrja",
    "instructions": "Leiðbeiningar"
  }
}
```

---

## 📖 Best Practices

### 1. Always Use Hooks for State Management

✅ **Good:**

```typescript
const { progress } = useProgress({ gameId: 'molmassi' });
```

❌ **Bad:**

```typescript
const progress = JSON.parse(localStorage.getItem('progress'));
```

### 2. Use Translation Keys, Not Hard-coded Text

✅ **Good:**

```typescript
<button>{t('common.submit')}</button>
```

❌ **Bad:**

```typescript
<button>Staðfesta</button>
```

### 3. Leverage Utility Functions

✅ **Good:**

```typescript
const isValid = validateSignificantFigures(answer, 3);
```

❌ **Bad:**

```typescript
const countSigFigs = (num) => {
  /* reimplementing the wheel */
};
```

### 4. Export Types for Type Safety

✅ **Good:**

```typescript
import type { GameProgress } from '@shared/types';
const progress: GameProgress = {/* ... */};
```

---

## 🧪 Testing

When testing games that use the shared library, mock the hooks:

```typescript
// __tests__/MyGame.test.tsx
import { vi } from 'vitest';

vi.mock('@shared/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'is',
    setLanguage: vi.fn(),
    availableLanguages: ['is', 'en', 'pl'],
  }),
  useProgress: () => ({
    progress: { currentLevel: 1, problemsCompleted: 0 },
    updateProgress: vi.fn(),
    resetProgress: vi.fn(),
  }),
}));
```

---

## 📦 Package Configuration

The shared library is configured as a workspace package in the monorepo:

```json
// package.json
{
  "name": "@chemistry-games/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./index.ts",
  "exports": {
    ".": "./index.ts",
    "./hooks": "./hooks/index.ts",
    "./utils": "./utils/index.ts",
    "./types": "./types/index.ts",
    "./styles": "./styles/theme.ts"
  }
}
```

**Import Aliases:**

All games use the `@shared` alias configured in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

---

## 🔄 Version History

| Version | Date       | Changes                                                                                                                                                                                             |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1.0   | 2026-08-15 | Removed unused gamification chrome: ParticleCelebration, useParticleCelebration, AnimatedBackground, SoundToggle, useGameSounds. Zero importers after the April 2026 game restructure.              |
| 2.0.0   | 2026-02-20 | Graphics & animation system: ParticleCelebration, AnimatedBackground, AnimatedCounter, ScorePopup, StreakCounter, SoundToggle, useGameSounds, useParticleCelebration. Integrated into all 17 games. |
| 1.0.0   | 2025-11-29 | Initial shared library with all 12 games migrated                                                                                                                                                   |

---

## 🤝 Contributing

When adding new shared functionality:

1. **Add to appropriate directory** (`hooks/`, `utils/`, `types/`)
2. **Export from index files** for easy importing
3. **Add JSDoc comments** for all public APIs
4. **Update this README** with usage examples
5. **Add TypeScript types** for all parameters and returns
6. **Consider backwards compatibility** (all games use this library!)

---

## 📞 Support

For questions about the shared library:

- Check this README first
- Look at existing game implementations for examples
- Review TypeScript types for API details
- See `tools/game-template/` for reference implementation

---

**Built for kvenno.app — Námsvefur Kvennó**

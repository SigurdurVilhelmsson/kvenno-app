# Kvennaskólinn Chemistry Game Template

This template provides a starting point for creating new chemistry educational games in the Kvennaskólinn repository.

## Features

- ✅ **Shared Component Library**: Pre-configured to use @kvenno/shared hooks and utilities
- ✅ **TypeScript**: Full type safety out of the box
- ✅ **Vite + React**: Modern, fast development experience
- ✅ **Tailwind CSS**: Utility-first styling with Kvennaskólinn branding
- ✅ **i18n Support**: Multi-language ready (Icelandic, English, Polish)
- ✅ **Accessibility**: High contrast mode, text sizing, keyboard navigation
- ✅ **Single-file Build**: Compiles to a single HTML file for easy deployment
- ✅ **Progress Tracking**: Automatic localStorage persistence

## Quick Start

### Using the Setup Script

```bash
cd /home/user/ChemistryGames/tools
./create-game.sh <year> <game-name> "<Game Title>" "<Description>"
```

**Example:**
```bash
./create-game.sh 1-ar molmassi "Mólmassi Leikur" "Læra um mólmassa efna"
```

### Manual Setup

1. **Copy the template**:
   ```bash
   cp -r tools/game-template games/<year>/<game-name>
   ```

2. **Replace placeholders** in the following files:
   - `package.json`: GAME_NAME, GAME_DESCRIPTION, OUTPUT_DIR, OUTPUT_FILENAME
   - `vite.config.ts`: SHARED_PATH, OUTPUT_DIR, OUTPUT_FILENAME
   - `tsconfig.json`: TSCONFIG_BASE_PATH, SHARED_INCLUDE_PATH
   - `index.html`: GAME_TITLE, GAME_DESCRIPTION
   - `src/App.tsx`: GAME_NAME, GAME_ID, GAME_TITLE, GAME_SUBTITLE, GAME_DESCRIPTION

3. **Install dependencies**:
   ```bash
   cd games/<year>/<game-name>
   pnpm install
   ```

4. **Start development**:
   ```bash
   pnpm dev
   ```

## Template Structure

```
game-template/
├── src/
│   ├── components/      # Game-specific React components
│   ├── data/            # Game data (questions, problems, levels, etc.)
│   ├── hooks/           # Custom hooks specific to this game
│   ├── utils/           # Game-specific utility functions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── styles.css       # Game styles (Tailwind + custom CSS)
├── public/              # Static assets (images, audio, etc.)
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tsconfig.node.json   # TypeScript config for Node
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Customization Guide

### 1. Define Game Data

Create TypeScript files in `src/data/`:

```typescript
// src/data/questions.ts
export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correct: number;
}

export const questions: Question[] = [
  {
    id: 'Q1',
    prompt: 'Hvað er mólmassi CO₂?',
    options: ['28 g/mol', '44 g/mol', '32 g/mol'],
    correct: 1
  }
];
```

### 2. Create Game Components

Create React components in `src/components/`:

```typescript
// src/components/GameBoard.tsx
export function GameBoard({ question, onAnswer }: GameBoardProps) {
  return (
    <div className="game-board">
      <h3>{question.prompt}</h3>
      {/* Game UI */}
    </div>
  );
}
```

### 3. Implement Game Logic

Update `src/App.tsx` to:
- Import your game data
- Manage game state (current question, score, etc.)
- Handle user interactions
- Track progress using `useProgress` hook

### 4. Add Custom Styles

Extend `src/styles.css` with game-specific styles:

```css
/* Game-specific animations */
.molecule-bounce {
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

## Available Shared Resources

### Hooks
- `useI18n()` - Internationalization
- `useProgress()` - Progress tracking
- `useAccessibility()` - Accessibility settings

### Utilities
- `saveProgress()` / `loadProgress()` - Progress persistence
- `exportProgressAsJSON()` - Teacher data export
- `calculateCompositeScore()` - Scoring algorithms
- `countSignificantFigures()` - Sig fig validation

### Types
- `GameProgress` - Progress state type
- `AccessibilitySettings` - A11y settings type
- Level-specific types (Level1Progress, Level2Progress, Level3Progress)

## Build and Deploy

### Development
```bash
pnpm dev  # Start dev server at http://localhost:5173
```

### Production Build
```bash
pnpm build  # Outputs to OUTPUT_DIR/OUTPUT_FILENAME.html
```

### Type Checking
```bash
pnpm type-check  # Run TypeScript compiler without emitting files
```

### Preview Production Build
```bash
pnpm preview  # Preview production build locally
```

## Best Practices

1. **Keep game logic separate**: Use `src/utils/` for game algorithms
2. **Type everything**: Define TypeScript interfaces for all game data
3. **Reuse shared components**: Don't reinvent common UI elements
4. **Test accessibility**: Use high contrast mode and keyboard navigation
5. **Support all languages**: Use `t()` function for all user-facing text
6. **Track meaningful progress**: Store student performance for teacher insights

## Troubleshooting

### Build fails with module errors
- Check that all @shared imports use correct paths
- Run `pnpm install` from repository root first

### TypeScript errors about rootDir
- Ensure tsconfig.json includes "../../../shared/**/*" in the include array

### Game doesn't load in browser
- Check browser console for errors
- Verify all imports are correct
- Ensure data files export properly

## Need Help?

- See existing games in `/games/1-ar/dimensional-analysis/` for examples
- Check shared library docs in `/shared/README.md`
- Review the main repository README for architecture overview

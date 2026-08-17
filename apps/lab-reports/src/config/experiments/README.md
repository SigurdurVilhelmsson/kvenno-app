# Experiment Configurations

Each experiment is stored in its own file for easier maintenance and updates.

## Directory Structure

```
experiments/
├── index.ts               # Exports all experiments (two registries — see Step 3)
├── jafnvaegi.ts           # Equilibrium experiment (3rd year, full rubric)
├── hlutleysing_syru.ts    # Acid neutralisation (3rd year, full rubric)
├── orka_2ar.ts            # 2nd-year simplified checklist
├── _template.ts           # Template for new experiments
└── README.md              # This file
```

## Adding a New Experiment

### Step 1: Create the experiment file

Copy the template and rename it:

```bash
cp _template.ts surustig.ts
```

### Step 2: Edit the experiment configuration

Open your new file and update:

- **id**: Unique identifier (lowercase, no spaces, e.g., `'surustig'`)
- **title**: Full Icelandic name (e.g., `'Sýrustig og pH'`)
- **year**: Which grade level (1, 2, 3, etc.)
- **worksheet**: Materials, equipment, steps
- **sections**: Customize sections and point values

### Step 3: Register the experiment

Edit `index.ts` and add your experiment:

```typescript
import { jafnvaegi } from './jafnvaegi';
import { surustig } from './surustig'; // Add import

export const experimentConfigs: ExperimentConfigs = {
  jafnvaegi,
  hlutleysing_syru,
  surustig, // Add to config object
};
```

### Step 3b: Pick the right registry

`index.ts` holds **two** registries, and putting an experiment in the wrong one means it never appears:

- **`experimentConfigs`** (typed `ExperimentConfig`) — 3rd-year full-rubric experiments, graded section by section. `jafnvaegi.ts` and `hlutleysing_syru.ts` live here.
- **`experimentConfigs2`** (typed `ExperimentConfig2`, keyed `'orka-2ar'`) — 2nd-year simplified checklist experiments, consumed by `POST /api/analyze-2ar`. See `orka_2ar.ts`.

### Step 4: Test

Run type checking and build:

```bash
npm run type-check
npm run build
```

## Experiment Structure

### Basic Info

- `id`: Unique identifier used in URLs and storage
- `title`: Display name in Icelandic
- `year`: Grade level (number)

### Worksheet (optional but recommended)

- `reaction`: Main chemical equation
- `materials`: Array of materials/chemicals
- `equipment`: Array of lab equipment
- `steps`: Array of procedure steps (use spaces for sub-steps)

### Sections

Standard sections, as used by both shipped full-rubric experiments (`jafnvaegi.ts`, `hlutleysing_syru.ts`):

- **Tilgangur** (4 pts): Purpose/goals
- **Fræðikafli** (12 pts): Theoretical background
- **Tæki og efni** (2 pts): Equipment and materials
- **Framkvæmd** (4 pts): Procedure
- **Niðurstöður** (12 pts): Results and analysis
- **Lokaorð** (8 pts): Conclusion
- **Undirskrift** (2 pts): Signature
- **Heildarsamhengi** (6 pts): Overall coherence

Total: 50 points (adjust as needed)

**Note:** `_template.ts` still carries the retired 7-section / 30-point scheme, so copying it produces an off-rubric experiment. Match the 8-section / 50-point scheme above until the template is updated.

### Criteria

Each section needs three quality levels:

- **good**: What makes it excellent
- **needsImprovement**: What indicates it needs work (optional)
- **unsatisfactory**: What makes it fail

## Tips

1. **Point values**: Must add up to desired total (50 for both shipped full-rubric experiments)
2. **IDs**: Use consistent naming (lowercase, Icelandic without special chars)
3. **Descriptions**: Keep criteria clear and objective
4. **Special notes**: Use `specialNote` for important grading guidance
5. **Test**: Always run `npm run type-check` after changes

## Example

See `jafnvaegi.ts` for a complete working example of a chemical equilibrium experiment.

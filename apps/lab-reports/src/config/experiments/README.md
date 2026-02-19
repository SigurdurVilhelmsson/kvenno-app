# Experiment Configurations

Each experiment is stored in its own file for easier maintenance and updates.

## Directory Structure

```
experiments/
├── index.ts           # Exports all experiments
├── jafnvaegi.ts      # Equilibrium experiment
├── _template.ts      # Template for new experiments
└── README.md         # This file
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
import { surustig } from './surustig';  // Add import

export const experimentConfigs: ExperimentConfigs = {
  jafnvaegi,
  surustig,  // Add to config object
};
```

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
Standard sections (customize point values as needed):
- **Tilgangur** (3 pts): Purpose/goals
- **Fræðikafli** (7.5 pts): Theoretical background
- **Tæki og efni** (1.5 pts): Equipment and materials
- **Framkvæmd** (3 pts): Procedure
- **Niðurstöður** (7.5 pts): Results and analysis
- **Lokaorð** (6 pts): Conclusion
- **Undirskrift** (1.5 pts): Signature

Total: 30 points (adjust as needed)

### Criteria
Each section needs three quality levels:
- **good**: What makes it excellent
- **needsImprovement**: What indicates it needs work (optional)
- **unsatisfactory**: What makes it fail

## Tips

1. **Point values**: Must add up to desired total (usually 30)
2. **IDs**: Use consistent naming (lowercase, Icelandic without special chars)
3. **Descriptions**: Keep criteria clear and objective
4. **Special notes**: Use `specialNote` for important grading guidance
5. **Test**: Always run `npm run type-check` after changes

## Example

See `jafnvaegi.ts` for a complete working example of a chemical equilibrium experiment.

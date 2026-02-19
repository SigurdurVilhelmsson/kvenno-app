import { ExperimentConfigs, ExperimentConfig2 } from '@/types';
import { jafnvaegi } from './jafnvaegi';
import { hlutleysing_syru } from './hlutleysing_syru';
import { orka_2ar } from './orka_2ar';

/**
 * Experiment Configurations
 *
 * Each experiment is defined in its own file for easier maintenance.
 * To add a new experiment:
 * 1. Create a new file: experiments/[experiment-id].ts
 * 2. Export the experiment config (see jafnvaegi.ts as example)
 * 3. Import and add it to experimentConfigs below
 */
export const experimentConfigs: ExperimentConfigs = {
  jafnvaegi,
  hlutleysing_syru,
  // Add new experiments here:
  // surustig,
  // varmagildi,
};

/**
 * 2nd Year Experiment Configurations (Simplified checklist approach)
 */
export const experimentConfigs2: Record<string, ExperimentConfig2> = {
  'orka-2ar': orka_2ar,
};

/**
 * Helper function to get all experiments as an array
 */
export const getExperiments = () => Object.values(experimentConfigs);

/**
 * Helper function to get all 2nd year experiments as an array
 */
export const getExperiments2 = () => Object.values(experimentConfigs2);

/**
 * Helper function to get a specific experiment by ID
 */
export const getExperiment = (id: string) => experimentConfigs[id];

/**
 * Helper function to get a specific 2nd year experiment by ID
 */
export const getExperiment2 = (id: string) => experimentConfigs2[id];

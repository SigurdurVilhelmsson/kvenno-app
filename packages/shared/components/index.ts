// Site-wide components
export { Header } from './Header';
export type { HeaderVariant } from './Header';
export { Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbItem } from './Breadcrumbs';
export { Footer } from './Footer';
export { BottomNav } from './BottomNav';
export type { BottomNavProps } from './BottomNav';

// Design system primitives
export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
export { Container } from './Container';
export type { ContainerProps } from './Container';
export { PageBackground } from './PageBackground';
export type { PageBackgroundProps, PageBackgroundVariant } from './PageBackground';
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';
export { SkipLink } from './SkipLink';
export type { SkipLinkProps } from './SkipLink';

export { ErrorBoundary, useErrorHandler } from './ErrorBoundary';
export { AchievementBadge } from './AchievementBadge';
export { AchievementNotificationPopup, AchievementNotificationsContainer } from './AchievementNotificationPopup';
export { AchievementsPanel, AchievementsButton } from './AchievementsPanel';

// AnimatedMolecule component - sub-components available via '@shared/components/AnimatedMolecule'
export { AnimatedMolecule, ELEMENT_VISUALS } from './AnimatedMolecule';

// HintSystem component - tiered progressive hint system
export { HintSystem, HintTier } from './HintSystem';

// InteractiveGraph component - reusable canvas-based graph
export { InteractiveGraph } from './InteractiveGraph';
export type {
  DataPoint,
  DataSeries,
  AxisConfig,
  MarkerConfig,
  RegionConfig,
  HorizontalLineConfig,
  VerticalLineConfig,
  InteractiveGraphProps
} from './InteractiveGraph';

// ParticleSimulation component - physics-based particle visualization
export {
  ParticleSimulation,
  useParticleSimulation,
  PARTICLE_TYPES,
  PHYSICS_PRESETS,
  CONTAINER_PRESETS,
  createGasSimulation,
  createGasMixture,
  createKineticsSimulation,
  createEquilibriumSimulation
} from './ParticleSimulation';
export type {
  ParticleType,
  Particle,
  ContainerConfig,
  PhysicsConfig,
  ParticleGroup,
  ReactionConfig,
  RegionHighlight as ParticleRegionHighlight,
  ParticleSimulationProps,
  SimulationControls
} from './ParticleSimulation';

// ResponsiveContainer - wrapper for responsive sizing of fixed-dimension components
export { ResponsiveContainer, useResponsiveSize } from './ResponsiveContainer';
export type { ResponsiveContainerProps } from './ResponsiveContainer';

// MoleculeViewer - standardized molecule display with dark background
export { MoleculeViewer, MoleculeViewerGrid } from './MoleculeViewer';
export type { MoleculeViewerProps, MoleculeViewerGridProps } from './MoleculeViewer';

// FeedbackPanel - detailed feedback for game answers
export { FeedbackPanel } from './FeedbackPanel';
export type {
  DetailedFeedback,
  FeedbackSeverity,
  FeedbackPanelConfig,
  FeedbackPanelProps,
} from './FeedbackPanel';

// DragDropBuilder - flexible drag-and-drop interface
export {
  DragDropBuilder,
  DraggableItem,
  DropZone,
} from './DragDropBuilder';
export type {
  DraggableItemData,
  DraggableItemProps,
  DropZoneData,
  DropZoneProps,
  DropResult,
  ZoneState,
  DragDropBuilderProps,
} from './DragDropBuilder';

// MoleculeViewer3D - 3D molecule visualization (lazy-loaded)
// NOTE: Exported from '@shared/components/MoleculeViewer3D' (not the barrel)
// to avoid pulling @react-three into every app's bundle.
// import { MoleculeViewer3DLazy } from '@shared/components/MoleculeViewer3D';

// LanguageSwitcher - language selection UI
export { LanguageSwitcher } from './LanguageSwitcher';
export type { LanguageSwitcherProps } from './LanguageSwitcher';

// SoundToggle - game sound enable/disable toggle
export { SoundToggle } from './SoundToggle';
export type { SoundToggleProps } from './SoundToggle';

// AnimatedBackground - layered animated gradient background for chemistry games
export { AnimatedBackground } from './AnimatedBackground';
export type {
  AnimatedBackgroundProps,
  AnimatedBackgroundVariant,
  AnimatedBackgroundIntensity,
} from './AnimatedBackground';
// Note: YearTheme is already exported from '../styles/theme' — import it from there.

// AnimatedCounter - animated score displays, popups, and streak indicators
export { AnimatedCounter, ScorePopup, StreakCounter, useScorePopups } from './AnimatedCounter';
export type {
  AnimatedCounterProps,
  ScorePopupProps,
  StreakCounterProps,
  PopupItem,
  UseScorePopupsReturn,
} from './AnimatedCounter';

// ParticleCelebration - canvas-based celebration effects for game feedback
export { ParticleCelebration, useParticleCelebration } from './ParticleCelebration';
export type {
  CelebrationPreset,
  CelebrationConfig,
  ParticleShape as CelebrationParticleShape,
  Particle as CelebrationParticle,
  ParticleCelebrationProps,
  UseParticleCelebrationReturn,
} from './ParticleCelebration';
// Note: YearTheme for celebrations is re-exported as CelebrationYearTheme
// to avoid conflict with the YearTheme from '../styles/theme'.
export type { YearTheme as CelebrationYearTheme } from './ParticleCelebration';

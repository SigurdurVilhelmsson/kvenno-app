// Site-wide components
export { Header } from './Header';
export { Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbItem } from './Breadcrumbs';
export { Footer } from './Footer';

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
export { MoleculeViewer3D, MoleculeViewer3DLazy, MoleculeViewer3DDirect } from './MoleculeViewer3D';
export type {
  MoleculeViewer3DProps,
  MoleculeViewer3DStyle,
  CameraPreset,
} from './MoleculeViewer3D';

// LanguageSwitcher - language selection UI
export { LanguageSwitcher } from './LanguageSwitcher';
export type { LanguageSwitcherProps } from './LanguageSwitcher';

/**
 * InteractiveGraph Type Definitions
 * Generic canvas-based graph component for chemistry visualizations
 */

export interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

export interface DataSeries {
  id: string;
  data: DataPoint[];
  color: string;
  lineWidth?: number;
  lineDash?: number[];
  showPoints?: boolean;
  pointRadius?: number;
  label?: string;
}

export interface AxisConfig {
  min: number;
  max: number;
  label: string;
  tickInterval?: number;
  tickFormat?: (value: number) => string;
}

export interface MarkerConfig {
  x: number;
  y: number;
  color: string;
  radius?: number;
  label?: string;
  icon?: '⭐' | '●' | '◆' | '▲';
  showCrosshair?: boolean;
}

export interface RegionConfig {
  yMin: number;
  yMax: number;
  xMin?: number;
  xMax?: number;
  color: string;
  label?: string;
  labelPosition?: 'left' | 'right' | 'center';
}

export interface HorizontalLineConfig {
  y: number;
  color: string;
  lineWidth?: number;
  lineDash?: number[];
  label?: string;
  labelPosition?: 'left' | 'right';
}

export interface VerticalLineConfig {
  x: number;
  color: string;
  lineWidth?: number;
  lineDash?: number[];
  label?: string;
  labelPosition?: 'top' | 'bottom';
}

export interface InteractiveGraphProps {
  // Dimensions
  width?: number;
  height?: number;

  // Data
  series: DataSeries[];

  // Axes
  xAxis: AxisConfig;
  yAxis: AxisConfig;

  // Optional decorations
  markers?: MarkerConfig[];
  regions?: RegionConfig[];
  horizontalLines?: HorizontalLineConfig[];
  verticalLines?: VerticalLineConfig[];

  // Styling
  backgroundColor?: string;
  gridColor?: string;
  axisColor?: string;
  showGrid?: boolean;

  // Interaction
  onPointHover?: (point: DataPoint | null, series: DataSeries | null) => void;
  onPointClick?: (point: DataPoint, series: DataSeries) => void;
  currentPoint?: { x: number; y: number };

  // Accessibility
  ariaLabel?: string;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

import React, { useMemo, useRef, useState, useEffect } from 'react';

import { InteractiveGraph } from '@shared/components';
import type {
  DataPoint,
  DataSeries,
  MarkerConfig,
  RegionConfig,
  HorizontalLineConfig,
} from '@shared/components';
import { formatDecimal } from '@shared/utils';

import { Titration } from '../types';
import { calculatePH } from '../utils/ph-calculations';

interface TitrationCurveProps {
  curveData: Array<{ volume: number; pH: number }>;
  currentVolume: number;
  currentPH: number;
  titration: Titration | null;
  showEquivalencePoints?: boolean;
  markedVolume?: number | null;
  /** The marked point's label. */
  markedLabel?: string;
  /** Maximum width (px). The curve shrinks to fit narrower containers. */
  width?: number;
  height?: number;
}

/**
 * Titration Curve - pH vs Volume plot using InteractiveGraph
 */
export const TitrationCurve: React.FC<TitrationCurveProps> = ({
  curveData,
  currentVolume,
  currentPH,
  titration,
  showEquivalencePoints = false,
  markedVolume = null,
  markedLabel = 'Þitt val',
  width: maxWidth = 600,
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(maxWidth);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth;
      if (available > 0) setRenderWidth(Math.min(maxWidth, available));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth]);

  const MIN_ASPECT_HEIGHT = 240;
  const renderHeight = Math.max(MIN_ASPECT_HEIGHT, Math.round((renderWidth / maxWidth) * height));
  const graphData = useMemo(() => {
    // Convert curve data to DataPoints
    const dataPoints: DataPoint[] = curveData.map((pt) => ({
      x: pt.volume,
      y: pt.pH,
    }));

    const series: DataSeries[] = [
      {
        id: 'titration-curve',
        data: dataPoints,
        color: '#3b82f6',
        lineWidth: 3,
      },
    ];

    // Buffer regions and pKa lines
    const regions: RegionConfig[] = [];
    const horizontalLines: HorizontalLineConfig[] = [];

    if (titration) {
      // Both one-weak-partner titrations have a buffer: HA/A⁻ for a weak acid,
      // NH₄⁺/NH₃ for ammonia, centred on the weak partner's pKₐ. Only the weak
      // acid's was drawn.
      if ((titration.type === 'weak-strong' || titration.type === 'strong-weak') && titration.pKa) {
        const pKa = titration.pKa;
        regions.push({
          yMin: pKa - 1,
          yMax: pKa + 1,
          color: 'rgba(251, 191, 36, 0.15)',
          label: 'Stuðpúðasvæði',
        });
        horizontalLines.push({
          y: pKa,
          color: '#f59e0b',
          lineDash: [5, 5],
          label: `pKₐ = ${formatDecimal(pKa, 2)}`,
          labelPosition: 'right',
        });
      }
    }

    // Markers
    const markers: MarkerConfig[] = [];

    // Equivalence point marker
    if (showEquivalencePoints && titration && titration.equivalenceVolume) {
      // Derived, not the stored equivalencePH: the star has to sit on the
      // curve drawn beside it (HF's stored 8.08 was 0.11 above it).
      markers.push({
        x: titration.equivalenceVolume,
        y: calculatePH(titration, titration.equivalenceVolume),
        color: '#22c55e',
        icon: '⭐',
        radius: 8,
        label: 'Jafngildispunktur',
      });
    }

    // Student's marked equivalence point
    if (markedVolume != null) {
      // At the marked volume itself, not the nearest point of the drawn curve,
      // which is sampled every 0,5 mL: the diamond moved in half-millilitre
      // jumps while the slider moved by 0,1.
      markers.push({
        x: markedVolume,
        y: titration ? calculatePH(titration, markedVolume) : 7,
        color: '#f36b22',
        icon: '◆',
        radius: 10,
        label: markedLabel,
      });
    }

    // Current point (shown via InteractiveGraph's currentPoint prop)
    const currentPoint: DataPoint | undefined =
      currentVolume > 0 ? { x: currentVolume, y: currentPH } : undefined;

    return { series, regions, horizontalLines, markers, currentPoint };
  }, [
    curveData,
    currentVolume,
    currentPH,
    titration,
    showEquivalencePoints,
    markedVolume,
    markedLabel,
  ]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth }}>
      <InteractiveGraph
        width={renderWidth}
        height={renderHeight}
        series={graphData.series}
        xAxis={{ min: 0, max: 60, label: 'Rúmmál bætt við (mL)', tickInterval: 10 }}
        yAxis={{ min: 0, max: 14, label: 'pH', tickInterval: 2 }}
        regions={graphData.regions}
        horizontalLines={graphData.horizontalLines}
        markers={graphData.markers}
        currentPoint={graphData.currentPoint}
        ariaLabel="Títrunarferill – pH sem fall af rúmmáli"
      />
    </div>
  );
};

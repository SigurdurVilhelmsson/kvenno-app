import React, { useMemo } from 'react';
import { InteractiveGraph } from '@shared/components';
import type { DataPoint, DataSeries, MarkerConfig, RegionConfig, HorizontalLineConfig } from '@shared/components';
import { Titration } from '../types';

interface TitrationCurveProps {
  curveData: Array<{ volume: number; pH: number }>;
  currentVolume: number;
  currentPH: number;
  titration: Titration | null;
  showEquivalencePoints?: boolean;
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
  width = 600,
  height = 400
}) => {
  const graphData = useMemo(() => {
    // Convert curve data to DataPoints
    const dataPoints: DataPoint[] = curveData.map(pt => ({
      x: pt.volume,
      y: pt.pH
    }));

    const series: DataSeries[] = [{
      id: 'titration-curve',
      data: dataPoints,
      color: '#3b82f6',
      lineWidth: 3
    }];

    // Buffer regions and pKa lines
    const regions: RegionConfig[] = [];
    const horizontalLines: HorizontalLineConfig[] = [];

    if (titration) {
      if (titration.type === 'weak-strong' && titration.pKa) {
        const pKa = titration.pKa;
        regions.push({
          yMin: pKa - 1,
          yMax: pKa + 1,
          color: 'rgba(251, 191, 36, 0.15)',
          label: 'Púffursvæði'
        });
        horizontalLines.push({
          y: pKa,
          color: '#f59e0b',
          lineDash: [5, 5],
          label: `pKa = ${pKa.toFixed(2)}`,
          labelPosition: 'right'
        });
      } else if (titration.type === 'polyprotic-diprotic') {
        const pKaValues = [titration.pKa1, titration.pKa2];
        const regionColors = ['rgba(251, 191, 36, 0.15)', 'rgba(147, 197, 253, 0.15)'];
        const lineColors = ['#f59e0b', '#3b82f6'];

        pKaValues.forEach((pKa, idx) => {
          regions.push({
            yMin: pKa - 1,
            yMax: pKa + 1,
            color: regionColors[idx]
          });
          horizontalLines.push({
            y: pKa,
            color: lineColors[idx],
            lineDash: [5, 5],
            label: `pKa${idx + 1} = ${pKa.toFixed(2)}`,
            labelPosition: 'right'
          });
        });
      } else if (titration.type === 'polyprotic-triprotic') {
        const pKaValues = [titration.pKa1, titration.pKa2, titration.pKa3!];
        const regionColors = [
          'rgba(251, 191, 36, 0.15)',
          'rgba(147, 197, 253, 0.15)',
          'rgba(134, 239, 172, 0.15)'
        ];
        const lineColors = ['#f59e0b', '#3b82f6', '#22c55e'];

        pKaValues.forEach((pKa, idx) => {
          regions.push({
            yMin: pKa - 1,
            yMax: pKa + 1,
            color: regionColors[idx]
          });
          horizontalLines.push({
            y: pKa,
            color: lineColors[idx],
            lineDash: [5, 5],
            label: `pKa${idx + 1} = ${pKa.toFixed(2)}`,
            labelPosition: 'right'
          });
        });
      }
    }

    // Markers
    const markers: MarkerConfig[] = [];

    // Equivalence point markers
    if (showEquivalencePoints && titration) {
      if ('equivalenceVolume' in titration && titration.equivalenceVolume) {
        markers.push({
          x: titration.equivalenceVolume,
          y: titration.equivalencePH,
          color: '#22c55e',
          icon: '⭐',
          radius: 8,
          label: 'Jafngildispunktur'
        });
      } else if ('equivalenceVolumes' in titration && titration.equivalenceVolumes) {
        const colors = ['#22c55e', '#3b82f6', '#f59e0b'];
        titration.equivalenceVolumes.forEach((eqVol, idx) => {
          markers.push({
            x: eqVol,
            y: titration.equivalencePHs[idx],
            color: colors[idx] || '#22c55e',
            icon: '⭐',
            radius: 8,
            label: `EP${idx + 1}`
          });
        });
      }
    }

    // Current point (shown via InteractiveGraph's currentPoint prop)
    const currentPoint: DataPoint | undefined = currentVolume > 0
      ? { x: currentVolume, y: currentPH }
      : undefined;

    return { series, regions, horizontalLines, markers, currentPoint };
  }, [curveData, currentVolume, currentPH, titration, showEquivalencePoints]);

  return (
    <InteractiveGraph
      width={width}
      height={height}
      series={graphData.series}
      xAxis={{ min: 0, max: 60, label: 'Rúmmál bætt við (mL)', tickInterval: 10 }}
      yAxis={{ min: 0, max: 14, label: 'pH', tickInterval: 2 }}
      regions={graphData.regions}
      horizontalLines={graphData.horizontalLines}
      markers={graphData.markers}
      currentPoint={graphData.currentPoint}
      ariaLabel="Títrunarkúrfa - pH vs rúmmál"
    />
  );
};

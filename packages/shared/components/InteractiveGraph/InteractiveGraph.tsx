import React, { useRef, useEffect, useCallback, useState } from 'react';
import type {
  InteractiveGraphProps,
  DataPoint,
  DataSeries,
  Margin
} from './types';

const DEFAULT_MARGIN: Margin = { top: 30, right: 30, bottom: 50, left: 60 };

/**
 * InteractiveGraph - A reusable canvas-based graph component
 *
 * Features:
 * - Multiple data series with configurable styling
 * - Configurable axes with labels and tick marks
 * - Optional grid, regions, markers, and reference lines
 * - Hover interaction with point detection
 * - Current point highlighting
 * - Accessible with ARIA labels
 *
 * Usage:
 * ```tsx
 * <InteractiveGraph
 *   series={[{ id: 'main', data: points, color: '#3b82f6' }]}
 *   xAxis={{ min: 0, max: 100, label: 'Rúmmál (mL)' }}
 *   yAxis={{ min: 0, max: 14, label: 'pH' }}
 *   markers={[{ x: 25, y: 7, color: '#22c55e', icon: '⭐' }]}
 * />
 * ```
 */
export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  width = 600,
  height = 400,
  series,
  xAxis,
  yAxis,
  markers = [],
  regions = [],
  horizontalLines = [],
  verticalLines = [],
  backgroundColor = '#f9fafb',
  gridColor = '#e5e7eb',
  axisColor = '#374151',
  showGrid = true,
  onPointHover,
  onPointClick,
  currentPoint,
  ariaLabel = 'Graf'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: DataPoint;
    series: DataSeries;
    screenX: number;
    screenY: number;
  } | null>(null);

  const margin = DEFAULT_MARGIN;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Convert data coordinates to screen coordinates
  const toScreenX = useCallback(
    (x: number) => {
      return margin.left + ((x - xAxis.min) / (xAxis.max - xAxis.min)) * plotWidth;
    },
    [margin.left, plotWidth, xAxis.min, xAxis.max]
  );

  const toScreenY = useCallback(
    (y: number) => {
      return height - margin.bottom - ((y - yAxis.min) / (yAxis.max - yAxis.min)) * plotHeight;
    },
    [height, margin.bottom, plotHeight, yAxis.min, yAxis.max]
  );

  // Find nearest point to cursor
  const findNearestPoint = useCallback(
    (mouseX: number, mouseY: number): { point: DataPoint; series: DataSeries } | null => {
      let nearestPoint: DataPoint | null = null;
      let nearestSeries: DataSeries | null = null;
      let nearestDistance = Infinity;
      const maxDistance = 20; // pixels

      series.forEach((s) => {
        s.data.forEach((point) => {
          const screenX = toScreenX(point.x);
          const screenY = toScreenY(point.y);
          const distance = Math.sqrt(
            Math.pow(mouseX - screenX, 2) + Math.pow(mouseY - screenY, 2)
          );

          if (distance < maxDistance && distance < nearestDistance) {
            nearestPoint = point;
            nearestSeries = s;
            nearestDistance = distance;
          }
        });
      });

      return nearestPoint && nearestSeries ? { point: nearestPoint, series: nearestSeries } : null;
    },
    [series, toScreenX, toScreenY]
  );

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw regions (background shading)
    regions.forEach((region) => {
      const xStart = region.xMin !== undefined ? toScreenX(region.xMin) : margin.left;
      const xEnd = region.xMax !== undefined ? toScreenX(region.xMax) : width - margin.right;
      const yTop = toScreenY(region.yMax);
      const yBottom = toScreenY(region.yMin);

      ctx.fillStyle = region.color;
      ctx.fillRect(xStart, yTop, xEnd - xStart, yBottom - yTop);

      // Region label
      if (region.label) {
        ctx.fillStyle = region.color.replace(/[\d.]+\)$/, '1)'); // Make label opaque
        ctx.font = 'bold 11px sans-serif';
        const labelX =
          region.labelPosition === 'left'
            ? xStart + 5
            : region.labelPosition === 'right'
            ? xEnd - ctx.measureText(region.label).width - 5
            : (xStart + xEnd) / 2 - ctx.measureText(region.label).width / 2;
        ctx.fillText(region.label, labelX, (yTop + yBottom) / 2);
      }
    });

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Vertical grid lines
      const xTickInterval = xAxis.tickInterval || (xAxis.max - xAxis.min) / 10;
      for (let x = xAxis.min; x <= xAxis.max; x += xTickInterval) {
        const screenX = toScreenX(x);
        ctx.beginPath();
        ctx.moveTo(screenX, margin.top);
        ctx.lineTo(screenX, height - margin.bottom);
        ctx.stroke();
      }

      // Horizontal grid lines
      const yTickInterval = yAxis.tickInterval || (yAxis.max - yAxis.min) / 10;
      for (let y = yAxis.min; y <= yAxis.max; y += yTickInterval) {
        const screenY = toScreenY(y);
        ctx.beginPath();
        ctx.moveTo(margin.left, screenY);
        ctx.lineTo(width - margin.right, screenY);
        ctx.stroke();
      }
    }

    // Draw horizontal reference lines
    horizontalLines.forEach((line) => {
      const screenY = toScreenY(line.y);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.lineWidth || 2;
      if (line.lineDash) {
        ctx.setLineDash(line.lineDash);
      }

      ctx.beginPath();
      ctx.moveTo(margin.left, screenY);
      ctx.lineTo(width - margin.right, screenY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      if (line.label) {
        ctx.fillStyle = line.color;
        ctx.font = 'bold 11px sans-serif';
        const labelX = line.labelPosition === 'left' ? margin.left + 5 : width - margin.right - ctx.measureText(line.label).width - 5;
        ctx.fillText(line.label, labelX, screenY - 5);
      }
    });

    // Draw vertical reference lines
    verticalLines.forEach((line) => {
      const screenX = toScreenX(line.x);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.lineWidth || 2;
      if (line.lineDash) {
        ctx.setLineDash(line.lineDash);
      }

      ctx.beginPath();
      ctx.moveTo(screenX, margin.top);
      ctx.lineTo(screenX, height - margin.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      if (line.label) {
        ctx.fillStyle = line.color;
        ctx.font = 'bold 11px sans-serif';
        const labelY = line.labelPosition === 'top' ? margin.top + 15 : height - margin.bottom - 5;
        ctx.fillText(line.label, screenX - ctx.measureText(line.label).width / 2, labelY);
      }
    });

    // Draw axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Y-axis
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    // X-axis
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = axisColor;
    ctx.font = 'bold 14px sans-serif';

    // X-axis label
    ctx.fillText(
      xAxis.label,
      width / 2 - ctx.measureText(xAxis.label).width / 2,
      height - 10
    );

    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxis.label, -ctx.measureText(yAxis.label).width / 2, 0);
    ctx.restore();

    // Draw tick labels
    ctx.font = '12px sans-serif';
    const xTickInterval = xAxis.tickInterval || (xAxis.max - xAxis.min) / 10;
    const xFormat = xAxis.tickFormat || ((v) => v.toString());
    for (let x = xAxis.min; x <= xAxis.max; x += xTickInterval) {
      const screenX = toScreenX(x);
      const label = xFormat(x);
      ctx.fillText(label, screenX - ctx.measureText(label).width / 2, height - margin.bottom + 20);
    }

    const yTickInterval = yAxis.tickInterval || (yAxis.max - yAxis.min) / 10;
    const yFormat = yAxis.tickFormat || ((v) => v.toString());
    for (let y = yAxis.min; y <= yAxis.max; y += yTickInterval) {
      const screenY = toScreenY(y);
      const label = yFormat(y);
      ctx.fillText(label, margin.left - ctx.measureText(label).width - 8, screenY + 4);
    }

    // Draw data series
    series.forEach((s) => {
      if (s.data.length < 2) return;

      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.lineWidth || 3;
      if (s.lineDash) {
        ctx.setLineDash(s.lineDash);
      }

      ctx.beginPath();
      s.data.forEach((point, index) => {
        const screenX = toScreenX(point.x);
        const screenY = toScreenY(point.y);

        if (index === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw points if enabled
      if (s.showPoints) {
        s.data.forEach((point) => {
          const screenX = toScreenX(point.x);
          const screenY = toScreenY(point.y);

          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, s.pointRadius || 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });

    // Draw markers
    markers.forEach((marker) => {
      const screenX = toScreenX(marker.x);
      const screenY = toScreenY(marker.y);
      const radius = marker.radius || 6;

      // Crosshair
      if (marker.showCrosshair) {
        ctx.strokeStyle = marker.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(screenX, margin.top);
        ctx.lineTo(screenX, height - margin.bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(margin.left, screenY);
        ctx.lineTo(width - margin.right, screenY);
        ctx.stroke();

        ctx.setLineDash([]);
      }

      // Marker point or icon
      if (marker.icon) {
        ctx.fillStyle = marker.color;
        ctx.font = `bold ${radius * 3}px sans-serif`;
        ctx.fillText(marker.icon, screenX - radius, screenY + radius / 2);
      } else {
        ctx.fillStyle = marker.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      if (marker.label) {
        ctx.fillStyle = marker.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(marker.label, screenX + radius + 5, screenY + 4);
      }
    });

    // Draw current point
    if (currentPoint) {
      const screenX = toScreenX(currentPoint.x);
      const screenY = toScreenY(currentPoint.y);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw hovered point tooltip
    if (hoveredPoint) {
      const { screenX, screenY, point, series: hoveredSeries } = hoveredPoint;

      // Highlight circle
      ctx.fillStyle = hoveredSeries.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Tooltip
      const tooltipText = point.label || `(${point.x.toFixed(1)}, ${point.y.toFixed(2)})`;
      const tooltipWidth = ctx.measureText(tooltipText).width + 16;
      const tooltipHeight = 24;
      const tooltipX = Math.min(screenX + 10, width - tooltipWidth - 10);
      const tooltipY = Math.max(screenY - tooltipHeight - 10, 10);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText(tooltipText, tooltipX + 8, tooltipY + 16);
    }
  }, [
    width,
    height,
    series,
    xAxis,
    yAxis,
    markers,
    regions,
    horizontalLines,
    verticalLines,
    backgroundColor,
    gridColor,
    axisColor,
    showGrid,
    currentPoint,
    hoveredPoint,
    toScreenX,
    toScreenY,
    margin
  ]);

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const nearest = findNearestPoint(mouseX, mouseY);
      if (nearest) {
        setHoveredPoint({
          point: nearest.point,
          series: nearest.series,
          screenX: toScreenX(nearest.point.x),
          screenY: toScreenY(nearest.point.y)
        });
        onPointHover?.(nearest.point, nearest.series);
      } else {
        setHoveredPoint(null);
        onPointHover?.(null, null);
      }
    },
    [findNearestPoint, toScreenX, toScreenY, onPointHover]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
    onPointHover?.(null, null);
  }, [onPointHover]);

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !onPointClick) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const nearest = findNearestPoint(mouseX, mouseY);
      if (nearest) {
        onPointClick(nearest.point, nearest.series);
      }
    },
    [findNearestPoint, onPointClick]
  );

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-300 rounded-lg shadow-md bg-white cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="img"
        aria-label={ariaLabel}
      />
      {/* Legend */}
      {series.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-3">
          {series
            .filter((s) => s.label)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

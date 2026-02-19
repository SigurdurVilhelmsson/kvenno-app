import { ExportData, GameProgress } from '@shared/types';

/**
 * Export game progress data as a downloadable JSON file
 */
export const exportProgressAsJSON = (
  gameId: string,
  gameName: string,
  gameVersion: string,
  progress: GameProgress,
  summary: Record<string, any>
): void => {
  const exportData: ExportData = {
    exportTimestamp: new Date().toISOString(),
    gameName,
    gameVersion,
    studentProgress: progress,
    summary,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${gameId}-progress-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data as CSV format
 */
export const exportProgressAsCSV = (
  gameId: string,
  rows: Array<Record<string, string | number>>
): void => {
  if (rows.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => row[h]).join(',')),
  ].join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${gameId}-progress-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format time in seconds to human-readable string
 */
export const formatTimeSpent = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Calculate percentage with proper rounding
 */
export const calculatePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

import { AnalysisResult, ExperimentSection } from '@/types';

/**
 * Escape CSV cell value to handle commas, quotes, and newlines
 */
const escapeCSV = (value: string): string => {
  // Convert to string if not already
  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Export analysis results to CSV file
 */
export const exportResultsToCSV = (
  results: AnalysisResult[],
  sections: ExperimentSection[],
  filename?: string
): void => {
  try {
    // Build CSV header
    const headers = [
      'Filename',
      'Suggested Grade',
      ...sections.map((s) => `${s.name} Present`),
      ...sections.map((s) => `${s.name} Quality`),
    ];

    // Build CSV rows
    const rows = results.map((r) => [
      r.filename,
      r.suggestedGrade || 'N/A',
      ...sections.map((s) => (r.sections?.[s.id]?.present ? 'Yes' : 'No')),
      ...sections.map((s) => r.sections?.[s.id]?.quality || 'N/A'),
    ]);

    // Combine headers and rows with proper CSV escaping
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    // Create blob with BOM for proper Excel encoding
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `lab_report_grades_${new Date().toISOString().split('T')[0]}.csv`;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Villa við að búa til CSV skrá');
  }
};

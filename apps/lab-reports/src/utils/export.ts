import { Analysis2Result, AnalysisResult, ExperimentConfig2, ExperimentSection } from '@/types';

/**
 * Escape CSV cell value to handle commas, quotes, and newlines
 */
const escapeCSV = (value: string): string => {
  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Create a CSV blob with BOM (for Excel UTF-8 support) and trigger a browser download.
 */
const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export 3rd year teacher-mode analysis results to CSV file
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

    downloadCSV(csv, filename || `lab_report_grades_${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Villa við að búa til CSV skrá');
  }
};

/**
 * Export 2nd year checklist results to CSV.
 * One row per student, columns for each checklist item.
 */
export const exportChecklist2ToCSV = (
  results: Analysis2Result[],
  filenames: string[],
  experiment: ExperimentConfig2,
  outputFilename?: string
): void => {
  // Build headers: Filename, then each checklist item
  const headers: string[] = ['Skráarnafn'];
  const itemKeys: { section: string; id: string }[] = [];

  for (const [sectionKey, section] of Object.entries(experiment.checklist)) {
    for (const item of section.items) {
      headers.push(`${section.name}: ${item.label}`);
      itemKeys.push({ section: sectionKey, id: item.id });
    }
  }

  // Add baseline and summary columns
  headers.push('Drög gefin', 'Baseline niðurstaða', 'Samantekt');

  // Build rows
  const rows = results.map((result, i) => {
    const row: string[] = [filenames[i] || `Nemandi ${i + 1}`];

    // Checklist items
    for (const key of itemKeys) {
      const sectionItems = result.checklist[key.section];
      if (sectionItems) {
        const item = sectionItems.find(it => it.id === key.id);
        if (item) {
          if (item.present === true) row.push('\u2713');
          else if (item.present === false) row.push('\u2717');
          else row.push('?');
        } else {
          row.push('-');
        }
      } else {
        row.push('-');
      }
    }

    // Baseline
    row.push(result.draftProvided ? 'Já' : 'Nei');
    row.push(result.baselineComparison?.overallVerdict || '-');
    row.push(result.summaryIcelandic || '-');

    return row;
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadCSV(csv, outputFilename || `gatlistamat_${new Date().toISOString().split('T')[0]}.csv`);
};

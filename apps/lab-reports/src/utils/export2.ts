import { Analysis2Result, ExperimentConfig2 } from '@/types';

const escapeCSV = (value: string): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
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

  // BOM for Excel UTF-8 support
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outputFilename || `gatlistamat_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

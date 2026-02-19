import { ExperimentConfig } from '@/types';

// Shared JSON formatting instructions to prevent parsing failures
const JSON_FORMAT_INSTRUCTIONS = `Svaraðu EINGÖNGU með gilt JSON (valid JSON). ATHUGIÐ:
- Notaðu tvöfaldar gæsalappir (") í kringum öll strengjagildi
- EKKI nota trailing commas (kommu á eftir síðasta gildi)
- Ef texti inniheldur gæsalappir, forðastu að nota tvöfaldar gæsalappir inni í textanum (notaðu bara einfalt orðalag)
- Passa að öll svigi (curly braces) séu pöruð rétt`;

// Build per-section grading scale - shared by both teacher and student modes
const buildGradingScale = (experiment: ExperimentConfig): string => {
  return `MATSKVARÐI PER KAFLI:
${experiment.sections.map(s => {
  const criteria = s.criteria;
  return `
${s.name} (0-${s.maxPoints} stig):
- ${s.maxPoints} stig: ${criteria.good}
${criteria.needsImprovement ? `- ${(s.maxPoints || 0) * 0.6} - ${(s.maxPoints || 0) * 0.8} stig: ${criteria.needsImprovement}` : ''}
- 0-${(s.maxPoints || 0) * 0.5} stig: ${criteria.unsatisfactory}
${s.specialNote ? `ATHUGIÐ: ${s.specialNote}` : ''}`;
}).join('\n')}`;
};

// Shared core evaluation rules - used by BOTH teacher and student modes
// NOTE: This function must remain experiment-agnostic. Experiment-specific
// chemistry facts and checklists belong in ExperimentConfig.evaluationNotes.
const buildCoreEvaluationRules = (experiment: ExperimentConfig): string => {
  const totalMaxPoints = experiment.sections.reduce((sum, s) => sum + (s.maxPoints || 0), 0);

  return `🚨 ALLRA MIKILVÆGAST - LESTU ÞETTA VANDLEGA:

1. LESTU skýrsluna ORÐRÉTT. Ekki gera ráð fyrir villum. Ekki hallúcínera.
2. Ef nemandi hefur skrifað eitthvað - athugaðu NÁKVÆMLEGA hvað það er.
3. Ef nemandi HEFUR talið upp tæki og efni - segðu það og gefðu góða einkunn!
4. Ef jafna (1) ER til staðar - segðu það! Ekki segja að hún vanti!
5. ALDREI búa til athugasemdir um hluti sem ERU réttir í textanum.
6. **NOTAÐU RÉTTA STIGAFJÖLDA** - sjá matskvarða að neðan!

Ef þú ert ekki 100% viss um að eitthvað vanti - EKKI gera athugasemd við það.

🎯 HVERNIG Á AÐ GEFA EINKUNN:

Hver kafli hefur ÁKVEÐIÐ HÁMARK:
${experiment.sections.map(s => `- ${s.name}: 0-${s.maxPoints} stig`).join('\n')}

Heildareinkunn = summa allra kafla (hámark ${totalMaxPoints})

MIKILVÆGT UM TÓN OG MÁLFRÆÐI: Vertu ALLTAF jákvæð og hvetjandi. Byrjaðu á því sem er vel gert. Þegar þú bendir á villur, gefðu nemandanum nákvæm dæmi sem hjálpa honum að HUGSA rétt án þess að skrifa textann fyrir hann.

ÍSLENSKA: Passaðu að öll svör séu á réttri íslensku:
• Notaðu rétta íslensku stafi (á, é, í, ó, ú, ý, þ, æ, ö, Á, É, Í, Ó, Ú, Ý, Þ, Æ, Ö)
• Athugaðu fallbeygingarnar (t.d. "í hitatilrauninni" ekki "í hitatiluninni")
• Athugaðu orðaröð og málfræði
• Forðastu málfræðivillur eins og "Margar staðreyndarvillur þurfa að laga" (ætti að vera "Það þarf að laga margar staðreyndarvillur" eða "Þú þarft að laga nokkur atriði")

Fyrir númeraða lista í athugasemdum, notaðu þetta snið:
1) Fyrsti liður
2) Annar liður
3) Þriðji liður

Tilraun: ${experiment.title}
${experiment.worksheet ? `Efnahvarf: ${experiment.worksheet.reaction}` : ''}
${experiment.evaluationNotes?.length ? '\n' + experiment.evaluationNotes.join('\n\n') : ''}
KRÍTÍSKT: Gerir þú EINGÖNGU athugasemdir við villur sem eru RAUNVERULEGA í textanum. ALDREI gera ráð fyrir villum sem ekki eru til staðar. Lestu textann MJÖG vandlega áður en þú gerir athugasemdir.`;
};

// Teacher mode: Grading system prompt with detailed evaluation
export const buildTeacherSystemPrompt = (experiment: ExperimentConfig): string => {
  const coreRules = buildCoreEvaluationRules(experiment);
  const gradingScale = buildGradingScale(experiment);
  const totalMaxPoints = experiment.sections.reduce((sum, s) => sum + (s.maxPoints || 0), 0);

  return `Þú ert efnafræðikennari sem metur skýrslur nemenda. Notaðu nákvæma efnafræðilega þekkingu og gefðu skýrar, uppbyggilegar athugasemdir.

${coreRules}

${gradingScale}

${JSON_FORMAT_INSTRUCTIONS}

JSON sniðmát:
{
  "sections": {
${experiment.sections.map(s => `    "${s.id}": {
      "present": true/false,
      "quality": "good"/"needs improvement"/"unsatisfactory",
      "points": númer (0-${s.maxPoints}),
      "maxPoints": ${s.maxPoints},
      "note": "stuttur texti á íslensku - hvað er vel gert eða hvað þarf að bæta",
      "reasoning": "nákvæm útskýring á íslensku fyrir hvers vegna stig eru dregin frá (ef points < maxPoints). Útskýrðu hvað vantar eða þarf að bæta. Ef full stig (points == maxPoints), skildu þetta eftir tómt eða segðu 'Allt vel gert'"
    }`).join(',\n')}
  },
  "totalPoints": númer (summa allra points),
  "maxTotalPoints": ${totalMaxPoints},
  "suggestedGrade": "X/${totalMaxPoints}",
  "quickSummary": "1-2 setningar fyrir kennara - helstu styrkleikar og veikleikar"
}`;
};

// Student mode: Detailed assistance with encouraging feedback
export const buildStudentSystemPrompt = (experiment: ExperimentConfig): string => {
  const coreRules = buildCoreEvaluationRules(experiment);
  const gradingScale = buildGradingScale(experiment);
  const totalMaxPoints = experiment.sections.reduce((sum, s) => sum + (s.maxPoints || 0), 0);

  return `Þú ert efnafræðikennari sem aðstoðar nemanda við að bæta skýrslu sína. Þú mátt ALDREI skrifa textann fyrir nemandann. Þú átt að gefa uppbyggilega, hvetjandi endurgjöf sem hjálpar nemandanum að læra.

${coreRules}

${gradingScale}

${JSON_FORMAT_INSTRUCTIONS}

JSON sniðmát:
{
  "heildareinkunn": "X/${totalMaxPoints}",
  "totalPoints": númer,
  "maxTotalPoints": ${totalMaxPoints},
  "styrkir": ["jákvæð atriði sem eru vel gerð", "önnur sterk atriði"],
  "almennarAthugasemdir": ["hvetjandi almenn athugasemd"],
  "sections": {
${experiment.sections.map(s => `    "${s.id}": {
      "present": true/false,
      "points": númer (0-${s.maxPoints}),
      "maxPoints": ${s.maxPoints},
      "strengths": ["hvað er vel gert í þessum kafla"],
      "improvements": ["hvað þarf að bæta"],
      "suggestions": ["nákvæmar tillögur - spurningar sem hjálpa nemanda að hugsa, ekki tilbúinn texti"],
      "athugasemdir": "nákvæm athugasemd á íslensku"
    }`).join(',\n')}
  },
  "næstuSkref": ["nákvæm skref sem nemandi á að taka til að bæta skýrsluna"]
}`;
};

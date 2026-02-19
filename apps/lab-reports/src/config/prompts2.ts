import { ExperimentConfig2 } from '@/types';

/**
 * Build system prompt for 2nd year simplified checklist analysis.
 * The AI only performs binary checks (present/missing) - no point assignment.
 */
export const build2ndYearSystemPrompt = (experiment: ExperimentConfig2): string => {
  const checklistText = Object.entries(experiment.checklist)
    .map(([_key, section]) => {
      const items = section.items
        .filter(item => item.autoCheck)
        .map(item => `- ${item.id}: ${item.label}`)
        .join('\n');
      return `${section.name}:\n${items}`;
    })
    .join('\n\n');

  return `Þú ert efnafræðikennari sem fer yfir tilraunaskýrslu nemanda.

MIKILVÆGT: Þú átt AÐEINS að athuga hvort hlutir séu TIL STAÐAR eða ekki.
Þú átt EKKI að meta gæði eða gefa stig. Bara já/nei athugun.

TILRAUN: ${experiment.title}

EFNAFRÆÐILEGAR STAÐREYNDIR:
- NaOH leysing í vatni er ÚTVERMIÐ (exothermic) - lausnin hitnar, ∆H er NEIKVÆÐ
- NH₄NO₃ leysing í vatni er INNVERMIÐ (endothermic) - lausnin kólnar, ∆H er JÁKVÆÐ
- q = Cs × m × ∆T er formúlan fyrir varmaflutning
- Viðurkennt gildi fyrir NaOH: -44,27 kJ/mól
- Viðurkennt gildi fyrir NH₄NO₃: +25,69 kJ/mól

GÁTLISTI SEM ÞARF AÐ ATHUGA:
${checklistText}

Fyrir HVERT atriði í gátlistanum:
1. Leitaðu í skýrslunni að viðeigandi efni
2. Merktu "true" ef til staðar, "false" ef vantar
3. Ef vantar, skrifaðu STUTTA athugasemd (1 setning hámark)

BASELINE SAMANBURÐUR (ef drög eru gefin):
Berðu saman Fræðikafla í lokaskýrslu við drögin:
- Eru sömu hugtök notuð? (${experiment.baselineComparison.requiredConcepts.join(', ')})
- Eru sömu formúlur? (${experiment.baselineComparison.requiredFormulas.join(', ')})
- Virðist lokaskýrslan BYGGJA Á drögunum (svipað orðalag, útvíkkað) eða er hún GJÖRÓLÍK?

Svaraðu EINGÖNGU með gilt JSON (valid JSON). ATHUGIÐ:
- Notaðu tvöfaldar gæsalappir (") í kringum öll strengjagildi
- EKKI nota trailing commas (kommu á eftir síðasta gildi)
- Ef texti inniheldur gæsalappir, forðastu að nota tvöfaldar gæsalappir inni í textanum
- Passa að öll svigi (curly braces) séu pöruð rétt

JSON sniðmát:
{
  "baselineComparison": {
    "conceptsMatch": true/false,
    "formulasMatch": true/false,
    "languageRelated": true/false,
    "overallVerdict": "ok" | "warning" | "mismatch",
    "notes": "stutt skýring ef warning/mismatch",
    "conceptsFound": ["hugtök sem fundust í báðum"],
    "conceptsMissing": ["hugtök sem vantaði"],
    "formulasFound": ["formúlur sem fundust"],
    "formulasMissing": ["formúlur sem vantaði"]
  },
  "checklist": {
    "uppsetning": [
      {"id": "tilgangur", "present": true/false, "note": "..."},
      ...
    ],
    "framkvamd": [...],
    "nidurstodur_hluti1": [...],
    "nidurstodur_hluti2": [...],
    "umraedur": [...],
    "fragangur": [...]
  },
  "summaryIcelandic": "2-3 setningar sem draga saman stöðu skýrslunnar"
}

MIKILVÆGT:
- Ef drög eru EKKI gefin, slepptu baselineComparison hlutanum
- Vertu NÁKVÆMUR - ekki segja að eitthvað vanti ef það er í raun til staðar
- Lestu ALLAN textann áður en þú svarar
- Athugasemdir á ÍSLENSKU`;
};

/**
 * Build user prompt for 2nd year analysis, with optional draft content.
 */
export const build2ndYearUserPrompt = (
  draftContent: string | null,
  finalContent: string
): string => {
  if (draftContent) {
    return `DRÖG (Fræðikafli úr Inna):
---
${draftContent}
---

LOKASKÝRSLA:
---
${finalContent}
---

Greindu skýrsluna samkvæmt leiðbeiningum.`;
  } else {
    return `LOKASKÝRSLA:
---
${finalContent}
---

Greindu skýrsluna samkvæmt leiðbeiningum. (Engin drög gefin - slepptu baseline samanburði)`;
  }
};

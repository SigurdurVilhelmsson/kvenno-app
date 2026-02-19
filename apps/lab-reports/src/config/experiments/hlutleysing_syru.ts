import { ExperimentConfig } from '@/types';

/**
 * Hlutleysing sýru með gasmyndun (Acid Neutralization with Gas Formation)
 * Chemistry experiment - VERSION v1
 *
 * This experiment explores acid-base chemistry combined with gas laws.
 * Students neutralize acetic acid (vinegar) with sodium bicarbonate (baking soda),
 * measure pH changes, calculate CO₂ production using ideal gas law,
 * and determine percent yield.
 *
 * Connects textbook chapters 10 (Acids/Bases) and 16 (Gas Laws).
 *
 * GRADING PHILOSOPHY:
 * - LENIENT on STYLE: Accept informal/colloquial language if conceptually correct
 * - STRICT on STRUCTURE: Content must be in correct sections
 * - STRICT on COMPLETENESS: All required elements must be present
 * - STRICT on CALCULATIONS: Must show work with correct units and formulas
 * - STRICT on EXPERIMENT-SPECIFIC CONTENT: Theory must be general (reaction equation is allowed)
 * - STRICT on READABILITY: Proper paragraph breaks required, especially in Niðurstöður (HARD CAP if missing)
 *
 * GRADING INSTRUCTIONS:
 * - For each section, provide: (1) Points awarded out of maximum, (2) ONE brief sentence stating what was done well, (3) ONE brief sentence stating what was missing or incorrect (if applicable).
 * - Avoid lengthy explanations or repeating the criteria verbatim.
 * - Before presenting the final grade, conduct an internal review (see REVIEW CHECKLIST below).
 *
 * REVIEW CHECKLIST (complete before presenting grade):
 * [ ] Verify signature is at END of report (after Lokaorð), not just on title page
 * [ ] Verify signature is the ACTUAL AUTHOR'S NAME (not another name mentioned in text)
 * [ ] Check for IMAGE signatures in .docx files (handwritten/digital signatures as images)
 * [ ] Confirm calculations are graded based on content quality, with structural penalty applied only once in Framkvæmd/Heildarsamhengi
 * [ ] Check that Fræðikafli contains NO experiment-specific OBSERVATIONS or MEASURED VALUES
 * [ ] FORMULA CHECK: General formulas (PV=nRT, pH=-log[H⁺], V=4πr³/3) ARE allowed in Fræðikafli - do NOT penalize for these
 * [ ] Verify uncertainty/skekkjur is discussed in Lokaorð
 * [ ] Check readability: paragraph breaks in Fræðikafli, line/paragraph breaks between results in Niðurstöður
 * [ ] HARD CAP CHECK: If Niðurstöður has no breaks between results (wall of text), max score is 10/12
 * [ ] Ensure no double-penalties for the same issue across sections
 * [ ] Confirm total points match sum of section points
 *
 * COMMON MISTAKES TO HANDLE CONSISTENTLY:
 * 1. Describing specific pH values or balloon measurements in Fræðikafli → Deduct 3-4 points (belongs in Niðurstöður)
 * 2. All calculations in Framkvæmd → Grade calc quality in Niðurstöður, deduct 2 pts in Framkvæmd, note in Heildarsamhengi
 * 3. Name on title page only → 0 points for Undirskrift (must be at END)
 * 4. Another person's name at end (not author) → 0 points for Undirskrift
 * 5. No uncertainty discussion → Deduct 2 points in Lokaorð
 * 6. Missing conjugate acid/base identification → Deduct points in Niðurstöður
 * 7. Wall of text in Niðurstöður without breaks → HARD CAP at 10/12 points maximum
 * 8. Missing spectator ion explanation → Deduct in Niðurstöður
 * 9. FORMULAS vs CALCULATIONS confusion:
 *    - FORMULAS (PV = nRT, pH = -log[H⁺], V = 4πr³/3) ARE ALLOWED in Fræðikafli
 *    - CALCULATIONS with specific numbers (0,05 mol × 84 g/mol = 4,2 g) are NOT allowed in Fræðikafli
 *    - General chemistry examples ARE ALLOWED in Fræðikafli
 *    - DO NOT penalize students for showing general formulas in theory section!
 *
 * OUTPUT FORMAT:
 * ## Einkunn: [X]/50
 * | Kafli | Einkunn | Hámark |
 * |-------|---------|--------|
 * | Tilgangur | [X] | 4 |
 * | Fræðikafli | [X] | 12 |
 * | Tæki og efni | [X] | 2 |
 * | Framkvæmd | [X] | 4 |
 * | Niðurstöður | [X] | 12 |
 * | Lokaorð | [X] | 8 |
 * | Undirskrift | [X] | 2 |
 * | Heildarsamhengi | [X] | 6 |
 * | **Samtals** | **[X]** | **50** |
 *
 * TOTAL POINTS: 50
 */

export const hlutleysing_syru: ExperimentConfig = {
  id: 'hlutleysing_syru',
  title: 'Hlutleysing sýru með gasmyndun',
  year: 3, // Assuming 3rd year based on content complexity
  worksheet: {
    reaction: 'CH₃COOH(aq) + HCO₃⁻(aq) → CH₃COO⁻(aq) + H₂O(l) + CO₂(g)',
    materials: [
      'Borðedik / ediksýra 4%',
      'Matarsódi (NaHCO₃)',
    ],
    equipment: [
      '500 mL gosflaska',
      'Blaðra',
      'Teskeið',
      'Vog',
      'pH pappír',
      'Mæliglas',
    ],
    steps: [
      'Mæla 100 mL af ediki og setja í flösku',
      'Mæla pH ediks með pH pappír',
      'Vigta ~0,05 mól af matarsóda (NaHCO₃)',
      'Blása upp blöðru 2-3 sinnum til að teygja',
      'Setja matarsóda í blöðru og smeyga yfir flöskustút',
      'Hella matarsóda ofan í flösku og láta hvarf gerast',
      'Bíða þar til hvarfi lýkur (loftbólur hætta)',
      'Mæla þvermál/ummál blöðru',
      'Mæla pH lausnar eftir hvarf',
    ],
  },
  sections: [
    {
      id: 'tilgangur',
      name: 'Tilgangur',
      description: 'Clear 1-2 sentence statement of experiment goals',
      maxPoints: 4,
      pointGuidance: {
        '4': 'Clear, specific statement mentioning BOTH: (1) acid-base neutralization/pH changes AND (2) gas formation/gas law calculations or percent yield',
        '3': 'Mentions both main goals but slightly vague on specifics',
        '2': 'Mentions only one aspect (either pH/acid-base OR gas laws) but not both',
        '1': 'Present but unclear or incomplete',
        '0': 'Missing or completely off-topic',
      },
      criteria: {
        good: 'Skýr lýsing á markmiðum: skoða hlutleysingu sýru með basa OG mæla gasmyndun með gaslíkingunni / reikna nýtni. Nefnir BÆÐI sýru-basa OG gas hluta tilraunar.',
        needsImprovement:
          'Tilgangur til staðar en nefnir aðeins einn þátt (annað hvort sýru-basa eða gaslíkinguna) eða vantar smáatriði',
        unsatisfactory: 'Mjög óljós eða vantar alveg, eða nefnir aðeins einn hluta tilraunar',
      },
    },
    {
      id: 'fraedi',
      name: 'Fræðikafli',
      description:
        'Theory: acid-base definitions, conjugate pairs, pH concept, ideal gas law, spectator ions, percent yield',
      maxPoints: 12,
      pointGuidance: {
        '10-12':
          'Complete: Acid-base definitions (Brønsted-Lowry), conjugate pairs explained, pH/pOH relationship, ideal gas law explained, spectator ions defined, percent yield concept, good paragraph structure',
        '7-9': 'Mostly complete: Has key concepts but one topic poorly explained OR minor experiment-specific observations',
        '4-6': 'Partial: Lists concepts without explaining mechanisms OR significant experiment-specific content (actual pH values, measurements)',
        '1-3': 'Minimal: Mentions concepts but no real explanation',
        '0': 'Missing or describes only this specific experiment with no general theory',
      },
      criteria: {
        good: 'Skilgreining á sýrum og bösum (Brønsted-Lowry: prótónugjafi/þegi), tilsvarandi sýra og basi (conjugate pairs) ÚTSKÝRT, tengsl pH og [H⁺] / [OH⁻], gaslíkingin PV=nRT útskýrð með hverju hvert strik stendur fyrir, áhorfsjónir (spectator ions), nýtni (percent yield). Notar ALMENN dæmi. Efnahvarfsjafnan MÁ vera til staðar EN ekki mæld gildi úr tilrauninni. ENGIR útreikningar með tölum hér. Góð málsgreinaskipting.',
        needsImprovement:
          'Nefnir hugtök en ÚTSKÝRIR EKKI hvernig þau virka, eða hefur of miklar tilvísanir í mælingar úr tilrauninni, eða vantar málsgreinaskiptingu',
        unsatisfactory:
          'Vantar skilgreiningu á sýrum/bösum eða gaslíkingu, eða bara telur upp hugtök án þess að útskýra, eða lýsir NIÐURSTÖÐUM þessarar tilraunar í fræðikafla',
      },
      specialNote:
        'CRITICAL DISTINCTIONS - READ CAREFULLY: (1) FORMULAS vs CALCULATIONS: General FORMULAS (like PV = nRT, pH = -log[H⁺], V = 4πr³/3, [H⁺] = 10^(-pH)) ARE ALLOWED in theory - these explain concepts. CALCULATIONS with specific numbers from this experiment (like "0,05 mol × 84 g/mol = 4,2 g" or "pH = 2,5 þannig [H⁺] = 0,003 M") are NOT allowed - these belong in Niðurstöður. (2) GENERAL CHEMISTRY EXAMPLES: Examples from general chemistry ARE ALLOWED even if they use real chemical names. (3) EXPERIMENT-SPECIFIC CONTENT: What IS a violation (deduct 3-4 points): describing OBSERVATIONS or MEASURED VALUES specific to THIS experiment, such as: actual pH readings, balloon diameter measurements, specific mass weighed, or statements like "við mælddum pH = 3". (4) The reaction equation (CH₃COOH + HCO₃⁻ → CH₃COO⁻ + H₂O + CO₂) IS ALLOWED as part of general discussion. (5) REQUIRED TOPICS for full marks: (a) Brønsted-Lowry acid-base definition, (b) Conjugate acid/base pairs concept, (c) pH and its relationship to [H⁺] and [OH⁻], (d) Ideal gas law PV=nRT with explanation of each variable, (e) Spectator ions concept, (f) Percent yield / limiting reactant concept. (6) Must EXPLAIN concepts, not just list them. (7) READABILITY: Should have paragraph breaks between topics.',
    },
    {
      id: 'taeki',
      name: 'Tæki og efni',
      description: 'Complete list matching worksheet',
      maxPoints: 2,
      pointGuidance: {
        '2': 'Complete list matching worksheet materials and equipment',
        '1': 'List present but missing 1-2 items',
        '0': 'Very incomplete or missing entirely',
      },
      criteria: {
        good: 'Fullkominn listi sem passar við vinnuseðil: 500 mL flaska, borðedik/ediksýra 4%, blaðra, matarsódi (NaHCO₃), teskeið, vog, pH pappír, mæliglas',
        needsImprovement: 'Listi til staðar en vantar eitt eða tvö atriði',
        unsatisfactory: 'Mjög ófullkominn listi eða vantar mörg atriði',
      },
      specialNote:
        'Compare against the materials and equipment listed in the "Efni og áhöld" section of the worksheet. Accept reasonable variations in naming (e.g., "matarsóði" for "matarsódi", "NaHCO₃" instead of full name).',
    },
    {
      id: 'framkvamd',
      name: 'Framkvæmd',
      description: 'Should reference specific worksheet, optionally with comment on how it went or any deviations',
      maxPoints: 4,
      pointGuidance: {
        '4': 'Perfect: Specific worksheet reference by name, optionally with comment on how it went or changes made, NO misplaced content',
        '3': 'Good: Has worksheet reference, minor issues',
        '2': 'Acceptable: Generic worksheet reference OR some misplaced content (calculations, observations)',
        '1': 'Poor: Missing worksheet name AND has misplaced content',
        '0': 'Missing or contains extensive misplaced content with no proper procedure reference',
      },
      criteria: {
        good: 'Vísar í ÁKVEÐINN vinnuseðil með nafni (t.d. "Hlutleysing sýru með gasmyndun" eða "Tilraun 3" eða "sýru-basa tilraunin"). Má hafa stutta athugasemd um hvernig gekk eða hvort einhverjar breytingar voru gerðar frá vinnuseðli. ENGIR útreikningar - þeir tilheyra AÐEINS Niðurstöðukafla. EKKI þörf á lýsingu á ferlinu sjálfu.',
        needsImprovement:
          'Vinnuseðilsvísun of almenn ("samkvæmt vinnuseðli" án nafns), eða hefur EINHVERJA útreikninga hér (deduct 1-2 points), eða vantar nafn á vinnuseðli',
        unsatisfactory:
          'Vantar vinnuseðilsvísun, eða hefur ALLA útreikninga í Framkvæmd í stað Niðurstöður (deduct 2+ points), eða vísar bara í "vinnuseðil" án þess að tilgreina hvaða',
      },
      specialNote:
        'MISPLACED CONTENT PROTOCOL: (1) If calculations appear in Framkvæmd: GRADE the calculations themselves as if they were in Niðurstöður (give credit for correct work there), BUT deduct 1-2 points HERE in Framkvæmd for the structural error. (2) Do NOT double-penalize by also deducting in Niðurstöður for "missing" calculations that are actually present in Framkvæmd. (3) Also note in Heildarsamhengi for overall structural issues. (4) Framkvæmd should ONLY contain: worksheet reference (with name) and OPTIONALLY a brief comment on how it went or any deviations from the procedure. NO need to describe the procedure itself - that is on the worksheet. ANYTHING ELSE (calculations, observations, pH readings, measurements) is misplaced content requiring deduction. (5) Worksheet reference must be SPECIFIC: Accept "vinnuseðil Hlutleysing sýru", "Tilraun 3", "sýru-basa tilraunina". Do NOT accept just "samkvæmt vinnuseðli" or generic reference without worksheet identification.',
    },
    {
      id: 'nidurstodur',
      name: 'Niðurstöður',
      description:
        'All calculations, observations, answers to worksheet questions, pH measurements',
      maxPoints: 12,
      pointGuidance: {
        '11-12':
          'Excellent: ALL calculations correct (mass NaHCO₃, balloon volume, gas law for moles CO₂, theoretical yield, percent yield, [H⁺] and [OH⁻] from pH), ALL observations recorded (pH before/after, balloon measurement), chemical equations with acid/base/conjugate pairs labeled, spectator ion explanation, AND good formatting',
        '9-10': 'Complete content but formatting issues: All calculations and explanations present and correct, BUT results run together without clear separation (wall of text) = cap at 10 points maximum',
        '7-8': 'Mostly complete: Has most calculations and observations, but 1-2 items lack depth or are missing',
        '5-6': 'Partial: Missing 2-3 calculations OR several explanations are superficial',
        '2-4': 'Incomplete: Missing multiple calculations OR missing pH data OR missing chemical equations',
        '0-1': 'Minimal: Very little content, or calculations in wrong section with nothing here',
      },
      criteria: {
        good: 'ALLIR útreikningar HÉRNA: (1) Massi NaHCO₃ fyrir 0,05 mól, (2) Rúmmál blöðru (kúlujafna), (3) Mólfjöldi CO₂ með gaslíkingu, (4) Fræðilegt magn CO₂ (theoretical yield), (5) Nýtni (percent yield), (6) [H⁺] og [OH⁻] úr pH fyrir og eftir. ALLAR athuganir: pH fyrir og eftir, mælingar á blöðru. Efnajafna MÆÐ merktum sýru/basa/tilsvarandi pörum. Útskýring á áhorfsjónum (Na⁺). GÓÐ UPPSETNING með bilum milli niðurstaðna.',
        needsImprovement:
          'Flestar niðurstöður til staðar en vantar 1-2 útreikninga, eða útskýringar eru ófullnægjandi, eða vantar merkingar á sýru/basa, eða vantar skil milli niðurstaðna',
        unsatisfactory:
          'Vantar marga útreikninga eða þeir eru í röngum kafla, eða vantar pH mælingar, eða vantar efnajöfnur, eða vantar umfjöllun um áhorfsjónir',
      },
      specialNote:
        'FORMATTING REQUIREMENT (CHECK FIRST): Results MUST have clear visual separation - at minimum a line break between each calculation section and between observations. If all results run together in a "wall of text" without breaks, MAXIMUM score is 10/12 regardless of content quality. This is a HARD CAP. --- CHECK COMPLETENESS AND DEPTH: (1) MUST have ALL calculations with complete work shown: (a) Mass of NaHCO₃: n = 0,05 mol, M = 84 g/mol, m = n × M, (b) Balloon volume: V = 4πr³/3 (must add 450 mL for gas in bottle), (c) Moles CO₂: Using PV = nRT with correct units (P in Pa or atm, V in m³ or L, R = 8.314 J/(mol·K) or 0.0821 L·atm/(mol·K), T in K), (d) Theoretical yield from limiting reactant (NaHCO₃), (e) Percent yield = (actual/theoretical) × 100%, (f) [H⁺] = 10^(-pH) and [OH⁻] = 10^(pH-14) for BOTH before and after. (2) MUST have observations: pH before and after, balloon diameter/circumference, atmospheric pressure used. (3) MUST have balanced chemical equation WITH labels showing: which is acid, which is base, conjugate acid, conjugate base. (4) MUST explain why Na⁺ is spectator ion (does not participate in reaction). (5) MUST identify what the unstable intermediate (H₂CO₃) decomposes into (H₂O and CO₂). (6) Table for pH/[H⁺]/[OH⁻] values is good but not required. (7) Accept colloquial language if calculations are correct. (8) Check for blank spaces ("__") - deduct if present.',
    },
    {
      id: 'lokaord',
      name: 'Lokaorð',
      description:
        'Summary with connection to theory and discussion of uncertainty',
      maxPoints: 8,
      pointGuidance: {
        '7-8': 'Excellent: Concise summary connecting to acid-base theory AND gas laws, uncertainty discussed (especially balloon measurement, pH paper precision), coherent flow, no repetition',
        '5-6': 'Good: Has key elements but minor repetition OR brief uncertainty discussion',
        '3-4': 'Partial: Missing uncertainty discussion OR significant repetition OR poor coherence',
        '1-2': 'Minimal: Rambling, excessive repetition, or disconnected from theory',
        '0': 'Missing or completely incoherent',
      },
      criteria: {
        good: 'Samantekt tengir við sýru-basa fræði OG gaslögmál, UMRÆÐA um óvissu/skekkjur (t.d. blöðrumæling, pH pappír nákvæmni, loftþrýstingsmæling, hvort allt gasið komst í blöðruna), SAMHENGANDI, HNITMIÐAÐ, stuttur og glöggur. Tengir niðurstöður við fræði.',
        needsImprovement:
          'Tengsl við fræði til staðar en vantar umræðu um óvissu, eða smá óþarfa endurtekning, eða vantar tengingu við bæði sýru-basa OG gaslögmál',
        unsatisfactory:
          'SAMHENGISLAUS, MIKIL ENDURTEKNING, ÞVÆLING, vantar umræðu um óvissu, eða tengist ekki fræðum',
      },
      specialNote:
        'UNCERTAINTY REQUIREMENT (CRITICAL): Student MUST discuss óvissu/skekkjur (uncertainty/errors). For THIS experiment, key sources of uncertainty include: (1) Balloon measurement - diameter/circumference is difficult to measure precisely, (2) pH paper - typically ±0.5 pH unit precision, (3) Atmospheric pressure - may vary from time of measurement, (4) Gas loss - some CO₂ may dissolve in solution or escape before balloon attached, (5) Temperature assumptions - room temperature used but may vary, (6) Weighing precision. Missing uncertainty discussion = deduct 2 points. --- COHERENCE CHECK: Ideas should flow logically. Should connect results to both acid-base theory (pH change due to neutralization) AND gas laws (PV=nRT verification). --- REPETITION CHECK: If key terms appear 5+ times in a short conclusion, deduct 2-3 points. Should be 4-8 sentences maximum. --- CONNECTION TO WORKSHEET: The worksheet explicitly asks students to discuss uncertainty ("Hvar er mesta óvissan í þessum mælingum?") so this is expected content.',
    },
    {
      id: 'undirskrift',
      name: 'Undirskrift',
      description: 'Student signature (author\'s actual name) present at END of report (after Lokaorð)',
      maxPoints: 2,
      pointGuidance: {
        '2': 'Author\'s actual name (full name or first name) present at END of report, after Lokaorð',
        '0': 'Missing OR only on title page/header OR name at end is NOT the author\'s name',
      },
      criteria: {
        good: 'Undirskrift til staðar NEÐST í skýrslu, EFTIR Lokaorð kafla - VERÐUR að vera RAUNVERULEGT NAFN HÖFUNDAR (fullt nafn eða eiginnafn)',
        unsatisfactory:
          'Undirskrift VANTAR, eða er AÐEINS á titilsíðu/haus (ekki neðst eftir Lokaorð), eða nafn neðst er EKKI nafn höfundar',
      },
      specialNote:
        'SIGNATURE VERIFICATION (CRITICAL): (1) Signature must appear AFTER the Lokaorð section, at the very END of the report body. (2) A name on a TITLE PAGE or HEADER does NOT count as a signature. (3) CRITICAL: The signature MUST be the ACTUAL AUTHOR\'S NAME. Verify that the name at the end matches the author of the report (check title page or header for author\'s name). (4) COMMON MISTAKE: Another person\'s name mentioned in text at the end is NOT a signature. Example: "Ég notaði spjallmennið sem Siggi bjó til." - "Siggi" here is NOT the author\'s signature, it is a reference to the teacher/creator. This should receive 0 points. (5) Look for the author\'s name specifically appearing as a standalone signature after all content, not embedded in a sentence referring to someone else. (6) This is BINARY: either author\'s signature is at end (2 points) or it is not (0 points). (7) Accept full name or first name only, as long as it matches the author. (8) IMAGE SIGNATURES: Signatures may be inserted as IMAGES in .docx files (handwritten signature photos, digital signatures). These ARE VALID if they appear after Lokaorð and represent the author.',
    },
    {
      id: 'samhengi',
      name: 'Heildarsamhengi',
      description: 'Overall coherence, structure, and readability',
      maxPoints: 6,
      pointGuidance: {
        '6': 'Excellent: All content in correct sections, complete with no blanks, logical flow, good readability with proper paragraph breaks, appears proofread',
        '5': 'Very good: Minor structural issues or few typos, generally good readability',
        '4': 'Good: Some content slightly misplaced OR minor incomplete parts OR some readability issues',
        '2-3': 'Fair: Notable structural issues (calculations in wrong section) OR several incomplete parts OR poor readability',
        '1': 'Poor: Major structural problems, significant missing content, very poor readability',
        '0': 'Very poor: Severely disorganized, major sections missing, incoherent',
      },
      criteria: {
        good: 'Kaflar tengist saman rökrétt, skýrslan er FULLBÚIN (engin tóm bil eða ófullgerðar setningar), innihald í réttum köflum, samhengandi og yfirlesin. Orðalag má vera daglegt. GÓÐ LÆSILEIKI með málsgreinaskiptingu þar sem við á.',
        needsImprovement:
          'Kaflar tengist ekki vel saman, eða virðist ekki vera lesin yfir (málfræðivillur), eða smá ófullgerðir hlutar, eða EINHVER innihald í röngum kafla, eða vantar málsgreinaskiptingu',
        unsatisfactory:
          'Mjög lítið samhengi milli kafla, virðist ófullbúin með tómum bilum ("__") eða vantar stóra kafla, eða MIKIÐ af innihaldi í röngum köflum, eða mótsagnir, eða mjög slæm læsileiki',
      },
      specialNote:
        'STRUCTURAL INTEGRITY AND READABILITY CHECK: (1) COMPLETENESS: Blank spaces ("__") or incomplete sentences? Deduct 1-2 points. (2) SECTION PLACEMENT: Content in wrong sections? Deduct up to 2 points. Note: Avoid excessive double-penalty - if already deducted in Framkvæmd for misplaced calculations, apply only 1 point here for structural issue. (3) COHERENCE: Do sections flow logically? Does Tilgangur lead to Fræðikafli → Framkvæmd → Niðurstöður → Lokaorð? (4) PROOFREADING: Many grammar errors or typos suggest lack of review - deduct 1 point. (5) READABILITY REQUIREMENT: The text must be readable with proper formatting. Fræðikafli should have paragraph breaks between topics. Niðurstöður MUST have at least line breaks between calculations. A "wall of text" without breaks = deduct 1-2 points. (6) SUB-CRITERIA BREAKDOWN: (a) Content in correct sections: 2 points, (b) Completeness: 2 points, (c) Flow, coherence, and readability: 2 points. (7) UNIT CONSISTENCY: Check that students use consistent units throughout (especially in gas law calculations - P in Pa or atm, V in m³ or L, T in K).',
    },
  ],
  gradeScale: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'],
  evaluationNotes: [
    `EFNAFRÆÐILEG NÁKVÆMNI - MIKILVÆGT:
• CH₃COOH er veik sýra (ediksýra), HCO₃⁻ er basi
• Na⁺ er áhorfsjón (spectator ion) og tekur ekki þátt í hvarfinu
• H₂CO₃ er óstöðugt milliefni sem brotnar niður í H₂O og CO₂
• Brønsted-Lowry: sýra gefur próton (H⁺), basi tekur við próton`,
    `TÉKKLISTI:
Fræðikafli: Brønsted-Lowry skilgreining, tilsvarandi sýru-basa pör, pH/pOH tengsl, PV=nRT, áhorfsjónir, nýtni
Tæki og efni: Nemandi VERÐUR að telja upp öll tæki og efni
Framkvæmd: Ef nemandi vísar í vinnuseðil er það GOTT
Niðurstöður: Allir útreikningar (massi NaHCO₃, rúmmál blöðru, mólfjöldi CO₂, nýtni, [H⁺]/[OH⁻])
Lokaorð: Tengja við sýru-basa fræði OG gaslögmál, umræða um óvissu`,
  ],
};

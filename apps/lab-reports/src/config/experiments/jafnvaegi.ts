import { ExperimentConfig } from '@/types';

/**
 * Jafnvægi í efnahvörfum (Chemical Equilibrium)
 * 3rd year chemistry experiment - IMPROVED VERSION v8
 *
 * This experiment explores Le Chatelier's principle by observing
 * how an equilibrium system (Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺) responds to
 * changes in concentration and temperature.
 *
 * GRADING PHILOSOPHY:
 * - LENIENT on STYLE: Accept informal/colloquial language if conceptually correct
 * - STRICT on STRUCTURE: Content must be in correct sections
 * - STRICT on COMPLETENESS: All required elements must be present
 * - STRICT on DEPTH: Must explain concepts, not just list them
 * - STRICT on EXPERIMENT-SPECIFIC CONTENT: Theory must be general (but reaction equation is allowed)
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
 * [ ] Check that Fræðikafli contains NO experiment-specific OBSERVATIONS (colors, results) - reaction equation IS allowed
 * [ ] FORMULA CHECK: General formulas (M=n/V, Kc, equilibrium equations) ARE allowed in Fræðikafli - do NOT penalize for these
 * [ ] Verify uncertainty/skekkjur is discussed in Lokaorð
 * [ ] Check readability: paragraph breaks in Fræðikafli, line/paragraph breaks between results in Niðurstöður
 * [ ] HARD CAP CHECK: If Niðurstöður has no breaks between results (wall of text), max score is 10/12
 * [ ] Ensure no double-penalties for the same issue across sections
 * [ ] Confirm total points match sum of section points
 *
 * COMMON MISTAKES TO HANDLE CONSISTENTLY:
 * 1. Describing FeSCN²⁺ color in Fræðikafli → Deduct 3-4 points (belongs in Niðurstöður)
 * 2. All calculations in Framkvæmd → Grade calc quality in Niðurstöður, deduct 2 pts in Framkvæmd, note in Heildarsamhengi
 * 3. Name on title page only → 0 points for Undirskrift (must be at END)
 * 4. Another person's name at end (not author) → 0 points for Undirskrift
 * 5. No uncertainty discussion → Deduct 2 points in Lokaorð
 * 6. Listing factors without explaining mechanisms → Deduct 3-4 points in Fræðikafli
 * 7. Wall of text in Niðurstöður without breaks → HARD CAP at 10/12 points maximum
 * 8. Image signature not detected → Check .docx for embedded images after Lokaorð
 * 9. FORMULAS vs CALCULATIONS confusion:
 *    - FORMULAS (M = n/V, Kc equation, aA+bB⇌cC+dD) ARE ALLOWED in Fræðikafli
 *    - CALCULATIONS with specific numbers (0,002M × 0,1L = 0,0002 mól) are NOT allowed in Fræðikafli
 *    - General chemistry examples (AgNO₃ + NaCl → AgCl) ARE ALLOWED in Fræðikafli
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

export const jafnvaegi: ExperimentConfig = {
  id: 'jafnvaegi',
  title: 'Jafnvægi í efnahvörfum',
  year: 3,
  worksheet: {
    reaction: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)',
    materials: [
      'KSCN(s)',
      '0,002M KSCN lausn',
      '0,2 M Fe(NO₃)₃',
      '0,1 M AgNO₃ lausn',
    ],
    equipment: [
      '2 bikarglös',
      '6 tilraunaglös',
      'glasastandur',
      'dropateljarar',
    ],
    steps: [
      'Reikna út hvernig blanda skal lausnir (100 mL af hverri)',
      'Athuga KSCN lausn (litur og jónir)',
      'Kennari bætir Fe(NO₃)₃ við KSCN - sjá litabreytingu',
      'Blanda sett í 5 tilraunaglös (glas 1 = viðmiðun)',
      'Tilraun 2: Bæta við föstu KSCN → útskýra breytingu',
      'Tilraun 3: Bæta við Fe(NO₃)₃ lausn → útskýra breytingu',
      'Tilraun 4: Bæta við AgNO₃ lausn → útskýra breytingu',
      'Tilraun 5: Hita lausn í 50°C vatni → útskýra breytingu og hvort hvarfið sé inn- eða útvermið',
    ],
  },
  sections: [
    {
      id: 'tilgangur',
      name: 'Tilgangur',
      description: 'Clear 1-2 sentence statement of experiment goals',
      maxPoints: 4,
      pointGuidance: {
        '4': 'Clear, specific statement mentioning both Le Chatelier principle and equilibrium shifts',
        '3': 'Mentions goals but slightly vague on specifics',
        '2': 'Very brief or missing key elements',
        '1': 'Present but unclear or incomplete',
        '0': 'Missing or completely off-topic',
      },
      criteria: {
        good: 'Skýr lýsing á markmiðum: skoða áhrif breytinga á jafnvægisstöðu hvarfsins og/eða prófa Le Chatelier reglu',
        needsImprovement:
          'Tilgangur til staðar en vantar smáatriði um Le Chatelier eða jafnvægið',
        unsatisfactory: 'Mjög óljós eða vantar alveg',
      },
    },
    {
      id: 'fraedi',
      name: 'Fræðikafli',
      description:
        'Theory: equilibrium definition, Le Chatelier law, factors affecting equilibrium',
      maxPoints: 12,
      pointGuidance: {
        '10-12':
          'Complete: Equilibrium defined, Le Chatelier explained with mechanism, all three factors with GENERAL examples, good paragraph structure',
        '7-9': 'Mostly complete: Has key concepts but one factor poorly explained OR minor experiment-specific observations (not just reaction equation)',
        '4-6': 'Partial: Lists factors without explaining mechanisms OR significant experiment-specific content (colors, observations)',
        '1-3': 'Minimal: Mentions concepts but no real explanation',
        '0': 'Missing or describes only this specific experiment with no general theory',
      },
      criteria: {
        good: 'Skilgreining á efnajafnvægi, Le Chatelier lögmál ÚTSKÝRT (ekki bara nefnt) með ALMENNUM dæmum um HVERNIG áhrifaþættir (styrkur, hitastig, þrýstingur) breyta jafnvægi. Notar ALMENN dæmi eins og A+B⇌C eða "ljóst efni". Efnahvarfsjafnan (Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺) MÁ vera til staðar sem hluti af almennri umfjöllun, EN ekki lýsingar á litum eða niðurstöðum þessarar tilraunar. ENGIR útreikningar hér. Orðalag má vera daglegt. Góð málsgreinaskipting.',
        needsImprovement:
          'Nefnir þætti en ÚTSKÝRIR EKKI hvernig þeir virka, eða hefur of miklar tilvísanir í tiltekna tilraun (t.d. liti efna Í ÞESSARI tilraun), eða hefur Kc jöfnu fyrir ÞESSA tilteknu tilraun í stað almennrar útskýringar, eða vantar málsgreinaskiptingu',
        unsatisfactory:
          'Vantar skilgreiningu á efnajafnvægi eða Le Chatelier útskýringu, eða bara telur upp þætti án þess að útskýra, eða lýsir NIÐURSTÖÐUM þessarar tilraunar í fræðikafla',
      },
      specialNote:
        'CRITICAL DISTINCTIONS - READ CAREFULLY: (1) FORMULAS vs CALCULATIONS: General FORMULAS (like M = n/V, Kc = [C]^c[D]^d/[A]^a[B]^b, or aA + bB ⇌ cC + dD) ARE ALLOWED in theory - these explain concepts. CALCULATIONS with specific numbers from this experiment (like "0,002 mol/L × 0,1 L = 0,0002 mol" or "0,019g KSCN") are NOT allowed - these belong in Niðurstöður. (2) GENERAL CHEMISTRY EXAMPLES: Examples from general chemistry (like AgNO₃ + NaCl → AgCl as a precipitation example) ARE ALLOWED even if they use real chemical names - these are teaching examples, not results from THIS experiment. (3) EXPERIMENT-SPECIFIC CONTENT: What IS a violation (deduct 3-4 points): describing OBSERVATIONS or RESULTS specific to THIS experiment, such as: "ljósgult" (light yellow), "rautt" (red), "glært" (clear), "dökkrauð" (dark red), or statements like "þegar þessar jónir eru blandaðar saman verður lausnin rauð", or "við sáum að lausnin varð dekkri". (4) The reaction equation (Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺) IS ALLOWED as part of general discussion. (5) Example of ALLOWED: "Mólstyrkur er reiknaður með jöfnunni M = n/V" or "Dæmi um fellingarhvarf er AgNO₃ + NaCl → AgCl + NaNO₃". (6) Example of NOT ALLOWED: "Við reiknuðum 0,002M × 0,1L = 0,0002 mól" or "FeSCN²⁺ er rautt á litinn". (7) Must EXPLAIN how each Le Chatelier factor works, not just list them. (8) READABILITY: Should have paragraph breaks between topics.',
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
        good: 'Fullkominn listi sem passar við vinnuseðil: KSCN(s), KSCN lausn, Fe(NO₃)₃, AgNO₃, bikarglös, tilraunaglös, glasastandur, dropateljarar',
        needsImprovement: 'Listi til staðar en vantar eitt eða tvö atriði',
        unsatisfactory: 'Mjög ófullkominn listi eða vantar mörg atriði',
      },
      specialNote:
        'Compare against the materials and equipment listed in the "Efni" and "Áhöld" sections of the worksheet. Accept reasonable variations in naming (e.g., "prófglös" for "tilraunaglös").',
    },
    {
      id: 'framkvamd',
      name: 'Framkvæmd',
      description: 'Should reference specific worksheet with brief description',
      maxPoints: 4,
      pointGuidance: {
        '4': 'Perfect: Specific worksheet reference by name + brief procedure description, NO misplaced content',
        '3': 'Good: Has worksheet reference and description, minor issues',
        '2': 'Acceptable: Generic worksheet reference OR some misplaced content (calculations, observations)',
        '1': 'Poor: Missing worksheet name AND has misplaced content',
        '0': 'Missing or contains extensive misplaced content with no proper procedure reference',
      },
      criteria: {
        good: 'Vísar í ÁKVEÐINN vinnuseðil með nafni (t.d. "Jafnvægi í efnahvörfum" eða "Jafnvægi í hvörfum" eða "sýnitilraun Jafnvægi") OG gefur stutta lýsingu. ENGIR útreikningar - þeir tilheyra AÐEINS Niðurstöðukafla.',
        needsImprovement:
          'Vinnuseðilsvísun of almenn ("samkvæmt vinnuseðli" án nafns), eða hefur EINHVERJA útreikninga hér (deduct 1-2 points), eða vantar nafn á vinnuseðli',
        unsatisfactory:
          'Vantar vinnuseðilsvísun, eða hefur ALLA útreikninga í Framkvæmd í stað Niðurstöður (deduct 2+ points), eða vísar bara í "vinnuseðil" án þess að tilgreina hvaða',
      },
      specialNote:
        'MISPLACED CONTENT PROTOCOL: (1) If calculations appear in Framkvæmd: GRADE the calculations themselves as if they were in Niðurstöður (give credit for correct work there), BUT deduct 1-2 points HERE in Framkvæmd for the structural error. (2) Do NOT double-penalize by also deducting in Niðurstöður for "missing" calculations that are actually present in Framkvæmd. (3) Also note in Heildarsamhengi for overall structural issues. (4) Framkvæmd should ONLY contain: worksheet reference (with name) and brief procedural description. ANYTHING ELSE (calculations, observations, color descriptions, Le Chatelier explanations) is misplaced content requiring deduction. (5) Worksheet reference must be SPECIFIC: Accept "vinnuseðil Jafnvægi í efnahvörfum", "vinnuseðil um jafnvægi", "sýnitilraun jafnvægi". Do NOT accept just "samkvæmt vinnuseðli" or "kennari gerði tilraunina" without worksheet name.',
    },
    {
      id: 'nidurstodur',
      name: 'Niðurstöður',
      description:
        'All calculations, observations, answers to worksheet questions',
      maxPoints: 12,
      pointGuidance: {
        '11-12':
          'Excellent: All THREE calculations correct, ALL 5 test tubes with FULL Le Chatelier explanations, AND good formatting (clear breaks between each result/calculation)',
        '9-10': 'Complete content but formatting issues: All calculations and explanations present and correct, BUT results run together without clear separation (wall of text) = cap at 10 points maximum',
        '7-8': 'Mostly complete: Has calculations and observations, but 1-2 explanations lack depth (missing WHY), regardless of formatting',
        '5-6': 'Partial: Missing one calculation OR several explanations are superficial ("verður rautt" without mechanism)',
        '2-4': 'Incomplete: Missing multiple calculations OR missing exo/endothermic determination OR several test tubes not explained',
        '0-1': 'Minimal: Very little content, or calculations in wrong section with nothing here',
      },
      criteria: {
        good: 'Allir ÞRÍR útreikningar HÉRNA í Niðurstöðum (KSCN, Fe(NO₃)₃ með kristallvatni, AgNO₃), ALLAR 5 tilraunir skráðar með FULLBÚNUM Le Chatelier útskýringum (HVERNIG og HVERS VEGNA hvarfið færist), greining á inn/útvermni, engin tóm bil. Orðalag má vera daglegt ef rétt. GÓÐ UPPSETNING með línubilum eða málsgreinaskiptingu milli niðurstaðna.',
        needsImprovement:
          'Flestar niðurstöður til staðar en vantar 1-2 útskýringar á tilraunum, eða útskýringar eru ófullnægjandi (bara "færist til hægri" án þess að útskýra HVERS VEGNA), eða vantar einhvern útreikning, eða vantar skil milli niðurstaðna',
        unsatisfactory:
          'Vantar útreikninga (þeir eru kannski í röngum kafla?), eða vantar margar útskýringar á tilraunum, eða hefur bara lýsingu án greiningar ("verður rautt" án þess að segja HVERS VEGNA), eða vantar inn/útvermið greining',
      },
      specialNote:
        'FORMATTING REQUIREMENT (CHECK FIRST): Results MUST have clear visual separation - at minimum a line break between each test tube observation and between calculations. If all results run together in a "wall of text" without breaks, MAXIMUM score is 10/12 regardless of content quality. This is a HARD CAP. --- CHECK COMPLETENESS AND DEPTH: (1) MUST have ALL THREE calculations with complete work shown: (a) 0,002M KSCN: mól = M × L, then grams using molar mass, (b) 0,2M Fe(NO₃)₃·9H₂O: mól = M × L, then grams using 404 g/mol, (c) 0,1M AgNO₃: mól = M × L, then grams. NOTE: If calculations are in Framkvæmd instead, grade the QUALITY here as if they were correct, do NOT deduct here for wrong placement (that penalty is in Framkvæmd). (2) MUST have observations AND Le Chatelier explanations for ALL 5 test tubes: (a) Test 1: reference/control, (b) Test 2: add KSCN(s) → darker → why (more SCN⁻, shifts right, more FeSCN²⁺), (c) Test 3: add Fe(NO₃)₃ → darker → why (more Fe³⁺, shifts right), (d) Test 4: add AgNO₃ → lighter → why (Ag⁺ removes SCN⁻ as AgSCN precipitate, shifts left), (e) Test 5: heat → lighter → exothermic (if darker → endothermic). (3) Each explanation must include: what was added, direction of shift, WHY it shifts. "Verður rautt" alone = insufficient. Need "Verður rautt því hvarfið færist til hægri til að mynda meira FeSCN²⁺ vegna þess að við bættum við Fe³⁺" = sufficient. (4) Accept colloquial language if mechanism is correct. (5) Check for blank spaces ("__") - deduct if present.',
    },
    {
      id: 'lokaord',
      name: 'Lokaorð',
      description:
        'Summary with connection to theory and discussion of uncertainty',
      maxPoints: 8,
      pointGuidance: {
        '7-8': 'Excellent: Concise summary connecting to Le Chatelier, uncertainty discussed, coherent flow, no repetition',
        '5-6': 'Good: Has key elements but minor repetition OR brief uncertainty discussion',
        '3-4': 'Partial: Missing uncertainty discussion OR significant repetition OR poor coherence',
        '1-2': 'Minimal: Rambling, excessive repetition, or disconnected from theory',
        '0': 'Missing or completely incoherent',
      },
      criteria: {
        good: 'Samantekt tengir við Le Chatelier, UMRÆÐA um óvissu/skekkjur (má vera stutt, t.d. "skekkjur höfðu lítil áhrif"), SAMHENGANDI (ekki endurtaka sama aftur og aftur), HNITMIÐAÐ (ekki þvæla), stuttur og glöggur',
        needsImprovement:
          'Tengsl við fræði til staðar en vantar umræðu um óvissu, eða smá óþarfa endurtekning (2-3 sinnum), eða virðist vera of langt og endurtekið',
        unsatisfactory:
          'SAMHENGISLAUS (hoppar milli hugmynda), MIKIL ENDURTEKNING (4+ sinnum sama hugtakið/setningin), ÞVÆLING (segir sama hlutinn aftur og aftur með öðrum orðum), vantar umræðu um óvissu, eða tengist ekki fræðum',
      },
      specialNote:
        'UNCERTAINTY REQUIREMENT (CRITICAL): Student MUST discuss óvissu/skekkjur (uncertainty/errors). For THIS experiment, acceptable responses include: "Skekkjur höfðu lítil áhrif á niðurstöður" or "Óvissa í mælingum var lítil vegna eigindlegra athugana" or acknowledgment that this experiment relies on qualitative color observations. Missing uncertainty discussion = deduct 2 points. EXPERIMENT-SPECIFIC NOTE: In this equilibrium experiment, measurement uncertainty typically has minimal effect on qualitative observations (color changes), so students acknowledging this is appropriate. --- COHERENCE CHECK: Ideas should flow logically. Bad example: "Le Chatelier virkar. Hvarfið brást við. Reglan sannaðist." = incoherent rambling. Good example: "Niðurstöður styðja Le Chatelier því að öll fimm tilraunin sýndu væntanlegar litabreytingar..." = logical flow. --- REPETITION CHECK: If "Le Chatelier" or "jafnvægi" appears 5+ times in a short conclusion, deduct 2-3 points. Should be 4-8 sentences maximum.',
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
        'SIGNATURE VERIFICATION (CRITICAL): (1) Signature must appear AFTER the Lokaorð section, at the very END of the report body. (2) A name on a TITLE PAGE or HEADER does NOT count as a signature. (3) CRITICAL: The signature MUST be the ACTUAL AUTHOR\'S NAME. Verify that the name at the end matches the author of the report (check title page or header for author\'s name). (4) COMMON MISTAKE: Another person\'s name mentioned in text at the end is NOT a signature. Example: "Eina heimild mín var vinnuseðillinn og spjallmennið sem Siggi bjó til." - "Siggi" here is NOT the author\'s signature, it is a reference to the teacher/creator. This should receive 0 points. (5) Look for the author\'s name specifically appearing as a standalone signature after all content, not embedded in a sentence referring to someone else. (6) This is BINARY: either author\'s signature is at end (2 points) or it is not (0 points). (7) Accept full name or first name only, as long as it matches the author. (8) IMAGE SIGNATURES: Signatures may be inserted as IMAGES in .docx files (handwritten signature photos, digital signatures). These ARE VALID if they appear after Lokaorð and represent the author. When processing documents, ensure image content is checked for signatures, not just text extraction.',
    },
    {
      id: 'samhengi',
      name: 'Heildarsamhengi',
      description: 'Overall coherence, structure, and readability',
      maxPoints: 6,
      pointGuidance: {
        '6': 'Excellent: All content in correct sections, complete with no blanks, logical flow, good readability with proper paragraph breaks, appears proofread',
        '5': 'Very good: Minor structural issues or few typos, generally good readability',
        '4': 'Good: Some content slightly misplaced OR minor incomplete parts OR some readability issues (missing paragraph breaks)',
        '2-3': 'Fair: Notable structural issues (calculations in wrong section) OR several incomplete parts OR poor readability (wall of text)',
        '1': 'Poor: Major structural problems, significant missing content, very poor readability',
        '0': 'Very poor: Severely disorganized, major sections missing, incoherent',
      },
      criteria: {
        good: 'Kaflar tengist saman rökrétt, skýrslan er FULLBÚIN (engin tóm bil eða ófullgerðar setningar), innihald í réttum köflum, samhengandi og yfirlesin. Orðalag má vera daglegt. GÓÐ LÆSILEIKI með málsgreinaskiptingu þar sem við á.',
        needsImprovement:
          'Kaflar tengist ekki vel saman, eða virðist ekki vera lesin yfir (málfræðivillur), eða smá ófullgerðir hlutar, eða EINHVER innihald í röngum kafla, eða vantar málsgreinaskiptingu (veggur af texta)',
        unsatisfactory:
          'Mjög lítið samhengi milli kafla, virðist ófullbúin með tómum bilum ("__") eða vantar stóra kafla, eða MIKIÐ af innihaldi í röngum köflum (t.d. allir útreikningar í Framkvæmd), eða mótsagnir, eða mjög slæm læsileiki',
      },
      specialNote:
        'STRUCTURAL INTEGRITY AND READABILITY CHECK: (1) COMPLETENESS: Blank spaces ("__") or incomplete sentences? Deduct 1-2 points. (2) SECTION PLACEMENT: Content in wrong sections? Deduct up to 2 points. Note: Avoid excessive double-penalty - if already deducted in Framkvæmd for misplaced calculations, apply only 1 point here for structural issue. (3) COHERENCE: Do sections flow logically? Does Tilgangur lead to Fræðikafli → Framkvæmd → Niðurstöður → Lokaorð? (4) PROOFREADING: Many grammar errors or typos suggest lack of review - deduct 1 point. (5) READABILITY REQUIREMENT: The text must be readable with proper formatting. Fræðikafli should optimally include paragraph breaks between sections/topics. Niðurstöður MUST have at least line breaks (preferably paragraph breaks) between individual results and/or calculations. A "wall of text" without breaks = deduct 1-2 points. (6) SUB-CRITERIA BREAKDOWN: (a) Content in correct sections: 2 points, (b) Completeness: 2 points, (c) Flow, coherence, and readability: 2 points.',
    },
  ],
  gradeScale: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'],
  evaluationNotes: [
    `EFNAFRÆÐILEG NÁKVÆMNI - MJÖG MIKILVÆGT:
• Fe(NO₃)₃ inniheldur Fe³⁺ jónir (ekki Fe²⁺) og NO₃⁻ jónir (ekki NO⁻)
• Fe(NO₃)₃ lausn er GUL eða LJÓSGUL (ekki blá!)
• KSCN inniheldur K⁺ og SCN⁻ jónir (EKKI ScN⁻ - það er alvarleg villa!)
• FeSCN²⁺ er dökkrauð/rústauð á lit
• AgNO₃ inniheldur Ag⁺ og NO₃⁻ jónir`,
    `Ef nemandi segir "lausnin lýstist" - ekki gera athugasemd við það nema nemandi hafi skrifað rangt (t.d. "lausnin dökknaði" þegar hún átti að lýsast).`,
    `RÖKFRÆÐILEG ATHUGUN á Le Chatelier:
Nota SPURNINGAR til að leiða nemanda til að hugsa rétt.`,
    `JÖFNUR:
• Athugar þú hvort allar jöfnur og formúlur í fræðikafla séu NÚMERAÐAR (1), (2), (3)
• Vertu NÁKVÆM um hvaða jöfnu þú ert að tala um`,
    `TÉKKLISTI:
Fræðikafli: Skilgreining á efnajafnvægi, Le Chatelier með tengingu við áhrifaþætti, númeraðar jöfnur
Tæki og efni: Nemandi VERÐUR að telja upp öll tæki og efni - ekki nóg að vísa í vinnuseðil
Framkvæmd: Ef nemandi vísar í vinnuseðil er það GOTT
Niðurstöður: Útreikningar fyrir allar þrjár lausnir (KSCN, Fe(NO₃)₃, AgNO₃)
Lokaorð: Tengja við fræði`,
  ],
};

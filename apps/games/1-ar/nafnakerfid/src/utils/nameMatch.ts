/**
 * A Greek prefix may keep or drop its last vowel before `oxíð`. The textbook's
 * naming section (ch02/m68698) lets a student write either — `tetroxíð` or
 * `tetraoxíð`, `mónoxíð` or `mónóoxíð` — so a grader compares names with that
 * vowel folded away. Level 2 folds it on a typed name; Level 3 on a built one,
 * since its tray can offer `tetra` and `oxíð` beside `tetroxíð` (decision 37).
 *
 * Accents are tolerated in the prefix, so this works on a name before or after
 * Level 2 strips its Icelandic letters.
 */
export function foldPrefixVowel(name: string): string {
  return name.replace(/(m[oó]n|tetr|pent|hex|hept|okt|n[oó]n|dek)[aoó](?=[oó]x)/gi, '$1');
}

import { ARASAAC_CREDIT, myndir } from '../data/myndir';

/**
 * ARASAAC pictograms on the A1 chips (REVIEW-QUEUE D3, C10). Only pictures a person has
 * approved are in `myndir`, so a chip with none shows its word alone.
 */
export function pictureFor(categoryId: string, chip: string): number | undefined {
  return myndir[categoryId]?.[chip];
}

export function hasPictures(categoryId: string): boolean {
  return Object.keys(myndir[categoryId] ?? {}).length > 0;
}

/**
 * The picture beside a chip's word. `alt` is empty: the word is printed right beside it, so a
 * screen reader saying it twice helps no one.
 */
export function Pictogram({ id, size = 40 }: { id: number; size?: number }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}myndir/${id}.png`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0"
    />
  );
}

/** ARASAAC's licence asks for this wherever its pictures are shown. */
export function ArasaacCredit({ className = '' }: { className?: string }) {
  return <p className={`text-xs text-warm-600 ${className}`}>{ARASAAC_CREDIT}</p>;
}

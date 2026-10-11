import { useState, type ReactNode } from 'react';

import { Link, useParams } from 'react-router-dom';

import { Container } from '@kvenno/shared/components';

import { getCategoryById } from '../data';
import { getSmidur, type SmidurSubject } from '../data/smidur';

const GENDER: Record<SmidurSubject['gender'], string> = {
  kk: 'karlkyn',
  kvk: 'kvenkyn',
  hk: 'hvorugkyn',
};
const NUMBER: Record<SmidurSubject['number'], string> = { ET: 'eintala', FT: 'fleirtala' };

/**
 * The sentence builder (REVIEW-QUEUE D3): the student picks what the sentence is about, a frame
 * from the card and a word for its blank, and reads the sentence with every word in the right
 * form. Every sentence was built at `pnpm islenskubraut:build` from BÍN's inflection tables
 * (`scripts/islenskubraut/smidur.mjs`); this page only chooses among them.
 *
 * A1 only for now. The card page links here once a teacher has confirmed the level (C9).
 */
export function SmidurPage() {
  const { flokkur } = useParams<{ flokkur: string }>();
  const category = getCategoryById(flokkur || '');
  const data = category ? getSmidur(category.id, 'A1') : undefined;
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [optionIndex, setOptionIndex] = useState<number | null>(null);

  if (!category || !data) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-warm-900 mb-4">
          Setningasmiður fannst ekki
        </h1>
        <p className="text-warm-600 mb-8">Þessi flokkur hefur engan setningasmið enn.</p>
        <Link to="/" className="text-warm-600 underline hover:text-warm-900">
          Allir flokkar
        </Link>
      </Container>
    );
  }

  const subject = data.subjects[subjectIndex];
  const frame = data.frames[frameIndex];
  const words =
    frame.options === null
      ? frame.sentences[subjectIndex][0]
      : optionIndex === null
        ? null
        : frame.sentences[subjectIndex][optionIndex];
  const changed = words?.some((w) => w.changed) ?? false;
  const pickFrame = (index: number) => {
    setFrameIndex(index);
    setOptionIndex(null);
  };

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Brauðmolar" className="mb-6">
        <Link
          to={`/spjald/${category.id}?stig=A1`}
          className="text-sm text-warm-600 underline hover:text-warm-900"
        >
          {category.name}, spjald A1
        </Link>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div
          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl text-white"
          style={{ backgroundColor: category.color }}
        >
          <span className="text-3xl" aria-hidden="true">
            {category.icon}
          </span>
          <h1 className="font-heading text-2xl font-bold">Setningasmiður: {category.name}</h1>
        </div>
        <p className="text-warm-600">Veldu orð og setningaramma og sjáðu setninguna verða til.</p>
      </div>

      {!data.confirmed && (
        <p
          role="note"
          className="mb-8 rounded-xl border border-warm-300 bg-warm-100 px-4 py-3 text-sm text-warm-800"
        >
          Drög: kennari hefur ekki enn farið yfir þessar setningar.
        </p>
      )}

      <div className="space-y-8 max-w-2xl">
        {data.subjects.length > 1 && (
          <Step id="smidur-um" title={data.subjectQuestion ?? 'Um hvern er setningin?'}>
            <Choices
              labelledBy="smidur-um"
              items={data.subjects.map((s) => s.text)}
              selected={subjectIndex}
              onSelect={setSubjectIndex}
              color={category.color}
            />
            {!subject.person && (
              <p className="mt-3 text-sm text-warm-600">
                <span className="font-semibold text-warm-800">{subject.text}</span>:{' '}
                {GENDER[subject.gender]}, {NUMBER[subject.number]}
              </p>
            )}
          </Step>
        )}

        <Step id="smidur-rammi" title="Veldu setningaramma">
          <Choices
            labelledBy="smidur-rammi"
            items={data.frames.map((f) => f.frame)}
            selected={frameIndex}
            onSelect={pickFrame}
            color={category.color}
          />
        </Step>

        {frame.options !== null && (
          <Step id="smidur-ord" title={frame.question ?? 'Veldu orð'}>
            <Choices
              labelledBy="smidur-ord"
              items={frame.options}
              selected={optionIndex}
              onSelect={setOptionIndex}
              color={category.color}
            />
          </Step>
        )}

        <section aria-labelledby="smidur-setning">
          <h2
            id="smidur-setning"
            className="font-heading text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3"
          >
            Setningin
          </h2>
          <div
            aria-live="polite"
            className="rounded-xl border-2 bg-surface-raised px-5 py-6"
            style={{ borderColor: category.color }}
          >
            {words === null ? (
              <p className="text-xl text-warm-600">{frame.frame}</p>
            ) : (
              <p className="text-2xl font-semibold text-warm-900" data-testid="smidur-setning">
                {words.map((w, i) => (
                  <span key={i}>
                    {i > 0 && ' '}
                    {w.changed ? (
                      <mark className="bg-transparent text-warm-900 underline decoration-2 underline-offset-4">
                        {w.word}
                      </mark>
                    ) : (
                      w.word
                    )}
                  </span>
                ))}
              </p>
            )}
          </div>
          {changed && (
            <p className="mt-3 text-sm text-warm-600">
              Undirstrikuðu orðin breytast frá spjaldinu svo að þau passi við setninguna.
            </p>
          )}
        </section>
      </div>

      <p className="mt-12 max-w-2xl text-xs text-warm-600">
        Beygingarmyndirnar eru úr Beygingarlýsingu íslensks nútímamáls (BÍN) og eru í eigu Stofnunar
        Árna Magnússonar í íslenskum fræðum.{' '}
        <a href="https://bin.arnastofnun.is/" className="underline hover:text-warm-900">
          bin.arnastofnun.is
        </a>{' '}
        ·{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          className="underline hover:text-warm-900"
        >
          CC BY-SA 4.0
        </a>
      </p>
    </Container>
  );
}

function Step({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 id={id} className="font-heading text-base font-semibold text-warm-800 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A row of toggle buttons, one pressed at a time, as `LevelSelector` draws them. */
function Choices({
  labelledBy,
  items,
  selected,
  onSelect,
  color,
}: {
  labelledBy: string;
  items: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  color: string;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const pressed = index === selected;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={pressed}
            onClick={() => onSelect(index)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors pointer-coarse:min-h-11 ${
              pressed ? 'text-white shadow-md' : 'bg-warm-100 text-warm-800 hover:bg-warm-200'
            }`}
            style={pressed ? { backgroundColor: color } : undefined}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

import { formatDecimal } from '@shared/utils';

/**
 * Temperature conversion (year-1 plan item 14), from book ch01/m68683,
 * "Umreikningur hitastigs". Temperature is the one conversion in the chapter
 * that is not a factor: Celsius and Fahrenheit do not share a zero, so the
 * relation is y = mx + b, not y = mx, which is why it sits beside the chains
 * as its own practice and not inside them.
 *
 * Every item is a number the book itself converts, in a worked example, a
 * check-your-learning or an end-of-section exercise. The answer is derived
 * here, never stored.
 */

export type Scale = 'C' | 'K' | 'F';

export const SCALE_SYMBOL: Record<Scale, string> = { C: '°C', K: 'K', F: '°F' };

export interface TemperatureItem {
  id: string;
  /** What the number is, as the book gives it. */
  context?: string;
  value: number;
  from: Scale;
  to: Scale;
}

export const TEMPERATURE_ITEMS: TemperatureItem[] = [
  { id: 't1', context: 'Venjulegur líkamshiti', value: 37.0, from: 'C', to: 'K' },
  { id: 't2', context: 'Venjulegur líkamshiti', value: 37.0, from: 'C', to: 'F' },
  { id: 't3', context: 'Ofnhiti fyrir pítsu', value: 450, from: 'F', to: 'C' },
  { id: 't4', value: 80.92, from: 'C', to: 'F' },
  { id: 't5', context: 'Suðumark gulls', value: 2966, from: 'C', to: 'K' },
  { id: 't6', context: 'Kaldasta svæðið í frysti', value: -10, from: 'F', to: 'C' },
  { id: 't7', context: 'Þurrís', value: -77, from: 'C', to: 'F' },
  { id: 't8', context: 'Suðumark fljótandi ammóníaks', value: -28.1, from: 'F', to: 'K' },
  { id: 't9', context: 'Hitabylgja í Evrópu sumarið 1995', value: 45, from: 'C', to: 'F' },
  { id: 't10', context: 'Þar sem kvarðarnir mætast', value: 233.15, from: 'K', to: 'C' },
  { id: 't11', context: 'Hámarkshiti á úðabrúsa', value: 130, from: 'F', to: 'C' },
  { id: 't12', value: 50, from: 'F', to: 'K' },
];

/** An answer is right within half a degree: 273 for 273,15 passes, a slip does not. */
export const TEMPERATURE_TOLERANCE = 0.5;

const toC = (value: number, from: Scale): number =>
  from === 'C' ? value : from === 'K' ? value - 273.15 : (value - 32) / 1.8;

const fromC = (c: number, to: Scale): number =>
  to === 'C' ? c : to === 'K' ? c + 273.15 : 1.8 * c + 32;

export function convertTemperature(value: number, from: Scale, to: Scale): number {
  return fromC(toC(value, from), to);
}

export function answerOf(item: TemperatureItem): number {
  return convertTemperature(item.value, item.from, item.to);
}

const fmt = (n: number, decimals = 2): string => {
  const rounded = Number(n.toFixed(decimals));
  return formatDecimal(rounded).replace(/^-/, '−');
};

export function withUnit(n: number, scale: Scale, decimals = 2): string {
  return `${fmt(n, decimals)} ${SCALE_SYMBOL[scale]}`;
}

/** The book's equations, one line each way. */
export const TEMPERATURE_EQUATIONS = [
  'T(K) = T(°C) + 273,15',
  'T(°C) = T(K) − 273,15',
  'T(°F) = 1,8 × T(°C) + 32',
  'T(°C) = (T(°F) − 32) / 1,8',
];

/** The worked steps, through °C when neither end is Celsius. */
export function stepsFor(item: TemperatureItem): string[] {
  const steps: string[] = [];
  const v = withUnit(item.value, item.from);
  const c = toC(item.value, item.from);
  if (item.from === 'K') steps.push(`T(°C) = ${fmt(item.value)} − 273,15 = ${withUnit(c, 'C')}`);
  if (item.from === 'F')
    steps.push(`T(°C) = (${fmt(item.value)} − 32) / 1,8 = ${withUnit(c, 'C')}`);
  if (item.to === 'K') steps.push(`T(K) = ${fmt(c)} + 273,15 = ${withUnit(c + 273.15, 'K')}`);
  if (item.to === 'F') steps.push(`T(°F) = 1,8 × ${fmt(c)} + 32 = ${withUnit(1.8 * c + 32, 'F')}`);
  if (item.to === 'C' && item.from === 'C') steps.push(v);
  return steps;
}

export interface WrongRoute {
  value: number;
  message: string;
}

/**
 * The slips the book's equations invite, each as the number it gives, so the
 * feedback can name the one the student made. A route that lands within the
 * tolerance of the right answer is dropped: it cannot be told apart.
 */
export function wrongRoutes(item: TemperatureItem): WrongRoute[] {
  const { value, from, to } = item;
  const c = toC(value, from);
  const routes: WrongRoute[] = [];
  if (to === 'K') {
    routes.push({
      value: c - 273.15,
      message: 'Þú dróst 273,15 frá. Frá °C til K er lagt við: kelvintalan er alltaf 273,15 hærri.',
    });
  }
  if (from === 'K') {
    routes.push({
      value: value + 273.15,
      message: 'Þú lagðir 273,15 við. Frá K til °C lækkar talan um 273,15.',
    });
  }
  if (to === 'F') {
    routes.push(
      {
        value: 1.8 * c,
        message: 'Þú margfaldaðir með 1,8 en gleymdir að leggja 32 við.',
      },
      {
        value: c / 1.8 + 32,
        message:
          'Þú deildir með 1,8. Frá °C til °F er margfaldað: Fahrenheit-gráða er minni, svo þær eru fleiri.',
      },
      {
        value: 1.8 * (c + 32),
        message:
          'Þú lagðir 32 við á undan margföldun. Margfaldaðu fyrst með 1,8 og leggðu svo 32 við.',
      }
    );
  }
  if (from === 'F') {
    const viaC = (cel: number) => fromC(cel, to);
    routes.push(
      {
        value: viaC(value - 32),
        message: 'Þú drógst 32 frá en gleymdir að deila með 1,8.',
      },
      {
        value: viaC((value - 32) * 1.8),
        message:
          'Þú margfaldaðir með 1,8. Frá °F til °C er deilt: Celsíusgráða er stærri, svo þær eru færri.',
      },
      {
        value: viaC(value / 1.8 - 32),
        message: 'Þú deildir á undan frádrætti. Dragðu fyrst 32 frá og deildu svo með 1,8.',
      }
    );
    if (to === 'K') {
      routes.push({
        value: c,
        message: `Þetta er Celsíustalan, ${withUnit(c, 'C')}. Leggðu 273,15 við til að fá kelvin.`,
      });
    }
  }
  const right = answerOf(item);
  return routes.filter((r) => Math.abs(r.value - right) > TEMPERATURE_TOLERANCE);
}

export type TemperatureVerdict =
  { kind: 'right' } | { kind: 'route'; message: string } | { kind: 'wrong' };

export function judgeTemperature(item: TemperatureItem, typed: number): TemperatureVerdict {
  if (Math.abs(typed - answerOf(item)) <= TEMPERATURE_TOLERANCE) return { kind: 'right' };
  const route = wrongRoutes(item).find((r) => Math.abs(typed - r.value) <= TEMPERATURE_TOLERANCE);
  return route ? { kind: 'route', message: route.message } : { kind: 'wrong' };
}

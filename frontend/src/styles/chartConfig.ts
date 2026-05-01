import theme from './theme';
import { getActiveLocale } from '@/utils/localeSync';

const { chart, text } = theme.palette;

export const CHART_GRID = { strokeDasharray: '3 3', stroke: chart.grid } as const;

export const CHART_TICK = { fill: chart.tick, fontSize: 12 } as const;

export const CHART_TOOLTIP_STYLE = {
  borderRadius: Number(theme.shape.borderRadius) / 2,
  border: `1px solid ${chart.tooltipBorder}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  backgroundColor: chart.tooltipBg,
} as const;

export const CHART_TOOLTIP_LABEL = { color: text.primary } as const;
export const CHART_TOOLTIP_ITEM = { color: text.primary } as const;

export const CHART_COLORS = {
  contribution: chart.contribution,
  expense: chart.expense,
  budget: chart.budget,
  budgetSpent: chart.budgetSpent,
  budgetOver: chart.budgetOver,
  savings: chart.savings,
  balance: chart.balance,
} as const;

export function formatChartCurrency(value: number): string {
  const locale = getActiveLocale();
  return new Intl.NumberFormat(locale, {
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) >= 10_000 ? 1 : 0,
  }).format(value);
}

export function formatChartAxis(value: number): string {
  const locale = getActiveLocale();
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString(locale, { maximumFractionDigits: 0 })}K`;
  }
  return value.toLocaleString(locale);
}

import theme from './theme';

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

export const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
export const formatAxis = (value: number) => `$${value}`;

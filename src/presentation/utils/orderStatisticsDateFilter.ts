import type { Request } from 'express';

/**
 * Misma semántica que en StatisticsController: filter_by, start_date, end_date.
 * Solo filtro por createdAt de la orden.
 */
export function buildOrderDateFilter(query: Request['query']): Record<string, unknown> {
  const { start_date, end_date, filter_by } = query;
  let dateFilter: Record<string, unknown> = {};

  if (filter_by) {
    const now = new Date();
    switch (filter_by) {
      case 'today': {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        dateFilter = {
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        };
        break;
      }
      case 'last_week': {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        dateFilter = { createdAt: { $gte: lastWeek } };
        break;
      }
      case 'last_month': {
        const lastMonth = new Date(now);
        lastMonth.setDate(now.getDate() - 30);
        dateFilter = { createdAt: { $gte: lastMonth } };
        break;
      }
      case 'this_year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: yearStart } };
        break;
      }
      case 'all_time':
        dateFilter = {};
        break;
      default:
        dateFilter = {};
    }
  } else if (start_date || end_date) {
    dateFilter = { createdAt: {} as Record<string, Date> };
    const createdAt = dateFilter.createdAt as Record<string, Date>;
    if (start_date) {
      const startDate = new Date(start_date as string);
      startDate.setHours(0, 0, 0, 0);
      createdAt.$gte = startDate;
    }
    if (end_date) {
      const endDate = new Date(end_date as string);
      endDate.setHours(23, 59, 59, 999);
      createdAt.$lte = endDate;
    }
  }

  return dateFilter;
}

const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export type MonthBucket = { key: string; label: string; year: number; month: number };

/** 12 meses consecutivos terminando en el mes calendario de `anchor` (p. ej. ingresos últimos 12 meses). */
export function getLast12MonthBuckets(anchor: Date): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const label = `${MONTH_LABELS_ES[month - 1]} ${String(year).slice(-2)}`;
    buckets.push({ key, label, year, month });
  }
  return buckets;
}

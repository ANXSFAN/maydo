// 餐厅营业时间 + 取餐时段计算 —— 全站唯一可信源
// 周日=0 / 周一=1 / ... / 周六=6

export const PICKUP_INTERVAL_MIN = 15;
export const PICKUP_BUFFER_MIN = 30; // 厨房准备时间，最早可取餐 = 当前 + 30min

type Segment = readonly [string, string];

const LUNCH: Segment = ["13:00", "16:30"];
const DINNER: Segment = ["20:00", "23:30"];
// 周五 / 周六晚间延长到 24:00（2026-07 门口告示）
const DINNER_LATE: Segment = ["20:00", "24:00"];

// 每天营业，全周两段（午餐 + 晚餐）
const HOURS_BY_DAY: Record<number, readonly Segment[]> = {
  0: [LUNCH, DINNER],
  1: [LUNCH, DINNER],
  2: [LUNCH, DINNER],
  3: [LUNCH, DINNER],
  4: [LUNCH, DINNER],
  5: [LUNCH, DINNER_LATE],
  6: [LUNCH, DINNER_LATE],
};

const toMinutes = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export type ClosedReason = "after_hours";

export type PickupSlots = {
  lunch: string[];
  dinner: string[];
  isClosed: boolean;
  closedReason: ClosedReason | null;
};

export function buildPickupSlots(now: Date): PickupSlots {
  const day = now.getDay();
  const todays = HOURS_BY_DAY[day] ?? [];
  const earliest = now.getHours() * 60 + now.getMinutes() + PICKUP_BUFFER_MIN;

  const segment = (range: Segment | undefined): string[] => {
    if (!range) return [];
    const start = toMinutes(range[0]);
    const end = toMinutes(range[1]);
    const slots: string[] = [];
    for (let t = start; t <= end; t += PICKUP_INTERVAL_MIN) {
      if (t >= earliest) slots.push(fromMinutes(t));
    }
    return slots;
  };

  const lunch = segment(todays[0]);
  const dinner = segment(todays[1]);
  const isClosed = lunch.length === 0 && dinner.length === 0;
  const closedReason: ClosedReason | null = isClosed ? "after_hours" : null;

  return { lunch, dinner, isClosed, closedReason };
}

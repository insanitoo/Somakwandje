import { createRequire } from "node:module";
import { Router, type IRouter, type Request, type Response } from "express";
import { desc, gte, sql } from "drizzle-orm";
import { db, analyticsVisitsTable } from "@workspace/db";
import { GetAnalyticsMetricsQueryParams, TrackVisitBody } from "@workspace/api-zod";

const require = createRequire(import.meta.url);
const geoip = require("geoip-lite") as {
  lookup: (ip: string) => { country?: string } | null;
};

const router: IRouter = Router();
const LOCAL_TIMEZONE_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

router.post("/analytics/visit", async (req, res): Promise<void> => {
  const parsed = TrackVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const countryCode = lookupCountry(getClientIp(req));
  await db.insert(analyticsVisitsTable).values({
    path: parsed.data.path.split("?")[0],
    countryCode,
  });

  res.sendStatus(204);
});

router.get("/analytics/metrics", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GetAnalyticsMetricsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const period = parsed.data.period;
  const start = getPeriodStart(period);
  const where = gte(analyticsVisitsTable.visitedAt, start);
  const dailyLabel = sql<string>`to_char(${analyticsVisitsTable.visitedAt} AT TIME ZONE 'Africa/Luanda', 'YYYY-MM-DD')`;
  const hourLabel = sql<string>`lpad(extract(hour from ${analyticsVisitsTable.visitedAt} AT TIME ZONE 'Africa/Luanda')::text, 2, '0') || ':00'`;

  const [totalRows, dailyRows, hourlyRows, countryRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyticsVisitsTable)
      .where(where),
    db
      .select({ label: dailyLabel, count: sql<number>`count(*)::int` })
      .from(analyticsVisitsTable)
      .where(where)
      .groupBy(dailyLabel)
      .orderBy(desc(dailyLabel)),
    db
      .select({ label: hourLabel, count: sql<number>`count(*)::int` })
      .from(analyticsVisitsTable)
      .where(where)
      .groupBy(hourLabel)
      .orderBy(desc(hourLabel)),
    db
      .select({
        countryCode: analyticsVisitsTable.countryCode,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsVisitsTable)
      .where(where)
      .groupBy(analyticsVisitsTable.countryCode)
      .orderBy(desc(sql<number>`count(*)`)),
  ]);

  const daily = dailyRows
    .map((row) => ({ label: row.label, count: Number(row.count) }))
    .reverse();
  const hourly = hourlyRows
    .map((row) => ({ label: row.label, count: Number(row.count) }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const countries = countryRows.map((row) => ({
    countryCode: row.countryCode,
    count: Number(row.count),
  }));

  res.json({
    period,
    total: Number(totalRows[0]?.count ?? 0),
    mostVisitedDay: findLargest(daily),
    peakHour: findLargest(hourly),
    daily,
    hourly,
    countries,
  });
});

function requireAdmin(req: Request, res: Response, next: () => void) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  next();
}

function getClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  const ip = (value ?? req.socket.remoteAddress ?? "").trim().replace(/^::ffff:/, "");
  return ip || null;
}

function lookupCountry(ip: string | null): string | null {
  if (!ip) return null;
  try {
    return geoip.lookup(ip)?.country ?? null;
  } catch {
    return null;
  }
}

function getPeriodStart(period: "day" | "week" | "month"): Date {
  const localNow = new Date(Date.now() + LOCAL_TIMEZONE_OFFSET_MS);
  const start = new Date(
    Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()),
  );

  if (period === "week") {
    const daysSinceMonday = (start.getUTCDay() + 6) % 7;
    start.setTime(start.getTime() - daysSinceMonday * DAY_MS);
  } else if (period === "month") {
    start.setUTCDate(1);
  }

  return new Date(start.getTime() - LOCAL_TIMEZONE_OFFSET_MS);
}

function findLargest(items: Array<{ label: string; count: number }>) {
  if (items.length === 0) return null;
  return items.reduce((largest, item) => (item.count > largest.count ? item : largest));
}

export default router;
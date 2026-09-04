import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Clock3, Globe2 } from "lucide-react";
import { useGetAnalyticsMetrics } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "day" | "week" | "month";

const periodLabels: Record<Period, string> = {
  day: "Hoje",
  week: "Esta semana",
  month: "Este mês",
};

function countryName(countryCode: string | null) {
  if (!countryCode) return "Desconhecido";
  try {
    return new Intl.DisplayNames(["pt-PT"], { type: "region" }).of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function largestValue(values: Array<{ count: number }>) {
  return Math.max(1, ...values.map((value) => value.count));
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-[hsl(40,10%,85%)] bg-white p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Icon size={16} />
        <span className="text-[11px] tracking-widest uppercase">{label}</span>
      </div>
      <p className="font-serif text-3xl text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-2">{detail}</p>
    </div>
  );
}

export default function MetricsAdmin() {
  const [period, setPeriod] = useState<Period>("day");
  const { data, isLoading, isError } = useGetAnalyticsMetrics({ period });
  const dailyMax = useMemo(() => largestValue(data?.daily ?? []), [data?.daily]);
  const hourlyMax = useMemo(() => largestValue(data?.hourly ?? []), [data?.hourly]);
  const countryMax = useMemo(() => largestValue(data?.countries ?? []), [data?.countries]);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Análise do site</p>
          <h1 className="text-2xl font-semibold text-foreground">Métricas de acesso</h1>
        </div>
        <div className="flex border border-[hsl(40,10%,85%)] bg-white self-start sm:self-auto">
          {(["day", "week", "month"] as Period[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={`px-4 py-2.5 text-xs tracking-wide transition-colors ${
                period === item
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {periodLabels[item]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36 w-full" />)}
        </div>
      ) : isError ? (
        <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          Não foi possível carregar as métricas agora.
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <MetricCard
              icon={BarChart3}
              label="Acessos"
              value={data.total.toLocaleString("pt-PT")}
              detail={periodLabels[period]}
            />
            <MetricCard
              icon={CalendarDays}
              label="Dia mais visitado"
              value={data.mostVisitedDay?.label ?? "—"}
              detail={data.mostVisitedDay ? `${data.mostVisitedDay.count} acessos` : "Sem dados"}
            />
            <MetricCard
              icon={Clock3}
              label="Hora mais visitada"
              value={data.peakHour?.label ?? "—"}
              detail={data.peakHour ? `${data.peakHour.count} acessos` : "Sem dados"}
            />
            <MetricCard
              icon={Globe2}
              label="País principal"
              value={countryName(data.countries[0]?.countryCode ?? null)}
              detail={data.countries[0] ? `${data.countries[0].count} acessos` : "Sem dados"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <section className="border border-[hsl(40,10%,85%)] bg-white p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-medium text-foreground">Acessos por dia</h2>
                  <p className="text-xs text-muted-foreground mt-1">{periodLabels[period]}</p>
                </div>
                <CalendarDays size={18} className="text-muted-foreground" />
              </div>
              {data.daily.length > 0 ? (
                <div className="flex items-end gap-2 h-56 overflow-x-auto pb-7">
                  {data.daily.map((item) => (
                    <div key={item.label} className="min-w-10 h-full flex flex-col items-center justify-end gap-2">
                      <span className="text-[10px] text-muted-foreground">{item.count}</span>
                      <div
                        className="w-full min-h-1 bg-primary/80"
                        style={{ height: `${Math.max(3, (item.count / dailyMax) * 160)}px` }}
                        title={`${item.label}: ${item.count}`}
                      />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-16 text-center">Ainda não há acessos neste período.</p>
              )}
            </section>

            <section className="border border-[hsl(40,10%,85%)] bg-white p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-medium text-foreground">Acessos por país</h2>
                  <p className="text-xs text-muted-foreground mt-1">Origem aproximada por endereço IP</p>
                </div>
                <Globe2 size={18} className="text-muted-foreground" />
              </div>
              {data.countries.length > 0 ? (
                <div className="space-y-4">
                  {data.countries.map((item) => (
                    <div key={item.countryCode ?? "unknown"}>
                      <div className="flex justify-between gap-4 text-sm mb-1.5">
                        <span className="text-foreground">{countryName(item.countryCode)}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted">
                        <div
                          className="h-full bg-primary/80"
                          style={{ width: `${Math.max(2, (item.count / countryMax) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-16 text-center">Ainda não há acessos neste período.</p>
              )}
            </section>
          </div>

          <section className="border border-[hsl(40,10%,85%)] bg-white p-5 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-medium text-foreground">Distribuição por hora</h2>
                <p className="text-xs text-muted-foreground mt-1">Hora local de Luanda</p>
              </div>
              <Clock3 size={18} className="text-muted-foreground" />
            </div>
            {data.hourly.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-5 gap-y-4">
                {data.hourly.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-10 text-xs text-muted-foreground">{item.label}</span>
                    <div className="h-2 bg-muted flex-1">
                      <div
                        className="h-full bg-foreground/70"
                        style={{ width: `${Math.max(3, (item.count / hourlyMax) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Ainda não há acessos neste período.</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
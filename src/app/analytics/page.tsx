"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  BarChart2,
  Globe,
  Clock,
  DollarSign,
  RefreshCw,
  Download,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  unit?: string;
  icon: React.ReactNode;
  subtitle: string;
}

interface TimeRange {
  label: string;
  value: "1h" | "24h" | "7d" | "30d";
}

interface OracleFeedRow {
  pair: string;
  latestPrice: string;
  change24h: number;
  volume24h: string;
  sources: number;
  deviation: string;
  status: "healthy" | "warning" | "degraded";
}

interface RegionRow {
  region: string;
  relayers: number;
  throughput: string;
  uptime: string;
  avgLatency: string;
}

// ---------------------------------------------------------------------------
// Constants — mock analytics data
// ---------------------------------------------------------------------------

const TIME_RANGES: TimeRange[] = [
  { label: "1H", value: "1h" },
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
];

const ORACLE_FEEDS: OracleFeedRow[] = [
  {
    pair: "NGN/XLM",
    latestPrice: "0.000842",
    change24h: 1.24,
    volume24h: "4.2M",
    sources: 8,
    deviation: "0.12%",
    status: "healthy",
  },
  {
    pair: "GHS/XLM",
    latestPrice: "0.000631",
    change24h: -0.87,
    volume24h: "1.8M",
    sources: 6,
    deviation: "0.31%",
    status: "healthy",
  },
  {
    pair: "KES/XLM",
    latestPrice: "0.000512",
    change24h: 2.15,
    volume24h: "950K",
    sources: 5,
    deviation: "0.68%",
    status: "warning",
  },
  {
    pair: "ZAR/XLM",
    latestPrice: "0.003240",
    change24h: -1.40,
    volume24h: "2.1M",
    sources: 7,
    deviation: "0.22%",
    status: "healthy",
  },
  {
    pair: "EGP/XLM",
    latestPrice: "0.000210",
    change24h: 0.55,
    volume24h: "620K",
    sources: 4,
    deviation: "1.04%",
    status: "degraded",
  },
];

const REGION_BREAKDOWN: RegionRow[] = [
  {
    region: "West Africa",
    relayers: 5,
    throughput: "8.4M",
    uptime: "99.97%",
    avgLatency: "38ms",
  },
  {
    region: "East Africa",
    relayers: 3,
    throughput: "3.1M",
    uptime: "99.81%",
    avgLatency: "62ms",
  },
  {
    region: "Southern Africa",
    relayers: 4,
    throughput: "5.9M",
    uptime: "99.95%",
    avgLatency: "44ms",
  },
  {
    region: "North Africa",
    relayers: 2,
    throughput: "1.7M",
    uptime: "99.60%",
    avgLatency: "71ms",
  },
];

// Simulated sparkline data points (30 buckets)
function generateSparkline(base: number, volatility: number): number[] {
  const result: number[] = [];
  let v = base;
  for (let i = 0; i < 30; i++) {
    v = v + (Math.random() - 0.48) * volatility;
    result.push(Math.max(0, v));
  }
  return result;
}

const SPARKLINE_REQUESTS = generateSparkline(420000, 25000);
const SPARKLINE_LATENCY = generateSparkline(45, 4);
const SPARKLINE_REVENUE = generateSparkline(1800, 120);

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({
  title,
  value,
  trend,
  unit,
  icon,
  subtitle,
}: MetricCardProps) {
  const positive = trend >= 0;
  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <span className="text-gray-500">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-gray-500 text-sm">{unit}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            positive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {positive ? (
            <TrendingUp size={11} />
          ) : (
            <TrendingDown size={11} />
          )}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-gray-500">{subtitle}</span>
      </div>
    </div>
  );
}

function MiniSparkline({
  data,
  color = "#10b981",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const step = w / (data.length - 1);

  const points = data
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(1)}`
    )
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

function StatusDot({ status }: { status: OracleFeedRow["status"] }) {
  const map: Record<OracleFeedRow["status"], string> = {
    healthy: "bg-emerald-400",
    warning: "bg-yellow-400",
    degraded: "bg-red-400",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${map[status]}`}
      aria-label={status}
    />
  );
}

function StatusBadge({ status }: { status: OracleFeedRow["status"] }) {
  const map: Record<
    OracleFeedRow["status"],
    { bg: string; text: string; label: string }
  > = {
    healthy: {
      bg: "bg-emerald-500/10 border border-emerald-500/20",
      text: "text-emerald-400",
      label: "Healthy",
    },
    warning: {
      bg: "bg-yellow-500/10 border border-yellow-500/20",
      text: "text-yellow-400",
      label: "Warning",
    },
    degraded: {
      bg: "bg-red-500/10 border border-red-500/20",
      text: "text-red-400",
      label: "Degraded",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}
    >
      <StatusDot status={status} />
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Bar chart (pure SVG, no Chart.js dependency)
// ---------------------------------------------------------------------------

function SimpleBarChart({
  data,
  labels,
  color = "#3b82f6",
  height = 160,
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data) || 1;
  const barWidth = 28;
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalWidth} ${height + 24}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Bar chart"
      role="img"
    >
      {data.map((v, i) => {
        const barH = Math.max(4, (v / max) * height);
        const x = i * (barWidth + gap);
        const y = height - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.8}
            />
            <text
              x={x + barWidth / 2}
              y={height + 16}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.35)"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange["value"]>("24h");

  // Derive bar chart data from time range selection (mock)
  const barData = useMemo(() => {
    const multiplier = { "1h": 0.4, "24h": 1, "7d": 6.8, "30d": 28 }[
      timeRange
    ];
    return SPARKLINE_REQUESTS.slice(0, 12).map((v) =>
      Math.round(v * multiplier)
    );
  }, [timeRange]);

  const barLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, 12);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Admin / Insights</p>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Network throughput, oracle feed health, and regional relay
            performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div
            role="group"
            aria-label="Time range"
            className="flex gap-1 bg-[#161b22] border border-gray-800 rounded-lg p-1"
          >
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setTimeRange(r.value)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors duration-150 ${
                  timeRange === r.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-pressed={timeRange === r.value}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            className="flex items-center gap-2 bg-[#161b22] border border-gray-800 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            className="flex items-center gap-2 bg-[#161b22] border border-gray-800 text-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            aria-label="Export report"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* KPI metric row */}
      <section
        aria-label="Key performance indicators"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <MetricCard
          title="Total Requests"
          value="17.4M"
          trend={8.3}
          subtitle="vs last period"
          icon={<Activity size={18} />}
        />
        <MetricCard
          title="Avg Response Time"
          value="43"
          unit="ms"
          trend={-5.1}
          subtitle="lower is better"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title="Fee Revenue"
          value="9,820"
          unit="XLM"
          trend={12.7}
          subtitle="vs last period"
          icon={<DollarSign size={18} />}
        />
        <MetricCard
          title="Oracle Submissions"
          value="284K"
          trend={3.2}
          subtitle="unique price updates"
          icon={<BarChart2 size={18} />}
        />
      </section>

      {/* Chart row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Request volume bar chart */}
        <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold">Request Volume</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Oracle API calls per period bucket
              </p>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {timeRange.toUpperCase()} window
            </span>
          </div>
          <SimpleBarChart
            data={barData}
            labels={barLabels}
            color="#3b82f6"
            height={140}
          />
        </div>

        {/* Sparkline trio */}
        <div className="flex flex-col gap-4">
          {(
            [
              {
                label: "Requests / min",
                data: SPARKLINE_REQUESTS,
                color: "#3b82f6",
                value: "428K",
              },
              {
                label: "Avg Latency (ms)",
                data: SPARKLINE_LATENCY,
                color: "#10b981",
                value: "43ms",
              },
              {
                label: "Fee Revenue (XLM)",
                data: SPARKLINE_REVENUE,
                color: "#f59e0b",
                value: "1,820",
              },
            ] as const
          ).map((item) => (
            <div
              key={item.label}
              className="bg-[#161b22] border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">
                  {item.label}
                </p>
                <p className="text-xl font-bold tabular-nums">{item.value}</p>
              </div>
              <MiniSparkline data={[...item.data]} color={item.color} />
            </div>
          ))}
        </div>
      </section>

      {/* Oracle feed health table */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Oracle Feed Health</h2>
          <span className="text-xs text-gray-500">
            {ORACLE_FEEDS.filter((f) => f.status === "healthy").length} /{" "}
            {ORACLE_FEEDS.length} feeds healthy
          </span>
        </div>
        <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Asset Pair</th>
                  <th className="px-6 py-4 font-medium">Latest Price</th>
                  <th className="px-6 py-4 font-medium">24h Change</th>
                  <th className="px-6 py-4 font-medium">Volume (24h)</th>
                  <th className="px-6 py-4 font-medium">Sources</th>
                  <th className="px-6 py-4 font-medium">Max Deviation</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ORACLE_FEEDS.map((feed) => (
                  <tr
                    key={feed.pair}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-white">
                      {feed.pair}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-300">
                      {feed.latestPrice}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          feed.change24h >= 0
                            ? "text-emerald-400 font-bold"
                            : "text-rose-400 font-bold"
                        }
                      >
                        {feed.change24h >= 0 ? "+" : ""}
                        {feed.change24h}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 tabular-nums">
                      {feed.volume24h}
                    </td>
                    <td className="px-6 py-4 text-gray-300 tabular-nums">
                      {feed.sources}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-300">
                      {feed.deviation}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={feed.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Regional breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-gray-400" />
          <h2 className="text-lg font-semibold">Regional Relay Performance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGION_BREAKDOWN.map((region) => (
            <div
              key={region.region}
              className="bg-[#161b22] border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  {region.region}
                </h3>
                <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">
                  {region.relayers} nodes
                </span>
              </div>
              <div className="space-y-2.5">
                <DataRow label="Throughput" value={region.throughput} />
                <DataRow label="Uptime" value={region.uptime} />
                <DataRow label="Avg Latency" value={region.avgLatency} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 tabular-nums font-medium">{value}</span>
    </div>
  );
}

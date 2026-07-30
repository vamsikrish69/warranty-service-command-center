import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  Phone,
  MessageSquare,
  Facebook,
  Share2,
  ShieldCheck,
  ClipboardList,
  Wrench,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  XCircle,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  RefreshCw,
  ChevronRight,
  Gauge,
  Filter
} from "lucide-react";

function mulberry32(seed) {
  return function () {
    seed = seed | 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(4471);
const R = (min, max) => min + rng() * (max - min);
const RI = (min, max) => Math.round(R(min, max));

const CHANNELS = [
  { name: "Voice", icon: Phone },
  { name: "Chat", icon: MessageSquare },
  { name: "Facebook", icon: Facebook },
  { name: "Social Media", icon: Share2 }
];

const REGIONS = ["United States", "Canada", "United Kingdom", "India"];

const ISSUES = [
  "HARDWARE_FAILURE",
  "NO_POWER",
  "WINDOWS_ISSUE",
  "DISPLAY_ISSUE",
  "BATTERY_ISSUE",
  "NO_BOOT",
  "NETWORK_ISSUE",
  "KEYBOARD_TOUCHPAD_ISSUE",
  "NO_VIDEO",
  "NO_POST",
  "OSRI",
  "OTHER"
];

const WARRANTY_TYPES = [
  "1 Year Mail-In",
  "1 Year Onsite",
  "2 Year Onsite",
  "3 Year Onsite"
];

const PRIORITIES = [
  "P1 - Critical",
  "P2 - High",
  "P3 - Medium",
  "P4 - Low"
];

const STAGES = [
  { key: "contact", label: "Customer contact", icon: Phone },
  { key: "troubleshoot", label: "Troubleshooting", icon: Activity },
  { key: "warranty", label: "Warranty validation", icon: ShieldCheck },
  { key: "request", label: "Service request", icon: ClipboardList },
  { key: "repair", label: "Repair fulfillment", icon: Wrench },
  { key: "resolution", label: "Case resolution", icon: PackageCheck },
  { key: "closure", label: "Case closure", icon: CheckCircle2 }
];

function buildData() {
  const matrix = [];

  REGIONS.forEach((region) => {
    CHANNELS.forEach((channel) => {
      const volume = RI(180, 640);
      matrix.push({
        region,
        channel: channel.name,
        volume,
        slaPct: R(78, 96),
        escalationPct: R(3, 11),
        repeatPct: R(5, 15),
        avgRepairDays: R(2.8, 7.2)
      });
    });
  });

  const totalContacts = matrix.reduce((total, row) => total + row.volume, 0);

  let stageVolume = totalContacts;
  const dropRates = [0.086, 0.108, 0.113, 0.106, 0.052, 0.043];
  const stageVolumes = [stageVolume];

  dropRates.forEach((dropRate) => {
    stageVolume = Math.round(stageVolume * (1 - dropRate));
    stageVolumes.push(stageVolume);
  });

  const slaByPriority = PRIORITIES.map((priority, index) => {
    const targetHours = [4, 24, 72, 120][index];
    const adherence = [91.2, 88.4, 84.9, 79.3][index] + R(-2, 2);
    return {
      priority,
      targetHours,
      adherencePct: Math.min(99, Math.max(60, adherence)),
      breaches: RI(8, 140)
    };
  });

  const repairByWarranty = WARRANTY_TYPES.map((warrantyType) => ({
    type: warrantyType,
    avgDays: warrantyType.includes("Mail-In") ? R(6.5, 8.4) : R(2.2, 3.6),
    completionPct: R(85, 97)
  }));

  const activeContacts = Math.round(totalContacts * R(0.6, 0.7));
  const expiredContacts = Math.round(totalContacts * R(0.14, 0.2));
  const noneContacts = totalContacts - activeContacts - expiredContacts;
  const mailInShare = R(30, 42);

  const warrantyUtilization = {
    active: activeContacts,
    expired: expiredContacts,
    none: noneContacts,
    mailInPct: mailInShare,
    onsitePct: 100 - mailInShare
  };

  const issueTrends = ISSUES.map((issue) => ({
    name: issue,
    volume: RI(140, 980),
    repeatPct: R(4, 22),
    trend: R(-1, 1) > 0 ? "up" : "down",
    trendPct: R(2, 18)
  })).sort((a, b) => b.volume - a.volume);

  const sourceFiles = [
    "customers.json",
    "product_assets.json",
    "customer_contacts.json",
    "warranty_entitlements.json",
    "service_requests.json",
    "repair_events.json",
    "case_closures.json"
  ];

  const loadAudit = sourceFiles.map((file, index) => ({
    file,
    batch: `BATCH_${String(2200 + index).padStart(5, "0")}`,
    records: RI(1200, 9800),
    loadedAt: `2026-07-30 0${RI(1, 6)}:${String(RI(0, 59)).padStart(2, "0")} UTC`,
    status: rng() > 0.08 ? "success" : "warning"
  }));

  const dqChecks = [
    { name: "Row count validation", status: "pass" },
    { name: "Primary key completeness", status: "pass" },
    { name: "Duplicate record scan", status: "pass" },
    { name: "Relationship integrity", status: rng() > 0.15 ? "pass" : "warn" },
    { name: "Warranty date validity", status: "pass" },
    { name: "Channel value validation", status: "pass" }
  ];

  return {
    matrix,
    totalContacts,
    stageVolumes,
    slaByPriority,
    repairByWarranty,
    warrantyUtilization,
    issueTrends,
    loadAudit,
    dqChecks
  };
}

const DATA = buildData();

function fmt(value) {
  return Math.round(value).toLocaleString("en-US");
}

function pct(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

function filterMatrix(region, channel) {
  return DATA.matrix.filter((row) => {
    const regionMatch = region === "All" || row.region === region;
    const channelMatch = channel === "All" || row.channel === channel;
    return regionMatch && channelMatch;
  });
}

function weightedAvg(rows, key) {
  const totalVolume = rows.reduce((total, row) => total + row.volume, 0);
  if (!totalVolume) return 0;
  return rows.reduce((total, row) => total + row[key] * row.volume, 0) / totalVolume;
}

function StatusChip({ status }) {
  const map = {
    pass: { color: "var(--good)", Icon: CheckCircle2, label: "Pass" },
    success: { color: "var(--good)", Icon: CheckCircle2, label: "Success" },
    warn: { color: "var(--warn)", Icon: AlertTriangle, label: "Warn" },
    warning: { color: "var(--warn)", Icon: AlertTriangle, label: "Warn" },
    fail: { color: "var(--bad)", Icon: XCircle, label: "Fail" }
  };
  const selectedStatus = map[status] || map.pass;
  const Icon = selectedStatus.Icon;
  return (
    <span className="chip" style={{ color: selectedStatus.color, borderColor: selectedStatus.color }}>
      <Icon size={12} strokeWidth={2.5} />
      {selectedStatus.label}
    </span>
  );
}

function KpiCard({ label, value, sub, trend, icon: Icon, tone }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <Icon size={15} strokeWidth={1.8} color="var(--text-dim)" />
      </div>
      <div className="kpi-value" style={{ color: tone || "var(--text)" }}>
        {value}
      </div>
      {sub && (
        <div className="kpi-sub">
          {trend === "up" && <TrendingUp size={12} color="var(--good)" />}
          {trend === "down" && <TrendingDown size={12} color="var(--bad)" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

function Panel({ title, eyebrow, children, right }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-eyebrow">{eyebrow}</div>
          <div className="panel-title">{title}</div>
        </div>
        {right}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  background: "#1B2320",
  border: "1px solid #303B34",
  borderRadius: 6,
  color: "#E7EEE9",
  fontSize: 12,
  fontFamily: "IBM Plex Mono, monospace"
};

export default function WarrantyCommandCenter() {
  const [region, setRegion] = useState("All");
  const [channel, setChannel] = useState("All");
  const [tab, setTab] = useState("sla");

  const rows = useMemo(() => filterMatrix(region, channel), [region, channel]);
  const scopeVolume = rows.reduce((total, row) => total + row.volume, 0);
  const scopeRatio = scopeVolume / DATA.totalContacts;
  const slaAdherence = weightedAvg(rows, "slaPct");
  const escalationRate = weightedAvg(rows, "escalationPct");
  const repeatRate = weightedAvg(rows, "repeatPct");
  const avgRepair = weightedAvg(rows, "avgRepairDays");
  const warrantyUtilPct = (DATA.warrantyUtilization.active / DATA.totalContacts) * 100;
  const stageVolumesScaled = DATA.stageVolumes.map((volume) => Math.round(volume * scopeRatio));

  const channelBars = CHANNELS.map((channelItem) => {
    const channelRows = rows.filter((row) => row.channel === channelItem.name);
    return {
      name: channelItem.name,
      volume: channelRows.reduce((total, row) => total + row.volume, 0)
    };
  }).filter((row) => row.volume > 0);

  const regionBars = REGIONS.map((regionName) => {
    const regionRows = rows.filter((row) => row.region === regionName);
    return {
      name: regionName,
      volume: regionRows.reduce((total, row) => total + row.volume, 0)
    };
  }).filter((row) => row.volume > 0);

  const tabs = [
    { id: "sla", label: "SLA and Repair" },
    { id: "warranty", label: "Warranty" },
    { id: "channel", label: "Channel and Region" },
    { id: "issues", label: "Product Issues" },
    { id: "monitor", label: "Pipeline Monitoring" }
  ];

  return (
    <div className="cc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .cc-root { --bg: #10140F; --panel: #171C15; --panel-raised: #1D231C; --border: #2A322A; --text: #E9EEE4; --text-dim: #8B9682; --good: #4EC08F; --warn: #E3A23C; --bad: #E2585B; --info: #6EA8DC; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; border-radius: 12px; padding: 20px; min-height: 100vh; }
        .cc-root * { box-sizing: border-box; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .display { font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.04em; }
        .cc-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 18px; }
        .cc-title { font-size: 26px; font-weight: 700; line-height: 1; }
        .cc-title span { color: var(--good); }
        .cc-subtitle { font-size: 12px; color: var(--text-dim); margin-top: 6px; }
        .cc-status { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--panel-raised); border: 1px solid var(--border); border-radius: 6px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--good); box-shadow: 0 0 6px var(--good); }
        .cc-status-text { font-size: 11px; color: var(--text-dim); }
        .cc-status-text b { color: var(--text); font-family: 'IBM Plex Mono', monospace; }
        .filters { display: flex; gap: 8px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .filters label { font-size: 11px; color: var(--text-dim); display: flex; align-items: center; gap: 5px; }
        select { background: var(--panel-raised); color: var(--text); border: 1px solid var(--border); border-radius: 5px; padding: 5px 8px; font-size: 12px; font-family: 'Inter', sans-serif; }
        .conveyor { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 22px 18px 16px; margin-bottom: 20px; overflow-x: auto; }
        .conveyor-label { font-size: 11px; color: var(--text-dim); margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
        .conveyor-track { display: flex; align-items: stretch; min-width: 760px; }
        .stage-node { flex: 1; text-align: center; position: relative; padding: 0 4px; }
        .stage-icon-wrap { width: 40px; height: 40px; border-radius: 50%; background: var(--panel-raised); border: 1px solid var(--good); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
        .stage-vol { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 500; }
        .stage-name { font-size: 10.5px; color: var(--text-dim); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.03em; }
        .stage-connector { position: absolute; top: 20px; left: 50%; width: 100%; height: 1px; background: repeating-linear-gradient(90deg, var(--good) 0 6px, transparent 6px 11px); z-index: 0; }
        .stage-drop { font-size: 9.5px; color: var(--bad); font-family: 'IBM Plex Mono', monospace; margin-top: 2px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px; }
        .kpi-card { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
        .kpi-top { display: flex; justify-content: space-between; align-items: center; }
        .kpi-label { font-size: 10.5px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.03em; }
        .kpi-value { font-family: 'IBM Plex Mono', monospace; font-size: 22px; margin-top: 6px; }
        .kpi-sub { font-size: 10.5px; color: var(--text-dim); display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .tabbar { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 16px; flex-wrap: wrap; }
        .tab-btn { background: none; border: none; color: var(--text-dim); font-size: 12.5px; padding: 8px 14px; cursor: pointer; border-bottom: 2px solid transparent; font-family: 'Inter', sans-serif; font-weight: 500; }
        .tab-btn.active { color: var(--good); border-bottom-color: var(--good); }
        .tab-btn:hover:not(.active) { color: var(--text); }
        .grid-2 { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px; }
        .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .panel-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--border); }
        .panel-eyebrow { font-size: 9.5px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; font-family: 'IBM Plex Mono', monospace; }
        .panel-title { font-size: 14px; font-weight: 600; margin-top: 2px; }
        .panel-body { padding: 14px; }
        table.data { width: 100%; border-collapse: collapse; font-size: 12px; }
        table.data th { text-align: left; color: var(--text-dim); font-weight: 500; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.02em; padding: 5px 8px; border-bottom: 1px solid var(--border); }
        table.data td { padding: 7px 8px; border-bottom: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; }
        table.data tr:last-child td { border-bottom: none; }
        .chip { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 7px; border: 1px solid; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
        .legend-row { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; color: var(--text-dim); margin-top: 10px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 5px; }
        .dq-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; }
        .dq-row:last-child { border-bottom: none; }
        .footnote { font-size: 10.5px; color: var(--text-dim); margin-top: 16px; display: flex; align-items: center; gap: 6px; }
        @media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="cc-header">
        <div>
          <div className="cc-title display">Warranty ops <span>// command center</span></div>
          <div className="cc-subtitle">Service request and repair lifecycle - contact through case closure</div>
        </div>
        <div className="cc-status">
          <span className="dot" />
          <span className="cc-status-text">Pipeline health <b>99.1%</b> | last batch <b>04:12 UTC</b></span>
        </div>
      </div>

      <div className="filters">
        <Filter size={13} color="var(--text-dim)" />
        <label>
          Region
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option>All</option>
            {REGIONS.map((regionName) => <option key={regionName}>{regionName}</option>)}
          </select>
        </label>
        <label>
          Channel
          <select value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option>All</option>
            {CHANNELS.map((channelItem) => <option key={channelItem.name}>{channelItem.name}</option>)}
          </select>
        </label>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          Scope: <span className="mono" style={{ color: "var(--text)" }}>{fmt(scopeVolume)}</span> contacts ({pct(scopeRatio * 100, 0)} of total)
        </span>
      </div>

      <div className="conveyor">
        <div className="conveyor-label"><Gauge size={13} />Lifecycle flow - customer contact to case closure</div>
        <div className="conveyor-track">
          {STAGES.map((stage, index) => {
            const volume = stageVolumesScaled[index];
            const previousVolume = index > 0 ? stageVolumesScaled[index - 1] : null;
            const dropPct = previousVolume ? (((previousVolume - volume) / previousVolume) * 100).toFixed(1) : null;
            const Icon = stage.icon;
            return (
              <div className="stage-node" key={stage.key}>
                {index > 0 && <div className="stage-connector" />}
                <div className="stage-icon-wrap" style={{ position: "relative", zIndex: 1 }}>
                  <Icon size={17} color="var(--good)" strokeWidth={1.8} />
                </div>
                <div className="stage-vol">{fmt(volume)}</div>
                <div className="stage-name">{stage.label}</div>
                {dropPct && <div className="stage-drop">-{dropPct}%</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Service requests" value={fmt(rows.reduce((total, row) => total + row.volume, 0))} sub="last 30 days" icon={ClipboardList} />
        <KpiCard label="SLA adherence" value={pct(slaAdherence)} sub={slaAdherence > 85 ? "on target" : "below target"} trend={slaAdherence > 85 ? "up" : "down"} icon={Clock} tone={slaAdherence > 85 ? "var(--good)" : "var(--warn)"} />
        <KpiCard label="Avg repair turnaround" value={`${avgRepair.toFixed(1)}d`} sub="mail-in and onsite blended" icon={Wrench} />
        <KpiCard label="Warranty utilization" value={pct(warrantyUtilPct)} sub="active entitlement coverage" icon={ShieldCheck} />
        <KpiCard label="Escalation rate" value={pct(escalationRate)} sub="of total requests" trend="down" icon={AlertTriangle} tone={escalationRate > 8 ? "var(--warn)" : "var(--text)"} />
        <KpiCard label="Repeat requests" value={pct(repeatRate)} sub="same asset, 30-day window" icon={RefreshCw} />
      </div>

      <div className="tabbar">
        {tabs.map((tabItem) => (
          <button key={tabItem.id} className={`tab-btn ${tab === tabItem.id ? "active" : ""}`} onClick={() => setTab(tabItem.id)}>
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "sla" && (
        <div className="grid-2">
          <Panel eyebrow="MART_SLA_ADHERENCE" title="SLA adherence by priority">
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={DATA.slaByPriority} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232B22" vertical={false} />
                  <XAxis dataKey="priority" tick={{ fill: "#8B9682", fontSize: 10 }} axisLine={{ stroke: "#2A322A" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8B9682", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="adherencePct" radius={[4, 4, 0, 0]}>
                    {DATA.slaByPriority.map((row, index) => <Cell key={index} fill={row.adherencePct >= 85 ? "#4EC08F" : "#E3A23C"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="data" style={{ marginTop: 8 }}>
              <thead><tr><th>Priority</th><th>Target</th><th>Breaches</th></tr></thead>
              <tbody>
                {DATA.slaByPriority.map((row) => (
                  <tr key={row.priority}>
                    <td style={{ fontFamily: "Inter", color: "var(--text)" }}>{row.priority}</td>
                    <td>{row.targetHours}h</td>
                    <td style={{ color: row.breaches > 80 ? "var(--bad)" : "var(--text-dim)" }}>{row.breaches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel eyebrow="MART_REPAIR_TURNAROUND_PERFORMANCE" title="Repair turnaround by warranty type">
            <table className="data">
              <thead><tr><th>Warranty type</th><th>Avg days</th><th>Completion</th></tr></thead>
              <tbody>
                {DATA.repairByWarranty.map((row) => (
                  <tr key={row.type}>
                    <td style={{ fontFamily: "Inter", color: "var(--text)" }}>{row.type}</td>
                    <td>{row.avgDays.toFixed(1)}d</td>
                    <td style={{ color: "var(--good)" }}>{row.completionPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="footnote"><TrendingDown size={12} />Onsite repairs average faster than mail-in repairs across all regions.</div>
          </Panel>
        </div>
      )}

      {tab === "warranty" && (
        <div className="grid-2">
          <Panel eyebrow="MART_WARRANTY_UTILIZATION" title="Coverage status">
            <div style={{ width: "100%", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[{ name: "Active", value: DATA.warrantyUtilization.active }, { name: "Expired", value: DATA.warrantyUtilization.expired }, { name: "No warranty", value: DATA.warrantyUtilization.none }]} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    <Cell fill="#4EC08F" />
                    <Cell fill="#E3A23C" />
                    <Cell fill="#3A453A" />
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel eyebrow="INT_WARRANTY_VALIDATION" title="Service delivery mix">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ flex: 1 }}><div className="kpi-label" style={{ marginBottom: 6 }}>Mail-in</div><div className="kpi-value" style={{ fontSize: 26 }}>{DATA.warrantyUtilization.mailInPct.toFixed(1)}%</div></div>
              <div style={{ width: 1, height: 40, background: "var(--border)" }} />
              <div style={{ flex: 1 }}><div className="kpi-label" style={{ marginBottom: 6 }}>Onsite</div><div className="kpi-value" style={{ fontSize: 26 }}>{DATA.warrantyUtilization.onsitePct.toFixed(1)}%</div></div>
            </div>
            <div className="footnote"><ShieldCheck size={12} />Onsite plans dominate volume in onsite-eligible regions.</div>
          </Panel>
        </div>
      )}

      {tab === "channel" && (
        <div className="grid-2">
          <Panel eyebrow="MART_CHANNEL_REGION_PERFORMANCE" title="Volume by channel">
            <div style={{ width: "100%", height: 200 }}><ResponsiveContainer><BarChart data={channelBars} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#232B22" horizontal={false} /><XAxis type="number" tick={{ fill: "#8B9682", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" tick={{ fill: "#C7D0C1", fontSize: 11 }} axisLine={false} tickLine={false} width={90} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt(value)} /><Bar dataKey="volume" fill="#4EC08F" radius={[0, 4, 4, 0]} barSize={16} /></BarChart></ResponsiveContainer></div>
          </Panel>
          <Panel eyebrow="MART_CHANNEL_REGION_PERFORMANCE" title="Volume by region">
            <div style={{ width: "100%", height: 200 }}><ResponsiveContainer><BarChart data={regionBars} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#232B22" horizontal={false} /><XAxis type="number" tick={{ fill: "#8B9682", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" tick={{ fill: "#C7D0C1", fontSize: 11 }} axisLine={false} tickLine={false} width={100} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt(value)} /><Bar dataKey="volume" fill="#6EA8DC" radius={[0, 4, 4, 0]} barSize={16} /></BarChart></ResponsiveContainer></div>
          </Panel>
        </div>
      )}

      {tab === "issues" && (
        <Panel eyebrow="MART_PRODUCT_ISSUE_TRENDS" title="Issue category volume">
          <div style={{ width: "100%", height: 340 }}><ResponsiveContainer><BarChart data={DATA.issueTrends} layout="vertical" margin={{ left: 30 }}><CartesianGrid strokeDasharray="3 3" stroke="#232B22" horizontal={false} /><XAxis type="number" tick={{ fill: "#8B9682", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" tick={{ fill: "#C7D0C1", fontSize: 10 }} axisLine={false} tickLine={false} width={150} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => fmt(value)} /><Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={14}>{DATA.issueTrends.map((row, index) => <Cell key={index} fill={row.repeatPct > 14 ? "#E3A23C" : "#4EC08F"} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Panel>
      )}

      {tab === "monitor" && (
        <div className="grid-2">
          <Panel eyebrow="DATA QUALITY FRAMEWORK" title="Validation checks">
            {DATA.dqChecks.map((check) => <div className="dq-row" key={check.name}><span>{check.name}</span><StatusChip status={check.status} /></div>)}
          </Panel>
          <Panel eyebrow="INCREMENTAL LOAD AUDIT" title="Source file batches">
            <table className="data"><thead><tr><th>Source</th><th>Batch</th><th>Records</th><th>Status</th></tr></thead><tbody>{DATA.loadAudit.map((load) => <tr key={load.file}><td style={{ color: "var(--text)" }}>{load.file}</td><td style={{ color: "var(--text-dim)" }}>{load.batch}</td><td>{fmt(load.records)}</td><td><StatusChip status={load.status} /></td></tr>)}</tbody></table>
          </Panel>
          <div style={{ gridColumn: "1 / -1" }}>
            <Panel eyebrow="PIPELINE HEALTH" title="Load success trend">
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <KpiCard label="Load success rate" value="99.1%" icon={Database} />
                <KpiCard label="Batches today" value="7 / 7" icon={CheckCircle2} />
                <KpiCard label="Avg load latency" value="3.4m" icon={Clock} />
                <KpiCard label="DQ checks passing" value={`${DATA.dqChecks.filter((check) => check.status === "pass").length} / ${DATA.dqChecks.length}`} icon={ShieldCheck} />
              </div>
            </Panel>
          </div>
        </div>
      )}

      <div className="footnote" style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <ChevronRight size={12} />
        Illustrative data generated to match the RAW to STAGING to INTERMEDIATE to MARTS schema in the source repository. Connect Snowflake MARTS views to replace with live figures.
      </div>
    </div>
  );
}


import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { money, dateLong } from '../../utils/format.js';

/**
 * Daily spend bars for the last N days.
 * Weekend bars use the warn color so the eye spots weekend overspend at a glance —
 * this is the same signal the agent's `insights` skill will flag in Step 7.
 */
export default function SpendBar({ data, currency }) {
  if (!data || data.length === 0) {
    return <div className="placeholder-card" style={{ border: 'none' }}>Not enough data to draw a trend yet.</div>;
  }

  const accent = cssVar('--c-primary') || '#6ea8ff';
  const warn   = cssVar('--c-warn')    || '#ffb454';
  const grid   = cssVar('--c-text-dim')|| '#6c7aa8';

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="short"
          tick={{ fill: grid, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={Math.max(0, Math.floor(data.length / 8))}
        />
        <YAxis
          tick={{ fill: grid, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => '$' + Math.round(v)}
          width={48}
        />
        <Tooltip cursor={{ fill: 'rgba(110,168,255,.06)' }} content={<BarTip currency={currency} />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d) => {
            const day = new Date(d.date).getDay();
            const isWeekend = day === 0 || day === 6;
            return <Cell key={d.date} fill={isWeekend ? warn : accent} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function BarTip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip">
      <div className="chart-tip-title">{dateLong(p.date)}</div>
      <div>{p.value > 0 ? money(-p.value, currency) : 'No spending'}</div>
    </div>
  );
}

function cssVar(name) {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

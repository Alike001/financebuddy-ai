import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { money } from '../../utils/format.js';

/**
 * Donut chart showing share of monthly expenses per category.
 *
 * Recharts notes:
 *   - `Pie` needs `dataKey` to know which field is the value
 *   - `Cell` lets us color each slice from our category palette
 *   - colors come in via CSS variables, but recharts paints with raw colors,
 *     so we resolve the var() via getComputedStyle once per render
 */
export default function CategoryPie({ data, currency }) {
  if (!data || data.length === 0) {
    return <div className="placeholder-card" style={{ border: 'none' }}>No expenses to chart yet.</div>;
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const resolved = data.map((d) => ({ ...d, fill: resolveColor(d.color) }));

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={resolved}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={96}
            paddingAngle={2}
            stroke="none"
          >
            {resolved.map((d) => (
              <Cell key={d.id} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip content={<PieTip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="chart-center">
        <div className="chart-center-label">Total spent</div>
        <div className="chart-center-value">{money(-total, currency)}</div>
      </div>

      <ul className="legend">
        {data.slice(0, 6).map((d) => (
          <li key={d.id} className="legend-row">
            <span className="legend-dot" style={{ background: d.color }} />
            <span className="legend-label">{d.label}</span>
            <span className="legend-pct">{Math.round(d.pct * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PieTip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tip">
      <div className="chart-tip-title" style={{ color: p.fill }}>{p.label}</div>
      <div>{money(-p.value, currency)} · {Math.round(p.pct * 100)}%</div>
    </div>
  );
}

/** Turn 'var(--cat-food)' into the actual computed color string. */
function resolveColor(value) {
  if (typeof value !== 'string' || !value.startsWith('var(')) return value;
  const name = value.slice(4, -1).trim();   // --cat-food
  if (typeof document === 'undefined') return '#888';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
}

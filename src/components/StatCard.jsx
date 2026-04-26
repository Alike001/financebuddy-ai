/**
 * Stat tile used across the dashboard. `tone` gives it a subtle accent stripe.
 * Pass `progress` (0..1) to render a thin progress bar underneath the value
 * — used by the savings-goal card.
 */
export default function StatCard({ label, value, hint, tone = 'default', progress }) {
  return (
    <div className={'card stat-card stat-card-' + tone}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-delta">{hint}</div>}
      {typeof progress === 'number' && (
        <div className="stat-progress">
          <div
            className="stat-progress-bar"
            style={{ width: Math.round(progress * 100) + '%' }}
          />
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Onboarding() {
  return (
    <section className="onboarding">
      <div className="onboarding-card">
        <h1>Welcome to FinanceBuddy AI</h1>
        <p>Onboarding wizard arrives in step 4. For now, jump straight in.</p>
        <Link className="btn btn-primary" to="/">Open dashboard</Link>
      </div>
    </section>
  );
}

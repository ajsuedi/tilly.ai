// Fallback only — the config-level redirect in next.config.mjs sends / to the CRM.
// This client-side hop covers any environment that skips config redirects.
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => { window.location.replace('/app/index.html'); }, []);
  return <p style={{ fontFamily: 'monospace', padding: 24 }}>Redirecting to the CRM…</p>;
}

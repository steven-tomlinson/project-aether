import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// ------------------------------------------------------------------
// CRITICAL SETUP INSTRUCTIONS:
// 1. Go to Google Cloud Console > Credentials.
// 2. Open the OAuth 2.0 Client ID you created.
// 3. COPY that Client ID and paste it below.
// 4. Ensure "Authorized JavaScript origins" matches your current URL exactly.
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// DYNAMIC CLIENT ID SELECTION
// ------------------------------------------------------------------
const PROD_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "558552268704-mino3vnuca14jma9eoe3pvlmrl6qn197.apps.googleusercontent.com";
const STAGING_CLIENT_ID = process.env.STAGING_CLIENT_ID;

const isStaging = window.location.hostname.includes('aether-app-staging') || window.location.hostname.includes('staging');
const GOOGLE_CLIENT_ID = (isStaging && STAGING_CLIENT_ID) ? STAGING_CLIENT_ID : PROD_CLIENT_ID;

console.log(`AUTH_CONFIG: Using ${isStaging ? 'Staging' : 'Production'} Client ID`);

// HELPER: This component displays the exact URL you need to add to Google Cloud Console
const ConfigHelper = () => {
  const origin = window.location.origin;

  if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
        color: '#ffb000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', textAlign: 'center', padding: '20px'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️ SETUP REQUIRED</h1>
        <p>You must open <code>index.tsx</code> and replace <code>YOUR_GOOGLE_CLIENT_ID_HERE</code> with your actual Client ID.</p>
      </div>
    );
  }

  // Only show origin helper if we are in dev/preview
  if (process.env.NODE_ENV === 'production' && !origin.includes('webcontainer') && !origin.includes('stackblitz')) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '20px',
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#a1a1aa',
      padding: '12px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '10px',
      border: '1px solid #3f3f46',
      maxWidth: '300px'
    }}>
      <div style={{ marginBottom: '4px', color: '#ffb000' }}>GOOGLE CLOUD CONFIG:</div>
      <div>Origin URL (Add to GCP):</div>
      <code style={{
        display: 'block',
        background: 'black',
        padding: '4px',
        color: '#fff',
        marginTop: '4px',
        wordBreak: 'break-all',
        userSelect: 'all'
      }}>
        {origin}
      </code>
    </div>
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      <ConfigHelper />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
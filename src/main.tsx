import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main style={{ fontFamily: 'system-ui', padding: 32, maxWidth: 40 * 16 }}>
      <h1>Psynth design engineer assessment</h1>
      <p>
        The deliverable is Storybook, not this page. Run{' '}
        <code>npm run storybook</code> and read <code>ASSESSMENT.md</code>.
      </p>
    </main>
  </StrictMode>,
);

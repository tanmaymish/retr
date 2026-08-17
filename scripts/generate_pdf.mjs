import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retr (Akshay Vriddhi) - MasterClass Executive Edition User Flow Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');

    :root {
      --primary: #661426;
      --burgundy: #4a0d1a;
      --wine-deep: #2a0c14;
      --gold: #b8863f;
      --gold-light: #f0dba6;
      --gold-leaf: linear-gradient(135deg, #b8863f 0%, #e6ca85 50%, #b8863f 100%);
      --surface: #fffdf7;
      --text: #2c221e;
      --muted: #6e6259;
      --border: #e2d5c1;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      color: var(--text);
      background: #ffffff;
      line-height: 1.6;
      padding: 0;
    }

    .page {
      padding: 50px 60px;
      page-break-after: always;
    }

    .header-banner {
      background: linear-gradient(135deg, var(--wine-deep) 0%, var(--burgundy) 100%);
      color: #ffffff;
      padding: 40px 50px;
      border-radius: 12px;
      border: 1px solid var(--gold);
      position: relative;
      margin-bottom: 30px;
    }
    .header-banner::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--gold-leaf);
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      background: rgba(184, 134, 63, 0.2);
      border: 1px solid var(--gold);
      color: var(--gold-light);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    h1 {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      color: var(--gold-light);
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }
    .subtitle {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 16px;
      color: #e2d5c1;
    }

    h2 {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      color: var(--primary);
      border-bottom: 2px solid var(--gold);
      padding-bottom: 6px;
      margin: 28px 0 14px 0;
    }
    h3 {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      color: var(--burgundy);
      margin: 14px 0 8px 0;
    }

    p { font-size: 13px; margin-bottom: 10px; color: #4a4039; }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px 22px;
      margin-bottom: 16px;
      position: relative;
      box-shadow: 0 3px 12px rgba(0,0,0,0.03);
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--gold-leaf);
      border-radius: 10px 10px 0 0;
    }
    .card-dark {
      background: var(--wine-deep);
      color: #ffffff;
      border: 1px solid var(--gold);
    }
    .card-dark p { color: #d0c4b8; }
    .card-dark h3 { color: var(--gold-light); }

    .flow-step {
      display: flex;
      gap: 18px;
      margin-bottom: 20px;
      align-items: flex-start;
    }
    .step-num {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: var(--gold-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 15px;
      flex-shrink: 0;
      border: 2px solid var(--gold);
    }
    .step-content { flex-grow: 1; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 12px;
    }
    th {
      background: var(--burgundy);
      color: var(--gold-light);
      text-align: left;
      padding: 9px 12px;
      font-family: 'Cinzel', serif;
      font-size: 10.5px;
      letter-spacing: 0.1em;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid var(--border);
    }
    tr:nth-child(even) { background: #faf6f0; }

    ul { margin-left: 18px; font-size: 12.5px; margin-bottom: 10px; color: #4a4039; }
    li { margin-bottom: 5px; }

    code {
      background: #f0eadf;
      color: var(--primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: var(--muted);
    }
  </style>
</head>
<body>

  <!-- PAGE 1: EXECUTIVE OVERVIEW -->
  <div class="page">
    <div class="header-banner">
      <span class="badge">Akshay Vriddhi • Architecture Blueprint</span>
      <h1>Retr MasterClass User Flow Document</h1>
      <div class="subtitle">End-to-End Executive Experience & Financial Consultation Engine</div>
    </div>

    <h2>1. Executive Summary & Philosophy</h2>
    <p>
      <strong>Retr (Akshay Vriddhi)</strong> is designed as a high-fidelity, institutional private wealth and retirement advisory platform. 
      The core user experience completely rejects aggressive sales funnels, popup clutter, and dark patterns in favor of a calm, authoritative, decision-first architecture.
    </p>

    <div class="card">
      <h3>Core Architecture Principles</h3>
      <ul>
        <li><strong>Privacy-First Calculation:</strong> 100% of financial readiness, SWP depletion, and goal math executes client-side without demanding user signup or storing personal financial data.</li>
        <li><strong>No Product-First Pushing:</strong> Initial consultations and interactive decision frameworks discuss real household cash flows and risk constraints without naming proprietary commercial products.</li>
        <li><strong>Institutional Trust & Multi-Insurer Breadth:</strong> Advisory backed by choice across 6 empanelled life insurers and major asset management companies.</li>
        <li><strong>Structured Conversion Journey:</strong> Unobtrusive progression from landing discovery to decision calculators to diagnostic quiz to private callback request to executive CRM pipeline.</li>
      </ul>
    </div>

    <h2>2. User Persona Profiles</h2>
    <table>
      <thead>
        <tr>
          <th>Persona Segment</th>
          <th>Age / Horizon</th>
          <th>Core Financial Concern</th>
          <th>Primary Platform Entry Point</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Pre-Retiree Executive</strong></td>
          <td>50 – 58 yrs (2–5 yrs away)</td>
          <td>Corpus gap estimation, post-retirement cash flow continuity & tax-efficient SWP.</td>
          <td><code>/calculators/retirement-readiness</code></td>
        </tr>
        <tr>
          <td><strong>Early Wealth Accumulator</strong></td>
          <td>38 – 48 yrs (10+ yrs away)</td>
          <td>Compounding targets, child higher education inflation, EPF/NPS allocation.</td>
          <td><code>/calculators/education-goal</code> & NPS tools</td>
        </tr>
        <tr>
          <td><strong>Post-Retirement Household</strong></td>
          <td>60 – 72 yrs (In retirement)</td>
          <td>Capital preservation, health cover inflation, estate & nomination audit.</td>
          <td><code>/services#services</code> & <code>/preparedness-check</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PAGE 2: USER FLOW STAGES -->
  <div class="page">
    <h2>3. End-to-End User Journey Stages</h2>

    <div class="flow-step">
      <div class="step-num">01</div>
      <div class="step-content">
        <h3>Stage 1: Cinematic Entry & Discovery (Landing Page)</h3>
        <p>
          The user lands on the cinematic home section. High-contrast wine & gold accents frame the value proposition with immediate clarity.
        </p>
        <div class="card">
          <ul>
            <li><strong>Hero Display:</strong> Executive badge pill, glowing gold display headline (<em>"Retire without asking anyone for money."</em>), topic quick tracks (Corpus Gap, SWP vs Annuity, Family Vault).</li>
            <li><strong>Institutional Credentials Bar (TrustBar):</strong> 20+ years leadership metric, empanelled insurers, 100% fee schedule transparency.</li>
            <li><strong>Decision Frameworks (Situation Grid):</strong> Interactive cards targeting <em>Target Corpus</em>, <em>Capital Drawdown</em>, and <em>Future Milestones</em>.</li>
            <li><strong>Leadership Teaser:</strong> Co-founder background (Shiv Maheshwari & Vikram Rajput) establishing institutional authority.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flow-step">
      <div class="step-num">02</div>
      <div class="step-content">
        <h3>Stage 2: Self-Service Financial Intelligence (Calculators)</h3>
        <p>
          The user accesses 9 decision-first calculators. No sign-up barriers exist.
        </p>
        <div class="card">
          <ul>
            <li><strong>Retirement Readiness Score Engine:</strong> Input monthly expense target, current corpus, inflation rate, and expected return. Instant readiness score (0–100) generated with corpus gap calculation.</li>
            <li><strong>Drawdown & SWP Simulator:</strong> Models year-by-year capital depletion against bad opening decade market scenarios.</li>
            <li><strong>EPF / NPS / Goal Optimizers:</strong> Tax deduction checks under Old vs New tax regimes.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flow-step">
      <div class="step-num">03</div>
      <div class="step-content">
        <h3>Stage 3: Interactive Diagnostic Quiz (Preparedness Check)</h3>
        <p>
          A 7-question diagnostic quiz evaluating retirement readiness across cash flow, medical cover, tax, and estate protection.
        </p>
        <div class="card">
          <ul>
            <li>Interactive cards score each pillar (0 to 100%).</li>
            <li>Generates a personalized Readiness Summary Breakdown.</li>
            <li>Direct CTA button: <em>"Discuss this result in a 20-minute call"</em>.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 3: CONVERSION & BACKEND FLOW -->
  <div class="page">
    <div class="flow-step">
      <div class="step-num">04</div>
      <div class="step-content">
        <h3>Stage 4: Private Consultation Booking (Callback Popup)</h3>
        <p>
          Clicking any <em>"Request a call"</em> CTA triggers a clean, glassmorphic modal overlay.
        </p>
        <div class="card">
          <ul>
            <li><strong>User Inputs:</strong> Full Name, Mobile Phone (10-digit validation), Preferred Time Slot (Morning / Afternoon / Evening), Specific Financial Question.</li>
            <li><strong>Submission Handling:</strong> Client sends <code>POST /api/leads</code> payload. Displays immediate toast confirmation with no page redirect.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flow-step">
      <div class="step-num">05</div>
      <div class="step-content">
        <h3>Stage 5: Executive CRM Pipeline & Lead Dispatch (Admin Portal)</h3>
        <p>
          Advisors receive incoming leads in real-time within the secure administrative portal.
        </p>
        <div class="card card-dark">
          <h3>Lead Management Workflow</h3>
          <ul>
            <li><strong>Authentication:</strong> Secure session validation via administrative login portal.</li>
            <li><strong>Pipeline Statuses:</strong> <code>NEW</code> &rarr; <code>CONTACTED</code> &rarr; <code>SCHEDULED</code> &rarr; <code>COMPLETED</code>.</li>
            <li><strong>Adviser Actions:</strong> Add consultation notes, update engagement stage, review calculator parameters supplied during lead generation.</li>
          </ul>
        </div>
      </div>
    </div>

    <h2>4. System Architecture & Security Specifications</h2>
    <table>
      <thead>
        <tr>
          <th>Component Layer</th>
          <th>Technology Stack</th>
          <th>Security & Operational Rules</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Frontend UI</strong></td>
          <td>React 19 + Vite + React Router v7 + Custom CSS Token System</td>
          <td>Zero tracking scripts, strict client-side calculation execution, responsive dark glassmorphism.</td>
        </tr>
        <tr>
          <td><strong>API Backend</strong></td>
          <td>Node.js Express REST API (<code>server/src/index.js</code>)</td>
          <td>Parametrized query protection, CORS enforcement, input sanitization on all lead endpoints.</td>
        </tr>
        <tr>
          <td><strong>Database</strong></td>
          <td><code>better-sqlite3</code> embedded database (<code>retr.db</code>)</td>
          <td>ACID compliant storage for leads, administrative credentials, and site content overrides.</td>
        </tr>
        <tr>
          <td><strong>Regulatory Compliance</strong></td>
          <td>IRDAI & AMFI Disclosure Protocols</td>
          <td>Embedded disclosures in footer grid, clear disclaimer on illustrative scenario models.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <span>Akshay Vriddhi Insurance Marketing Firm Pvt Ltd</span>
      <span>Confidential • MasterClass User Flow Documentation</span>
      <span>Generated August 2026</span>
    </div>
  </div>

</body>
</html>
`;

async function buildPdf() {
  const htmlPath = path.join(__dirname, '../app/public/user_flow.html');
  const pdfOutputPath = path.join(__dirname, '../app/public/Retr_MasterClass_User_Flow.pdf');

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('HTML written to:', htmlPath);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: pdfOutputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  await browser.close();
  console.log('PDF successfully generated at:', pdfOutputPath);
}

buildPdf().catch(err => {
  console.error('Error building PDF:', err);
  process.exit(1);
});

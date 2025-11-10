const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running tests and generating report...\n');

let testOutput = '';
let exitCode = 0;

try {
  testOutput = execSync('jest --detectOpenHandles --forceExit --json --outputFile=test-results.json', {
    encoding: 'utf8',
    stdio: 'inherit'
  });
} catch (error) {
  exitCode = error.status || 1;
  console.log('\nTests completed with failures. Generating report...\n');
}

// Read the JSON results
let results;
try {
  const jsonPath = path.join(__dirname, 'test-results.json');
  if (fs.existsSync(jsonPath)) {
    results = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } else {
    console.error('Test results file not found. Make sure Jest ran successfully.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error reading test results:', error.message);
  process.exit(1);
}

// Generate HTML
const html = generateHTML(results);
fs.writeFileSync(path.join(__dirname, 'test-dashboard.html'), html);

console.log('\nTest report generated: test-dashboard.html');
console.log(`Opening dashboard...`);

// Open the dashboard
const { exec } = require('child_process');
const dashboardPath = path.join(__dirname, 'test-dashboard.html');
exec(`start "" "${dashboardPath}"`, (error) => {
  if (error) {
    console.error('Error opening dashboard:', error.message);
  }
  process.exit(exitCode);
});

function generateHTML(results) {
  const totalTests = results.numTotalTests || 0;
  const passedTests = results.numPassedTests || 0;
  const failedTests = results.numFailedTests || 0;
  const testSuites = results.testResults || [];
  const success = results.success;
  
  // Calculate execution time from test suite start and end times
  let executionTimeMs = 0;
  
  if (testSuites.length > 0) {
    // Sum up the duration of each test suite
    executionTimeMs = testSuites.reduce((sum, suite) => {
      if (suite.endTime && suite.startTime) {
        return sum + (suite.endTime - suite.startTime);
      }
      return sum;
    }, 0);
  }
  
  const executionTime = (executionTimeMs / 1000).toFixed(3);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Juander • Automated Testing Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    :root {
      --bg: #f5f1e8;
      --panel: #ffffff;
      --panel-2: #fafaf8;
      --muted: #8b7355;
      --text: #2d2416;
      --brand: #e94e3d;
      --brand-2: #f26b5c;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #e94e3d;
      --border: #e8dcc8;
      --shadow: 0 4px 20px rgba(233, 78, 61, 0.08);
      --radius: 14px;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: var(--text);
      background: radial-gradient(1200px 800px at 100% -100px, rgba(233, 78, 61, 0.08), rgba(242, 107, 92, 0.05)),
                  radial-gradient(1000px 700px at -20% -80px, rgba(233, 78, 61, 0.06), rgba(245, 241, 232, 0.8)),
                  var(--bg);
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 32px 20px 48px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .brand { display: flex; gap: 14px; align-items: center; }
    .brand .logo {
      height: 44px; width: 44px;
      display: grid; place-items: center;
      border-radius: 8px;
      overflow: hidden;
    }
    .brand .title { line-height: 1.25; }
    .brand .title h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.2px; }
    .brand .title span { color: var(--muted); font-size: 13px; }
    .actions { display: flex; gap: 10px; }
    .btn {
      appearance: none; border: 1px solid var(--border); color: var(--text);
      background: white;
      padding: 10px 14px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px;
      display: inline-flex; align-items: center; gap: 8px; transition: all .2s ease; box-shadow: var(--shadow);
    }
    .btn:hover { transform: translateY(-1px); border-color: var(--brand); }
    .btn.primary { border-color: transparent; background: linear-gradient(135deg, var(--brand), var(--brand-2)); color: white; }
    .btn.primary:hover { filter: brightness(1.05); }
    .grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 16px; }
    @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
    .panel { background: linear-gradient(180deg, var(--panel), var(--panel-2)); border: 1px solid var(--border);
      border-radius: var(--radius); box-shadow: var(--shadow); }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 16px; }
    @media (max-width: 900px) { .stats { grid-template-columns: repeat(2, 1fr); } }
    .stat { background: rgba(233, 78, 61, 0.03); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
    .stat .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .6px; }
    .stat .value { font-size: 26px; font-weight: 700; margin-top: 6px; display: flex; align-items: center; gap: 10px; }
    .stat .trend { font-size: 12px; color: var(--muted); margin-top: 4px; }
    .stat .ok { color: var(--success); }
    .stat .warn { color: var(--warning); }
    .stat .fail { color: var(--danger); }
    .section { padding: 16px 16px 4px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
    .section h2 { margin: 0; font-size: 14px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; color: var(--muted); }
    .tests { padding: 8px 16px 16px; }
    .suite { border: 1px solid var(--border); border-radius: 12px; margin-top: 12px; }
    .suite-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(233, 78, 61, 0.04); border-bottom: 1px solid var(--border); border-top-left-radius: 12px; border-top-right-radius: 12px; }
    .suite-title { display: flex; align-items: center; gap: 10px; font-weight: 600; }
    .badge { font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(139, 115, 85, 0.08); color: var(--muted); }
    .badge.ok { color: var(--success); border-color: rgba(16,185,129,.3); background: rgba(16,185,129,.1); }
    .badge.fail { color: var(--danger); border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.1); }
    .test-item { display: grid; grid-template-columns: 24px 1fr auto; gap: 12px; align-items: center; padding: 12px 14px; border-bottom: 1px dashed rgba(139, 115, 85, 0.1); }
    .test-item:last-child { border-bottom: none; }
    .test-name { color: var(--text); font-size: 14px; }
    .test-meta { color: var(--muted); font-size: 12px; }
    .status { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 12px; padding: 6px 10px; border-radius: 999px; }
    .status.ok { color: var(--success); background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.3); }
    .status.fail { color: var(--danger); background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); }
    .workflow { padding: 8px 16px 16px; }
    .wf-step { display: grid; grid-template-columns: 28px 1fr auto; gap: 12px; align-items: center; padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px; background: rgba(233, 78, 61, 0.03); margin-top: 10px; }
    .wf-title { font-weight: 600; }
    .wf-sub { color: var(--muted); font-size: 12px; }
    .footer { margin-top: 18px; color: var(--muted); font-size: 12px; text-align: right; }
    .muted { color: var(--muted); }
    .icon { width: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <div class="logo"><img src="juander-logo.svg" alt="Juander Logo" style="width: 100%; height: 100%; object-fit: contain;" /></div>
        <div class="title">
          <h1>Juander • Automated Testing</h1>
          <span>Continuous Integration • GitHub Actions</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn" onclick="window.location.reload()"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
      </div>
    </header>

    <section class="panel">
      <div class="stats">
        <div class="stat">
          <div class="label">Tests Passed</div>
          <div class="value"><i class="fa-solid fa-circle-check ${success ? 'ok' : 'fail'}"></i> ${passedTests}/${totalTests}</div>
          <div class="trend">${success ? 'All tests passing' : failedTests + ' test(s) failing'}</div>
        </div>
        <div class="stat">
          <div class="label">Suites</div>
          <div class="value">${testSuites.length}</div>
          <div class="trend">Authentication • Profile • Itinerary</div>
        </div>
        <div class="stat">
          <div class="label">Execution Time</div>
          <div class="value warn"><i class="fa-solid fa-timer"></i> ${executionTime}s</div>
          <div class="trend">Optimized in-memory database</div>
        </div>
        <div class="stat">
          <div class="label">Pipeline</div>
          <div class="value"><i class="fa-solid fa-${success ? 'circle-check ok' : 'circle-xmark fail'}"></i> ${success ? 'Passing' : 'Failing'}</div>
          <div class="trend">GitHub Actions ${success ? 'ready' : 'blocked'}</div>
        </div>
      </div>

      <div class="section"><i class="fa-solid fa-list-check"></i><h2>Test Suites</h2></div>
      <div class="tests">
        ${testSuites.map(suite => generateSuiteHTML(suite)).join('')}
      </div>
    </section>

    <div class="footer">Last updated: ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;
}

function generateSuiteHTML(suite) {
  const suiteName = suite.name.replace(/^.*__tests__[\\/]/, '').replace('.test.js', '');
  const tests = suite.assertionResults || [];
  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const total = tests.length;
  const allPassed = failed === 0;

  const iconMap = {
    'auth': 'fa-shield-halved',
    'profile': 'fa-user-gear',
    'itinerary': 'fa-route'
  };
  const icon = iconMap[suiteName] || 'fa-vial';

  return `
    <div class="suite">
      <div class="suite-head">
        <div class="suite-title"><i class="fa-solid ${icon}"></i> ${formatSuiteName(suiteName)}</div>
        <span class="badge ${allPassed ? 'ok' : 'fail'}"><i class="fa-solid fa-circle-${allPassed ? 'check' : 'xmark'}"></i> ${passed}/${total} Passed</span>
      </div>
      ${tests.map(test => {
        const duration = test.duration ? `${test.duration}ms` : '';
        return `
        <div class="test-item">
          <div class="icon"><i class="fa-solid fa-${test.status === 'passed' ? 'check' : 'xmark'}"></i></div>
          <div>
            <div class="test-name">${test.title}</div>
            ${duration ? `<div class="test-meta">${duration}</div>` : ''}
          </div>
          <div class="status ${test.status === 'passed' ? 'ok' : 'fail'}"><i class="fa-solid fa-${test.status === 'passed' ? 'check' : 'xmark'}"></i> ${test.status}</div>
        </div>
      `}).join('')}
    </div>
  `;
}

function formatSuiteName(name) {
  const nameMap = {
    'auth': 'Authentication API Tests',
    'profile': 'Profile Management Tests',
    'itinerary': 'Itinerary Management Tests'
  };
  return nameMap[name] || name;
}

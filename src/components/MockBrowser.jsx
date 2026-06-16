import { BASE_URL } from '../data/testCases.js'

// A stylized, animated mock of the OrangeHRM UI driven by the demo `state`.
// (The real site blocks embedding via X-Frame-Options, so we replay the flow
//  visually here — the actual selectors used are shown in the code panel.)
export default function MockBrowser({ state, running }) {
  const url =
    state.screen === 'dashboard'
      ? 'opensource-demo.orangehrmlive.com/web/index.php/dashboard'
      : state.screen === 'pim-list'
      ? 'opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList'
      : BASE_URL.replace('https://', '')

  return (
    <div className="browser">
      <div className="browser__bar">
        <span className="browser__dot browser__dot--r" />
        <span className="browser__dot browser__dot--y" />
        <span className="browser__dot browser__dot--g" />
        <div className="browser__url">🔒 {url}</div>
      </div>

      <div className="browser__view">
        {(state.screen === 'login' || !state.screen) && <LoginScreen state={state} />}
        {state.screen === 'dashboard' && <DashboardScreen state={state} />}
        {state.screen === 'pim-list' && <PimScreen state={state} />}
        {running && <div className="browser__cursor" />}
      </div>
    </div>
  )
}

function LoginScreen({ state }) {
  return (
    <div className="ohrm-login">
      <div className="ohrm-login__brand">OrangeHRM</div>
      <h3 className="ohrm-login__title">Login</h3>

      {state.error && <div className="ohrm-alert">⚠ {state.error}</div>}

      <label className="ohrm-label">Username</label>
      <div className={`ohrm-input ${state.focus === 'username' ? 'is-focus' : ''}`}>
        {state.username || <span className="ohrm-ph">Username</span>}
      </div>
      {state.fieldError && <div className="ohrm-field-error">Required</div>}

      <label className="ohrm-label">Password</label>
      <div className={`ohrm-input ${state.focus === 'password' ? 'is-focus' : ''}`}>
        {state.password || <span className="ohrm-ph">Password</span>}
      </div>
      {state.fieldError && <div className="ohrm-field-error">Required</div>}

      <button className={`ohrm-btn ${state.focus === 'submit' ? 'is-active' : ''}`}>
        Login
      </button>
    </div>
  )
}

function DashboardScreen({ state }) {
  return (
    <div className="ohrm-app">
      <aside className="ohrm-side">
        <div className="ohrm-side__brand">OrangeHRM</div>
        {['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'Dashboard'].map((m) => (
          <div key={m} className="ohrm-side__item">{m}</div>
        ))}
      </aside>
      <main className="ohrm-main">
        <div className="ohrm-topbar">
          <span>Dashboard</span>
          <div className="ohrm-user">
            <span className="ohrm-user__name">Admin ▾</span>
            {state.menu && (
              <div className="ohrm-menu">
                <div>About</div>
                <div>Support</div>
                <div className="is-hl">Logout</div>
              </div>
            )}
          </div>
        </div>
        <div className="ohrm-cards">
          <div className="ohrm-card">Time at Work</div>
          <div className="ohrm-card">My Actions</div>
          <div className="ohrm-card">Quick Launch</div>
          <div className="ohrm-card">Buzz Latest Posts</div>
        </div>
      </main>
    </div>
  )
}

function PimScreen({ state }) {
  return (
    <div className="ohrm-app">
      <aside className="ohrm-side">
        <div className="ohrm-side__brand">OrangeHRM</div>
        {['Admin', 'PIM', 'Leave', 'Time'].map((m) => (
          <div key={m} className={`ohrm-side__item ${m === 'PIM' ? 'is-active' : ''}`}>{m}</div>
        ))}
      </aside>
      <main className="ohrm-main">
        <div className="ohrm-topbar"><span>PIM</span></div>
        <div className="ohrm-search">
          <label className="ohrm-label">Employee Name</label>
          <div className="ohrm-input">
            {state.search || <span className="ohrm-ph">Type for hints...</span>}
          </div>
          <button className="ohrm-btn ohrm-btn--sm">Search</button>
        </div>
        {state.results && (
          <table className="ohrm-table">
            <thead>
              <tr><th>Id</th><th>First Name</th><th>Last Name</th><th>Job Title</th></tr>
            </thead>
            <tbody>
              <tr><td>0001</td><td>Aaliyah</td><td>Haq</td><td>Manager</td></tr>
              <tr><td>0007</td><td>Asahd</td><td>Khaled</td><td>Engineer</td></tr>
              <tr><td>0012</td><td>Amelia</td><td>Reyes</td><td>Analyst</td></tr>
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}

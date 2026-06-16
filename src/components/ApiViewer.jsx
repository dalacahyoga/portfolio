import { API_BASE } from '../data/apiTests.js'

// Animated request/response viewer driven by the demo `state`.
export default function ApiViewer({ state, running }) {
  const ok = state.status && state.status < 400
  return (
    <div className="apiv">
      <div className="apiv__client">
        <span className="apiv__dot apiv__dot--r" />
        <span className="apiv__dot apiv__dot--y" />
        <span className="apiv__dot apiv__dot--g" />
        <span className="apiv__client-title">API Client — REST runner</span>
      </div>

      <div className="apiv__body">
        {/* Request */}
        <div className="apiv__panel">
          <div className="apiv__h">Request</div>
          <div className="apiv__url">
            <span className={`method method--${state.method}`}>{state.method}</span>
            <code>{API_BASE}{state.url}</code>
          </div>
          <div className="apiv__sub">Headers</div>
          <pre className="apiv__code">{state.headers || 'Content-Type: application/json\nAccept: application/json'}</pre>
          {state.reqBody && (
            <>
              <div className="apiv__sub">Body</div>
              <pre className="apiv__code">{state.reqBody}</pre>
            </>
          )}
        </div>

        {/* Response */}
        <div className="apiv__panel">
          <div className="apiv__h">
            Response
            {state.status && (
              <span className={`status status--${ok ? 'ok' : 'err'}`}>{state.status}</span>
            )}
          </div>
          {state.sending && !state.status ? (
            <div className="apiv__wait">⏳ sending request…</div>
          ) : state.resBody ? (
            <pre className="apiv__code apiv__code--res">{state.resBody}</pre>
          ) : (
            <div className="apiv__wait">— awaiting response —</div>
          )}
          {running && <div className="apiv__cursor" />}
        </div>
      </div>
    </div>
  )
}

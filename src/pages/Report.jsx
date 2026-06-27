import { useNavigate, useSearchParams } from 'react-router-dom'
import { BackIcon } from '../components/Icons.jsx'
import TestReport from '../components/TestReport.jsx'
import { testCases, frameworks } from '../data/testCases.js'
import { apiTestCases, apiFrameworks } from '../data/apiTests.js'
import { trackEvent } from '../lib/analytics.js'

export default function Report() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const cat = params.get('cat') === 'api' ? 'api' : 'web'
  const isApi = cat === 'api'
  const tcs = isApi ? apiTestCases : testCases
  const fws = isApi ? apiFrameworks : frameworks

  const tc = tcs.find((t) => t.id === params.get('tc')) || tcs[0]
  const framework = fws.find((f) => f.id === params.get('fw')) || fws[0]

  return (
    <div className="report-page">
      <div className="report-wrap__bar">
        <button className="report-back" onClick={() => { trackEvent('report_back', { menu: tc.id }); navigate(-1) }}>
          <BackIcon /> Back
        </button>
        <span>Test Report — {tc.id}</span>
        <button className="report-back" onClick={() => { trackEvent('report_print', { menu: tc.id }); window.print() }}>Print / PDF</button>
      </div>
      <TestReport tc={tc} frameworkLabel={framework.label} kind={cat} />
    </div>
  )
}

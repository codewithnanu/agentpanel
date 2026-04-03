import { useState, useEffect } from 'react'

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

const STATUS_CONFIG = {
  running: {
    badge: 'bg-blue-950 text-blue-300 border border-blue-800',
    label: 'Running',
    dot: <Spinner />,
  },
  complete: {
    badge: 'bg-green-950 text-green-300 border border-green-800',
    label: 'Complete',
    dot: (
      <svg className="w-4 h-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  failed: {
    badge: 'bg-red-950 text-red-300 border border-red-800',
    label: 'Failed',
    dot: (
      <svg className="w-4 h-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
}

export default function RunHeader({ run, runStatus, startTime, endTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (runStatus !== 'running') return
    setElapsed(Date.now() - startTime)
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(interval)
  }, [runStatus, startTime])

  const config = STATUS_CONFIG[runStatus] || STATUS_CONFIG.running
  const displayTime = runStatus === 'running'
    ? elapsed
    : endTime
    ? endTime - startTime
    : null

  return (
    <div className="border-b border-gray-800 pb-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-medium">
            Research Query
          </div>
          <h1 className="text-gray-100 text-xl font-semibold leading-snug">
            {run.query}
          </h1>
          <div className="text-xs text-gray-600 mt-1">Run ID: {run.id}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.badge}`}>
            {config.dot}
            {config.label}
          </span>
          {displayTime !== null && (
            <span className="text-gray-500 text-sm tabular-nums">
              {formatElapsed(displayTime)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

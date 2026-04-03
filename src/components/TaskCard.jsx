import { useState } from 'react'

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusDisplay(task) {
  const { status, hadFailure, retryCount, cancelReason } = task

  if (status === 'cancelled' && cancelReason === 'sufficient_data') {
    return {
      label: 'Completed early',
      dotClass: 'bg-teal-400',
      textClass: 'text-teal-400',
      badgeClass: 'bg-teal-950 text-teal-300 border-teal-800',
      borderClass: 'border-teal-900',
      pulse: false,
    }
  }
  if (status === 'cancelled') {
    return {
      label: 'Cancelled',
      dotClass: 'bg-gray-500',
      textClass: 'text-gray-400',
      badgeClass: 'bg-gray-800 text-gray-400 border-gray-700',
      borderClass: 'border-gray-800',
      pulse: false,
    }
  }
  if (status === 'failed') {
    return {
      label: 'Failed',
      dotClass: 'bg-red-500',
      textClass: 'text-red-400',
      badgeClass: 'bg-red-950 text-red-300 border-red-900',
      borderClass: 'border-red-900',
      pulse: false,
    }
  }
  if (status === 'running' && hadFailure && retryCount > 0) {
    return {
      label: 'Retrying',
      dotClass: 'bg-amber-400',
      textClass: 'text-amber-400',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
      borderClass: 'border-amber-900',
      pulse: true,
    }
  }
  if (status === 'running') {
    return {
      label: 'Running',
      dotClass: 'bg-blue-400',
      textClass: 'text-blue-400',
      badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
      borderClass: 'border-blue-900',
      pulse: true,
    }
  }
  if (status === 'complete') {
    return {
      label: hadFailure ? 'Complete (recovered)' : 'Complete',
      dotClass: 'bg-green-400',
      textClass: 'text-green-400',
      badgeClass: 'bg-green-950 text-green-300 border-green-800',
      borderClass: 'border-green-900',
      pulse: false,
    }
  }
  return {
    label: status,
    dotClass: 'bg-gray-500',
    textClass: 'text-gray-400',
    badgeClass: 'bg-gray-800 text-gray-400 border-gray-700',
    borderClass: 'border-gray-800',
    pulse: false,
  }
}

function qualityColor(score) {
  if (score >= 0.85) return 'bg-green-950 text-green-300 border-green-800'
  if (score >= 0.6) return 'bg-amber-950 text-amber-300 border-amber-800'
  return 'bg-red-950 text-red-300 border-red-800'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolCallRow({ call }) {
  return (
    <div className="text-xs space-y-0.5">
      <div className="flex items-start gap-1.5">
        <span className="text-blue-500 shrink-0 mt-0.5">›</span>
        <span className="font-mono text-blue-300">{call.tool}</span>
        <span className="text-gray-600 ml-auto shrink-0">call</span>
      </div>
      <div className="pl-4 text-gray-500">{call.input_summary}</div>
      {call.output_summary && (
        <>
          <div className="flex items-start gap-1.5 mt-1">
            <span className="text-green-600 shrink-0 mt-0.5">‹</span>
            <span className="text-gray-400">{call.output_summary}</span>
          </div>
        </>
      )}
      {call.pending && !call.output_summary && (
        <div className="pl-4 flex items-center gap-1.5 text-gray-600">
          <span className="animate-pulse">•••</span>
          <span>awaiting result</span>
        </div>
      )}
    </div>
  )
}

function DependencyRow({ taskIds, allTasks }) {
  if (!taskIds || taskIds.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
      <span className="text-xs text-gray-600">Depends on:</span>
      {taskIds.map((id) => {
        const dep = allTasks[id]
        if (!dep) return (
          <span key={id} className="text-xs text-gray-700 font-mono">{id}</span>
        )
        let chipClass = 'bg-gray-800 text-gray-500 border-gray-700'
        if (dep.status === 'complete') chipClass = 'bg-green-950 text-green-400 border-green-900'
        else if (dep.status === 'cancelled') chipClass = 'bg-teal-950 text-teal-400 border-teal-900'
        else if (dep.status === 'failed') chipClass = 'bg-red-950 text-red-400 border-red-900'
        else if (dep.status === 'running') chipClass = 'bg-blue-950 text-blue-400 border-blue-900'

        return (
          <span
            key={id}
            title={dep.label}
            className={`text-xs border rounded px-1.5 py-0.5 font-mono ${chipClass}`}
          >
            {id}
          </span>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaskCard({ task, allTasks }) {
  const [showTools, setShowTools] = useState(false)
  const [showThoughts, setShowThoughts] = useState(false)

  const s = getStatusDisplay(task)
  const latestOutput = task.partialOutputs[task.partialOutputs.length - 1]
  const isStreaming = latestOutput && !latestOutput.is_final

  return (
    <div className={`rounded-lg border ${s.borderClass} bg-gray-900 p-4 flex flex-col gap-0`}>
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="mt-1.5 shrink-0">
          <span
            className={`block w-2 h-2 rounded-full ${s.dotClass} ${s.pulse ? 'animate-pulse' : ''}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-100 leading-snug">{task.label}</div>
          <div className="text-xs text-gray-500 mt-0.5 font-mono">{task.agent}</div>
        </div>
        <span className={`shrink-0 text-xs border px-2 py-0.5 rounded-full font-medium ${s.badgeClass}`}>
          {s.label}
        </span>
      </div>

      {/* Retry history note */}
      {task.retryCount > 0 && task.status !== 'failed' && (
        <div className="mt-2 text-xs text-amber-500 pl-4.5">
          Retried {task.retryCount}x — recovered successfully
        </div>
      )}

      {/* Dependency row */}
      {task.depends_on.length > 0 && (
        <div className="mt-2 pl-0.5">
          <DependencyRow taskIds={task.depends_on} allTasks={allTasks} />
        </div>
      )}

      {/* Cancellation message (sufficient_data) */}
      {task.status === 'cancelled' && task.cancelMessage && (
        <div className="mt-3 border-l-2 border-teal-700 pl-3">
          <p className="text-xs text-teal-400 leading-relaxed">{task.cancelMessage}</p>
        </div>
      )}

      {/* Error message (permanent failure) */}
      {task.status === 'failed' && task.error && (
        <div className="mt-3 border-l-2 border-red-800 pl-3">
          <p className="text-xs text-red-400 leading-relaxed">{task.error}</p>
        </div>
      )}

      {/* Retrying status */}
      {task.status === 'running' && task.hadFailure && task.error === null && (
        <div className="mt-2 text-xs text-amber-400 pl-0.5">
          Previous attempt failed — retrying now
        </div>
      )}

      {/* Tool calls */}
      {task.toolCalls.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowTools(!showTools)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showTools ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>
              {task.toolCalls.length} tool call{task.toolCalls.length !== 1 ? 's' : ''}
            </span>
          </button>
          {showTools && (
            <div className="mt-2 space-y-3 border-l border-gray-800 pl-3 ml-1">
              {task.toolCalls.map((call) => (
                <ToolCallRow key={call.id} call={call} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agent thoughts */}
      {task.thoughts.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showThoughts ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Agent reasoning</span>
          </button>
          {showThoughts && (
            <div className="mt-2 space-y-2 border-l border-gray-800 pl-3 ml-1">
              {task.thoughts.map((t, i) => (
                <p key={i} className="text-xs text-gray-500 italic leading-relaxed">
                  {t.thought}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Output */}
      {latestOutput && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-300 leading-relaxed">
            {latestOutput.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-0.5 align-middle animate-blink" />
            )}
          </p>
          {latestOutput.is_final && latestOutput.quality_score !== null && (
            <span className={`mt-2 inline-block text-xs border rounded px-2 py-0.5 font-medium ${qualityColor(latestOutput.quality_score)}`}>
              Quality {Math.round(latestOutput.quality_score * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

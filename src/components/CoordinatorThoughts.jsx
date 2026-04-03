import { useState } from 'react'

export default function CoordinatorThoughts({ thoughts }) {
  const [expanded, setExpanded] = useState(false)

  if (thoughts.length === 0) return null

  return (
    <div className="mb-5 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-900 transition-colors"
      >
        <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Coordinator Reasoning
        </span>
        <span className="text-xs text-gray-600 ml-1">
          ({thoughts.length} thought{thoughts.length !== 1 ? 's' : ''})
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-2">
          {thoughts.map((t, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-700 text-xs mt-0.5 shrink-0">—</span>
              <p className="text-xs text-gray-400 italic leading-relaxed">{t.thought}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

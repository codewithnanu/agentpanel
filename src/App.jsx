import { useState, useEffect, useRef, useCallback } from 'react'
import AgentRunPanel from './components/AgentRunPanel'
import { MockEventEmitter } from './mock/emitter'
import { useRunState } from './hooks/useRunState'
import successFixture from '../mock/fixtures/run_success.json'
import errorFixture from '../mock/fixtures/run_error.json'

const FIXTURES = {
  success: successFixture,
  error: errorFixture,
}

const FIXTURE_META = {
  success: { label: 'Success run', description: 'Apple R&D vs peers — parallel tasks, retry, cancellation' },
  error: { label: 'Error run', description: 'Amazon logistics capex — coordinator fails mid-run' },
}

// Speed options: label -> multiplier (higher = faster)
const SPEEDS = [
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
]

export default function App() {
  const { state, processEvent, reset } = useRunState()
  const emitterRef = useRef(null)
  const [activeFixture, setActiveFixture] = useState(null)
  const [speed, setSpeed] = useState(2)

  const startFixture = useCallback(
    (key) => {
      if (emitterRef.current) {
        emitterRef.current.stop()
        emitterRef.current = null
      }
      reset()
      setActiveFixture(key)

      const emitter = new MockEventEmitter(FIXTURES[key], processEvent)
      emitterRef.current = emitter
      emitter.start(speed)
    },
    [processEvent, reset, speed]
  )

  // Stop emitter on unmount
  useEffect(() => {
    return () => emitterRef.current?.stop()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <div className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-gray-200">JcurveIQ</span>
            <span className="text-gray-600 text-sm">Agent Run Panel</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(FIXTURE_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => startFixture(key)}
                title={meta.description}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  activeFixture === key
                    ? 'bg-gray-700 text-gray-100 border-gray-600'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                {meta.label}
              </button>
            ))}
            {activeFixture && (
              <button
                onClick={() => startFixture(activeFixture)}
                className="px-3 py-1.5 rounded text-xs font-medium border border-gray-800 text-gray-500 bg-gray-900 hover:text-gray-300 hover:border-gray-600 transition-colors"
              >
                Replay
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-gray-600">Speed:</span>
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className={`px-2 py-1 rounded text-xs border transition-colors ${
                  speed === s.value
                    ? 'bg-gray-700 text-gray-200 border-gray-600'
                    : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AgentRunPanel state={state} />
      </div>
    </div>
  )
}

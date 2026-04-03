# JcurveIQ — Agent Run Panel

**Frontend Developer Screening — Gaurav Nanu**

A React component that shows a live multi-agent research run unfolding in real time. Built as a take-home assessment for JcurveIQ's Frontend Engineer (Early Career) role.

## Live demo

https://jcurveiq-agent-panel-gamma.vercel.app

## Running locally

```bash
git clone <repo-url>
cd jcurveiq-agent-panel
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Switching between fixtures

Use the buttons in the top bar:

| Button | Fixture | What it covers |
|--------|---------|----------------|
| **Success run** | `mock/fixtures/run_success.json` | Full 18-second run. Apple R&D vs large-cap peers. Includes: sequential task, parallel group of 3, task retry, cancelled task (`sufficient_data`), synthesis with streaming output, final result with citations. |
| **Error run** | `mock/fixtures/run_error.json` | Partial run. Amazon logistics capex. Two tasks complete, one is in-flight, one never starts — then the coordinator fails unrecoverably. Partial results remain visible. |
| **Replay** | Re-runs the last selected fixture | Resets all state and replays from the beginning. |

### Playback speed

The **1×/2×/4×** buttons in the top-right control the replay speed multiplier. At `1×` the success fixture runs for ~18 seconds (real time); at `4×` it completes in ~4.5 seconds. The speed selector takes effect on the *next* replay — it does not affect a run already in progress.

### Adding a new fixture

1. Drop a `.json` file (array of events) into `mock/fixtures/`.
2. Import it in `src/App.jsx` and add an entry to the `FIXTURES` and `FIXTURE_META` objects.

## Project structure

```
├── src/
│   ├── components/
│   │   ├── AgentRunPanel.jsx        # Top-level panel; composes all sub-components
│   │   ├── RunHeader.jsx            # Query display, status badge, live elapsed timer
│   │   ├── CoordinatorThoughts.jsx  # Collapsible coordinator reasoning section
│   │   ├── TaskList.jsx             # Renders taskOrder (sequential items + parallel groups)
│   │   ├── ParallelGroup.jsx        # Indigo-bordered grid container for concurrent tasks
│   │   ├── TaskCard.jsx             # Individual task: status, tool calls, output, thoughts
│   │   ├── FinalOutput.jsx          # Prominent final result (or error) at run end
│   │   └── EmptyState.jsx           # Idle state with fixture descriptions
│   ├── hooks/
│   │   └── useRunState.js           # useReducer state machine; handles all 8 event types
│   ├── mock/
│   │   └── emitter.js               # setTimeout-driven fixture replayer with speed control
│   ├── App.jsx                      # Fixture selector, speed control, wires emitter → state
│   ├── main.jsx
│   └── index.css
├── mock/
│   └── fixtures/
│       ├── run_success.json         # Full success scenario (18 events, all edge cases covered)
│       └── run_error.json           # Partial error scenario (coordinator fails mid-run)
├── DECISIONS.md                     # Design rationale for the 5 ambiguous requirements
├── README.md
└── package.json
```

## Stack

- **React 18** — hooks, functional components, `useReducer` for state
- **Tailwind CSS v3** — all styling, no pre-built component libraries
- **Vite** — dev server and bundler
- No backend; mock-only via `setTimeout`-driven event emitter

## State model

All state lives in `useRunState` (`src/hooks/useRunState.js`) via a single `useReducer`. The reducer processes raw events from the mock emitter and produces a derived state tree that the UI renders directly.

```js
{
  runStatus: 'idle' | 'running' | 'complete' | 'failed',
  run: { id, query } | null,
  startTime: number | null,       // wall-clock time, drives the elapsed counter
  endTime: number | null,
  tasks: { [taskId]: TaskObject },
  taskOrder: [                     // ordered rendering list preserving spawn order
    { type: 'task', id }
    | { type: 'group', groupId, taskIds: [] }
  ],
  coordinatorThoughts: [],
  systemThoughts: [],              // task_id: null events (stored, not yet rendered)
  finalOutput: { summary, citations } | null,
  error: string | null,
}
```

Each `TaskObject` tracks: `status`, `toolCalls`, `partialOutputs`, `finalOutput`, `thoughts`, `hadFailure`, `retryCount`, `cancelReason`, `cancelMessage`, `depends_on`.

## Key design decisions (summary)

Full reasoning is in [DECISIONS.md](./DECISIONS.md). Short version:

| Decision | Choice |
|----------|--------|
| Agent thoughts | Collapsed by default — analyst-first, reasoning on demand |
| Parallel layout | Indigo-bordered grid with "Parallel execution" header |
| Partial outputs | Shown inline as they stream; blinking cursor while `is_final: false` |
| Cancelled (sufficient_data) | Teal "Completed early" — positive/neutral, not alarming |
| Dependencies | Chip badges coloured by dependency status; no graph needed for this scale |

## Known gaps / given more time

- **Accessibility**: ARIA live regions for streaming content; keyboard navigation on collapsibles.
- **Virtualization**: task list would need windowing for runs with hundreds of tasks.
- **Real transport**: `MockEventEmitter` is a drop-in; swap it for a `WebSocket` or `EventSource` adapter with the same `onEvent` callback.
- **System-level thoughts** (`task_id: null`): stored in state, not yet rendered — would add a dismissible system log panel.
- **Dependency graph toggle**: chip badges work for small pipelines; a DAG view would help for complex runs.
- **Animation**: task cards could animate in on spawn for a more live feel.

## AI assistance disclosure

This project was built with Claude (Anthropic) as a coding assistant. Claude generated initial component scaffolding and fixture data based on the spec. All product decisions — information hierarchy, status semantics, parallel layout, the "Completed early" framing for `sufficient_data` cancellations — were made and directed by me. The DECISIONS.md reflects my own reasoning, written with Claude's help drafting the prose. As the assessment instructs: I drove the product decisions; Claude was the keyboard.

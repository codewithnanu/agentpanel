# Design Decisions

## 1. Agent Thoughts — shown on demand, collapsed by default

**Decision:** Coordinator thoughts are shown in a collapsible section at the top of the task list, collapsed by default. Per-task agent thoughts (e.g. t_005's synthesis reasoning) are collapsible within the task card, also collapsed by default.

**Why:** The primary user is a financial analyst who wants the answer, not a transcript of the AI's internal monologue. Surfacing thoughts by default would bury the actual task progress and output beneath verbose planning text. However, analysts do sometimes want to audit the reasoning — particularly when a run produces a surprising output or makes an unexpected decision like cancelling a task early. Collapsing by default respects the analyst's time; the toggle respects their curiosity. If user research showed analysts regularly opening the thought panel (>50% of sessions), I'd reconsider and show the most recent thought inline at a reduced opacity instead.

**What would cause me to reconsider:** Evidence that analysts distrust outputs they can't see the reasoning for — particularly for cancelled or retried tasks. In that case I'd surface a one-line reasoning summary inline rather than hiding it entirely.

---

## 2. Parallel Task Layout — indigo-bordered grid section

**Decision:** Tasks with the same `parallel_group` are rendered inside a labelled container with an indigo border and a "Parallel execution — N tasks running simultaneously" header. Inside, tasks are laid out in a responsive CSS grid (1 column on mobile, up to 3 columns on wide screens).

**Why:** In a vertical list, three tasks with no visual relationship look sequential even if they're not. I considered a timeline/swimlane view but that adds complexity and requires fixed heights. The bracketed grid communicates concurrency at a glance: if you see three cards side-by-side, they're running at the same time. The indigo colour is distinct from the task card status colours (blue/green/amber/red/teal) so the grouping container doesn't accidentally imply a status. The header shows a live "N in flight" counter that updates as tasks complete.

**What would cause me to reconsider:** If analysts consistently have >3 tasks in a parallel group, the 3-column grid becomes cramped. At that point I'd move to a single-column stacked layout with a left-side timeline marker to convey concurrency without horizontal overflow.

---

## 3. Partial Outputs (is_final: false) — shown inline with streaming cursor

**Decision:** Partial outputs are displayed inline within the task card as they arrive, replacing the previous partial content. A blinking cursor (`▊`) appears at the end of the text while the output is still streaming (`is_final: false`). When the final output arrives (`is_final: true`), the cursor disappears and a quality score badge appears.

**Why:** Showing the content as it streams gives the analyst a real-time sense of progress — they can start reading and forming a view before the task completes. Discarding intermediates would mean the card stays blank for a long period, which increases perceived wait time and reduces trust. Collapsing intermediates into a log would hide information without adding clarity. The blinking cursor is a familiar "typing" metaphor that communicates "this is still being written" without requiring a separate status indicator. I intentionally show only the *latest* partial output (not all accumulated partials) to avoid a scrolling wall of text.

**What would cause me to reconsider:** If intermediate outputs frequently contain contradictions that confuse analysts before the final version arrives. In that case I'd add a subtle "draft" watermark and only surface the final output prominently, keeping intermediates in a collapsible "show streaming history" section.

---

## 4. Cancelled with reason: "sufficient_data" — positive neutral framing

**Decision:** A `cancelled` task with `reason: "sufficient_data"` is displayed with:
- Status badge: "Completed early" (teal/cyan, not red)
- Status dot: teal, no pulse
- Border: teal-900 (not red-900)
- The `message` field is shown as an indented teal quote below the task header

**Why:** This is an intentional coordinator decision, not a failure. Showing it with red or an X would alarm the analyst unnecessarily — they'd wonder what went wrong. The teal colour is in the cool-neutral family (not green/success, not red/failure) and "Completed early" communicates finality without negativity. The coordinator's message ("3 of 4 peers fetched — proceeding") provides the rationale inline, which is exactly what the analyst needs to trust the output. Distinguishing this from a permanent failure is critical: a task cancelled with `sufficient_data` means the system is working correctly; a permanently failed task means something went wrong.

**What would cause me to reconsider:** If analysts frequently interpret "Completed early" as a data quality warning. An alternative framing like "Skipped — sufficient data" or "Not needed" might be clearer. I'd A/B test the label copy.

---

## 5. Task Dependency Display — inline chip badges on the dependent task

**Decision:** Tasks with a non-empty `depends_on` array show a row of small chip badges below their label, labelled "Depends on: [t_001] [t_002] [t_003]". Each chip shows the task ID and is coloured by that dependency task's *current status* (blue=running, green=complete, teal=cancelled). The chips update live as dependency tasks finish.

**Why:** Drawing dependency arrows in a vertical list is complex and typically requires a separate graph view. For the analyst's purpose — understanding *why* a task started when it did — the chip row is sufficient. It answers "what did this task wait for?" and the live colouring answers "are those things done?" For t_005 which depends on t_001/t_002/t_003 (where t_004 was cancelled but is *not* in the depends_on array), the chips correctly show only the three declared dependencies — all green by the time t_005 starts. The cancelled t_004 is not shown as a dependency because the coordinator already handled that decision; the chips reflect what the task *actually needed*, not what ran alongside it.

**What would cause me to reconsider:** If the set of possible tasks grows large enough that task IDs become meaningless to analysts. In that case I'd show the dependency task's short label (truncated) in the chip rather than the ID. I'd also consider a hover tooltip on each chip showing the full task label and output summary.

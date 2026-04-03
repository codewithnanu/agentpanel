export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full border-2 border-gray-700 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      </div>
      <h2 className="text-gray-300 font-medium text-lg mb-2">No active research run</h2>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
        Select a fixture above to watch an agent run unfold in real time — tasks spawning,
        tools being called, and a synthesis emerging.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 text-left max-w-md w-full">
        {[
          ['Success scenario', 'Full run: Apple R&D vs peers. Includes parallel execution, a retry, and a cancelled task.'],
          ['Error scenario', 'Partial run: Amazon logistics capex. Coordinator fails mid-way; partial results remain visible.'],
        ].map(([title, desc]) => (
          <div key={title} className="border border-gray-800 rounded-lg p-4">
            <div className="text-gray-300 text-sm font-medium mb-1">{title}</div>
            <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FinalOutput({ output, runStatus, error }) {
  if (runStatus === 'failed') {
    return (
      <div className="mt-8 border-2 border-red-900 rounded-xl p-6 bg-red-950/20">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-red-300 font-semibold text-base">Run failed</h2>
        </div>
        {error && (
          <p className="text-red-400 text-sm leading-relaxed">{error}</p>
        )}
        <p className="mt-2 text-gray-500 text-sm">
          Partial results from completed tasks are shown above.
        </p>
      </div>
    )
  }

  if (!output) return null

  return (
    <div className="mt-8 border-2 border-green-800 rounded-xl overflow-hidden bg-green-950/10">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-6 py-3 bg-green-950/40 border-b border-green-900">
        <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <h2 className="text-green-300 font-semibold text-sm uppercase tracking-wider">
          Research complete
        </h2>
      </div>

      {/* Summary */}
      <div className="px-6 py-5">
        <p className="text-gray-100 text-base leading-relaxed">{output.summary}</p>
      </div>

      {/* Citations */}
      {output.citations && output.citations.length > 0 && (
        <div className="px-6 pb-5 border-t border-gray-800 pt-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
            Sources
          </div>
          <div className="space-y-1.5">
            {output.citations.map((c) => (
              <div key={c.ref_id} className="flex items-baseline gap-2 text-sm">
                <span className="text-green-600 font-mono text-xs shrink-0">[{c.ref_id}]</span>
                <span className="text-gray-300">{c.title}</span>
                <span className="text-gray-600">—</span>
                <span className="text-gray-500 text-xs">{c.source}</span>
                <span className="text-gray-600 text-xs">p.{c.page}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

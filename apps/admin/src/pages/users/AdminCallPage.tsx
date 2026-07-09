/**
 * Admin Call Center — Operator Dashboard
 * WebRTC seam: joins LiveKit rooms, call log, recording linkage
 * Engine gated on LiveKit keys
 */

export function AdminCallPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Call Center</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Operator WebRTC dashboard</p></div>
        <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-200 dark:border-amber-500/20">LiveKit Seam</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Call Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📞</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready for calls</div>
          <div className="text-sm text-gray-400 text-center">Waiting for client call requests.<br/>Calls appear here when a client connects from their dashboard.</div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {l:'Today',v:'0'},
              {l:'Active',v:'0'},
              {l:'Queued',v:'0'},
            ].map(s => (
              <div key={s.l} className="text-center p-4 bg-gray-50 dark:bg-[#161B22] rounded-xl">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.v}</div>
                <div className="text-[10px] text-gray-400 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Log */}
        <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161B22]"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Calls</h3></div>
          <div className="p-6 text-center text-sm text-gray-400">No call history yet.</div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Engine Wiring Required</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• <b>LiveKit</b> — Set <code>LIVEKIT_API_KEY</code>, <code>LIVEKIT_API_SECRET</code>, <code>LIVEKIT_URL</code> in Render env</p>
          <p>• <b>PSTN Dial-out</b> — Set <code>DIALER_OUTBOUND_TRUNK_ID</code> for outbound phone calling</p>
          <p>• <b>SMS</b> — Set <code>SMS_PROVIDER_KEY</code> for two-way messaging</p>
          <p>• <b>WhatsApp</b> — Meta Cloud API onboarding for outbound WhatsApp</p>
          <p>• <b>TURN Server</b> — Required for WebRTC on symmetric NAT networks</p>
        </div>
      </div>
    </div>
  );
}

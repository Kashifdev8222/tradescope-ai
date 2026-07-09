/**
 * WebRTC Account Manager Call — UI Shell
 *
 * ENGINE HANDOFF (do NOT implement in frontend):
 *   - getUserMedia({ audio: true }) — acquire microphone
 *   - getDisplayMedia({ video: true }) — screen capture on Share toggle
 *   - Signaling + RTCPeerConnection to operator dashboard (LiveKit or custom)
 *   - Share ON  → addTrack(screenTrack) to peer connection
 *   - Share OFF → removeTrack(screenTrack) from peer connection
 *   - End       → close() peer connection + stop all tracks
 *
 * Type: Audio + Screen Share
 * Entry point: ManagerCard on Dashboard
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';

const STATES = ['connecting', 'connected', 'sharing'] as const;
type CallState = typeof STATES[number];

export function CallPage() {
  const [searchParams] = useSearchParams();
  const forcedState = searchParams.get('state') as CallState | null;
  const [state, setState] = useState<CallState>(
    forcedState && STATES.includes(forcedState) ? forcedState : 'connecting'
  );

  // Allow ?state= param to override for preview/testing
  useEffect(() => {
    if (forcedState && STATES.includes(forcedState)) setState(forcedState);
  }, [forcedState]);

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div><h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Manager Call</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Audio + Screen Share</p></div>

      <div className="bg-white dark:bg-[#1C2128] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-green-700 dark:text-green-400">SM</div>
        <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">Sarah Mitchell</div>
        <div className="text-sm text-gray-500 mb-6">Account Manager</div>

        {/* State badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 ${
          state === 'connected' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' :
          state === 'sharing' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' :
          'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full ${state === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          {state === 'connecting' ? 'Connecting...' : state === 'sharing' ? 'Screen Sharing' : 'Connected'}
        </div>

        {/* Controls: Mute / Speaker / Share / End */}
        <div className="flex items-center justify-center gap-4">
          {/* Mute — toggles audio track */}
          <button onClick={() => { /* ENGINE: toggle audio track enabled */ }} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" title="Mute">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>

          {/* Share Screen — toggle add/remove screen track */}
          <button onClick={() => setState(state === 'sharing' ? 'connected' : 'sharing')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${state === 'sharing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`} title="Share Screen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </button>

          {/* End Call — ENGINE: close peer connection + stop all tracks */}
          <button onClick={() => { /* ENGINE: close connection */ window.history.back(); }} className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20" title="End Call">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M22 16.92v3a2 2 0 0 1-2.18 2"/></svg>
          </button>

          {/* Speaker */}
          <button className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" title="Speaker">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Audio + screen share via WebRTC. Use <code className="px-1 bg-gray-100 dark:bg-gray-800 rounded">?state=connected</code> or <code className="px-1 bg-gray-100 dark:bg-gray-800 rounded">?state=sharing</code> to preview states.
      </p>
    </div>
  );
}

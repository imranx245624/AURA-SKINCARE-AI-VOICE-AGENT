import React from 'react';
import { Mic, PhoneOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import './CallControls.css';

/**
 * CallControls Component
 * Provides interactive Start Call, End Call, Mute, and Call Duration controls.
 */
export function CallControls({
  isCallActive,
  callStatus,
  onStartCall,
  onEndCall,
  isMuted,
  onToggleMute,
  callDuration = 0,
  speechSupported = true
}) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-controls-container">
      {!isCallActive ? (
        <div className="controls-idle-group">
          <button
            type="button"
            className="btn-call btn-start-call"
            onClick={onStartCall}
            aria-label="Start Voice Call with Aria"
          >
            <span className="btn-icon-wrapper">
              <Mic size={22} className="btn-icon" />
            </span>
            <div className="btn-text-content">
              <span className="btn-primary-text">Start Call</span>
              <span className="btn-sub-text">Speak with Aria</span>
            </div>
          </button>

          {!speechSupported && (
            <div className="speech-unsupported-note" role="alert">
              <AlertCircle size={16} />
              <span>
                Speech Recognition is unavailable in this browser. You can still test via the text input!
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="controls-active-group">
          {/* Active Call Status & Duration */}
          <div className="active-meta-card">
            <div className="live-call-indicator">
              <span className="live-dot" />
              <span className="live-label">LIVE CALL</span>
            </div>
            <div className="call-timer-display" aria-label={`Call duration ${formatDuration(callDuration)}`}>
              {formatDuration(callDuration)}
            </div>
          </div>

          <div className="active-actions-row">
            {/* End Call Button */}
            <button
              type="button"
              className="btn-call btn-end-call"
              onClick={onEndCall}
              aria-label="End Current Call"
            >
              <PhoneOff size={20} className="btn-icon" />
              <span>End Call</span>
            </button>

            {/* Mute / Unmute Button */}
            <button
              type="button"
              className={`btn-action-icon ${isMuted ? 'is-muted' : ''}`}
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Aria' : 'Mute Aria'}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallControls;

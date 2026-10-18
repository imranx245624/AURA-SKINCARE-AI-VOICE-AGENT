import React from 'react';
import { Mic, Sparkles, Volume2, AlertTriangle, Coffee } from 'lucide-react';
import './AgentStatus.css';

/**
 * AgentStatus Component
 * Displays Aria's live visual presence, state badge, and animated audio waveforms.
 */
export function AgentStatus({ status = 'idle', error = null }) {
  // Config mapping for each state
  const statusConfig = {
    idle: {
      label: 'Idle • Ready',
      subtext: 'Click Start Call to speak with Aria',
      icon: Coffee,
      badgeClass: 'status-badge-idle',
      orbClass: 'orb-idle'
    },
    listening: {
      label: 'Listening...',
      subtext: 'Speak into your microphone naturally',
      icon: Mic,
      badgeClass: 'status-badge-listening',
      orbClass: 'orb-listening'
    },
    thinking: {
      label: 'Thinking...',
      subtext: 'Checking brand policies & order details',
      icon: Sparkles,
      badgeClass: 'status-badge-thinking',
      orbClass: 'orb-thinking'
    },
    speaking: {
      label: 'Speaking...',
      subtext: 'Aria is answering your question',
      icon: Volume2,
      badgeClass: 'status-badge-speaking',
      orbClass: 'orb-speaking'
    },
    error: {
      label: 'Attention Needed',
      subtext: error || 'An error occurred during voice communication',
      icon: AlertTriangle,
      badgeClass: 'status-badge-error',
      orbClass: 'orb-error'
    }
  };

  const current = statusConfig[status] || statusConfig.idle;
  const IconComponent = current.icon;

  return (
    <div className="agent-status-card">
      <div className="avatar-section">
        {/* Animated Presence Orb */}
        <div className={`presence-orb-outer ${current.orbClass}`}>
          <div className="presence-orb-inner">
            <span className="avatar-initials">A</span>
          </div>

          {/* Sound Wave Bars when Speaking or Listening */}
          {(status === 'speaking' || status === 'listening') && (
            <div className="audio-wave-bars">
              <span className="wave-bar bar-1" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-3" />
              <span className="wave-bar bar-4" />
              <span className="wave-bar bar-5" />
            </div>
          )}

          {/* Thinking Pulsing Orbit */}
          {status === 'thinking' && (
            <div className="thinking-orbit">
              <span className="orbit-dot" />
            </div>
          )}
        </div>

        {/* Aria Identity Info */}
        <div className="agent-info">
          <div className="agent-name-row">
            <h2 className="agent-name">Aria</h2>
            <span className="brand-pill">Aura Skincare</span>
          </div>
          <p className="agent-role">AI Voice Customer Support Specialist</p>
        </div>
      </div>

      {/* Live State Badge */}
      <div className="status-badge-container">
        <div className={`status-pill ${current.badgeClass}`}>
          <IconComponent size={14} className="status-icon" />
          <span className="status-label">{current.label}</span>
        </div>
        <p className="status-subtext">{current.subtext}</p>
      </div>
    </div>
  );
}

export default AgentStatus;

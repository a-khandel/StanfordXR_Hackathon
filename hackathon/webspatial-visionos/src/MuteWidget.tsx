import { useState } from "react";
import "./MuteWidget.css";

function MuteWidget() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="mute-widget">
      <button
        className={`mute-bubble ${isMuted ? "muted" : "unmuted"}`}
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <div className="bubble-ripple"></div>
        <div className="bubble-icon">
          {isMuted ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </div>
        <div className="bubble-pulse"></div>
      </button>
    </div>
  );
}

export default MuteWidget;

export function Splash() {
  return (
    <div className="splash">
      <div className="splash-mark">
        <svg className="splash-ring" width="112" height="112" viewBox="0 0 112 112">
          <circle
            cx="56"
            cy="56"
            r="50"
            fill="none"
            stroke="#c3b6ef"
            strokeWidth="2"
            strokeDasharray="6 5"
            strokeLinecap="round"
          />
        </svg>
        <img src="/logo.png" alt="" className="splash-logo" />
        <div className="splash-pencil">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <rect x="9" y="1" width="8" height="17" rx="2" fill="#e8d9c4" />
            <rect x="9" y="1" width="8" height="4" fill="#6b6660" />
            <polygon points="9,18 17,18 13,25" fill="#c9b79a" />
          </svg>
        </div>
      </div>
      <div className="splash-wordmark">study-log</div>
      <div className="splash-caption">색연필로 그리는 중…</div>
    </div>
  )
}

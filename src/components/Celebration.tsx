import { Modal } from './Modal'
import type { CelebrationState } from '../hooks/useCelebration'

export function CelebrationView({ active, onDismiss }: { active: CelebrationState | null; onDismiss: () => void }) {
  if (!active) return null

  if (active.tier === 'top') {
    return (
      <Modal onClose={onDismiss}>
        <div className="celebration-modal">
          <span className="celebration-modal-emoji" aria-hidden="true">
            {active.emoji}
          </span>
          <h2>{active.message}</h2>
          <button type="button" className="btn btn-primary btn-block" onClick={onDismiss}>
            확인
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <div className={`celebration-toast celebration-toast--${active.tier}`} role="status">
      <span className="celebration-toast-emoji" aria-hidden="true">
        {active.emoji}
      </span>
      <span className="celebration-toast-text">{active.message}</span>
    </div>
  )
}

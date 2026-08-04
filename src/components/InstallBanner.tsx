import { useEffect, useState } from 'react'
import { Modal } from './Modal'

const DISMISS_KEY = 'install-banner-dismissed-at'
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios' | null

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return null
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isRecentlyDismissed(): boolean {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
  return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS
}

export function InstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(true)
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    setPlatform(detectPlatform())
    setDismissed(isRecentlyDismissed())
  }, [])

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  async function handleInstallClick() {
    if (platform === 'ios') {
      setShowIosSteps(true)
      return
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      handleDismiss()
    }
  }

  const canShow = !dismissed && (platform === 'ios' || (platform === 'android' && deferredPrompt))
  if (!canShow) return null

  return (
    <>
      <div className="install-banner">
        <img src="/logo.png" alt="" className="install-banner-logo" />
        <div className="install-banner-text">
          <strong>study-log를 홈 화면에 추가하세요</strong>
          <span>앱처럼 더 빠르고 편하게 이용할 수 있어요</span>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={handleInstallClick}>
          추가
        </button>
        <button type="button" className="install-banner-close" onClick={handleDismiss} aria-label="닫기">
          ×
        </button>
      </div>

      {showIosSteps && (
        <Modal onClose={() => setShowIosSteps(false)}>
          <h2>홈 화면에 추가하기</h2>
          <ol className="install-steps">
            <li>Safari 하단의 공유 버튼을 탭하세요</li>
            <li>메뉴에서 "홈 화면에 추가"를 선택하세요</li>
            <li>오른쪽 위 "추가"를 탭하면 완료돼요</li>
          </ol>
          <button type="button" className="btn btn-primary btn-block" onClick={() => setShowIosSteps(false)}>
            확인
          </button>
        </Modal>
      )}
    </>
  )
}

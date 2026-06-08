import { createContext, useContext, useRef, useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'

interface LenisContextValue {
  lenisRef: React.MutableRefObject<Lenis | null>
}

const LenisContext = createContext<LenisContextValue>({ lenisRef: { current: null } })

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // Don't hijack keyboard arrow / page / space keys — they must
      // reach form inputs inside modals so users can type normally.
      keys: false,
    } as any)

    lenisRef.current = lenis

    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <LenisContext.Provider value={{ lenisRef }}>{children}</LenisContext.Provider>
}

export function useLenis() {
  return useContext(LenisContext)
}

/** Stop Lenis while a modal is open. Restores on unmount.
 *  Implementation: freeze the body in place via position:fixed at the
 *  current scroll offset, then restore everything on unmount. This takes
 *  the document out of Lenis's scroll observation entirely, so wheel /
 *  touchpad events pass through to the modal's own scroll container.
 */
export function useStopLenis(active: boolean) {
  useEffect(() => {
    if (!active) return
    const scrollY = window.scrollY
    const body = document.body
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.left = previous.left
      body.style.right = previous.right
      body.style.width = previous.width
      body.style.overflow = previous.overflow
      window.scrollTo(0, scrollY)
    }
  }, [active])
}

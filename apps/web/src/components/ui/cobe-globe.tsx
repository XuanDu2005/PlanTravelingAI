import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

export interface Marker {
  id: string
  location: [number, number]
  label: string
  countryCode?: string
  highlight?: boolean
}

export interface Arc {
  id: string
  from: [number, number]
  to: [number, number]
  label?: string
  hasAirplane?: boolean
  flightOffset?: number
  flightSpeed?: number
}

export interface GlobeProps {
  markers?: Marker[]
  arcs?: Arc[]
  className?: string
  markerColor?: [number, number, number]
  baseColor?: [number, number, number]
  arcColor?: [number, number, number]
  glowColor?: [number, number, number]
  dark?: number
  mapBrightness?: number
  markerSize?: number
  markerElevation?: number
  arcWidth?: number
  arcHeight?: number
  speed?: number
  theta?: number
  diffuse?: number
  mapSamples?: number
}

// Convert [lat, lon] to 3D Cartesian coordinates
function latLonToVec3(lat: number, lon: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180
  const theta = (lon * Math.PI) / 180
  return [
    Math.cos(phi) * Math.sin(theta),
    Math.sin(phi),
    Math.cos(phi) * Math.cos(theta),
  ]
}

// Exact Quadratic Bezier in 3D (matches Cobe's WebGL arc rendering)
function computeBezierArcPoint(
  p0: [number, number, number],
  p2: [number, number, number],
  arcHeight: number,
  t: number
): [number, number, number] {
  const mx = (p0[0] + p2[0]) / 2
  const my = (p0[1] + p2[1]) / 2
  const mz = (p0[2] + p2[2]) / 2
  const len = Math.sqrt(mx * mx + my * my + mz * mz) || 1

  const elevation = 1 + arcHeight
  const p1x = (mx / len) * elevation
  const p1y = (my / len) * elevation
  const p1z = (mz / len) * elevation

  const oneMinusT = 1 - t
  const w0 = oneMinusT * oneMinusT
  const w1 = 2 * oneMinusT * t
  const w2 = t * t

  return [
    w0 * p0[0] + w1 * p1x + w2 * p2[0],
    w0 * p0[1] + w1 * p1y + w2 * p2[1],
    w0 * p0[2] + w1 * p1z + w2 * p2[2],
  ]
}

/**
 * Realistic 3D Passenger Airliner SVG
 */
function RealisticAirlinerJet() {
  return (
    <div className="relative filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <svg
        viewBox="0 0 100 60"
        className="w-7 h-4.5 sm:w-8 sm:h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id="blueWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="engineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>

        {/* Back Wing */}
        <path
          d="M38 18 L48 6 C51 3, 56 3, 58 6 L52 20 Z"
          fill="url(#blueWingGrad)"
          stroke="#0369A1"
          strokeWidth="0.8"
        />

        {/* Tail Fin */}
        <path
          d="M10 24 L2 9 C1 6, 6 6, 9 8 L22 24 Z"
          fill="url(#blueWingGrad)"
          stroke="#0369A1"
          strokeWidth="0.8"
        />
        {/* Horizontal Tail */}
        <path
          d="M12 28 L3 36 C1 38, 5 40, 8 38 L20 30 Z"
          fill="url(#blueWingGrad)"
          stroke="#0369A1"
          strokeWidth="0.7"
        />

        {/* Jet Engine Nacelle */}
        <rect
          x="44"
          y="35"
          width="16"
          height="8"
          rx="4"
          fill="url(#engineGrad)"
          stroke="#64748B"
          strokeWidth="0.8"
        />
        <ellipse cx="60" cy="39" rx="2" ry="3.5" fill="#334155" />

        {/* Main Fuselage */}
        <path
          d="M6 28 C6 21, 20 18, 58 18 C78 18, 92 23, 98 28 C92 34, 75 38, 50 38 C20 38, 6 35, 6 28 Z"
          fill="url(#fuselageGrad)"
          stroke="#94A3B8"
          strokeWidth="0.8"
        />

        {/* Decorative Cheatline */}
        <path
          d="M14 28 C30 28, 70 27, 95 28 C90 29.5, 70 30, 14 30 Z"
          fill="#0284C7"
        />

        {/* Cockpit Window */}
        <path
          d="M82 22 C86 22, 90 24, 91 26 C88 27, 83 26, 80 25 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="0.5"
        />

        {/* Passenger Windows */}
        <circle cx="28" cy="25" r="1.6" fill="#334155" />
        <circle cx="36" cy="25" r="1.6" fill="#334155" />
        <circle cx="44" cy="25" r="1.6" fill="#334155" />
        <circle cx="52" cy="25" r="1.6" fill="#334155" />
        <circle cx="60" cy="25" r="1.6" fill="#334155" />
        <circle cx="68" cy="25" r="1.6" fill="#334155" />
        <circle cx="75" cy="25" r="1.6" fill="#334155" />

        {/* Front Wing */}
        <path
          d="M40 28 L30 52 C28 55, 33 57, 36 55 L58 31 Z"
          fill="url(#blueWingGrad)"
          stroke="#0284C7"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  )
}

export function Globe({
  markers = [],
  arcs = [],
  className = "",
  markerColor = [0.22, 0.74, 0.97],
  baseColor = [0.18, 0.42, 0.92],
  arcColor = [0.45, 0.7, 0.98],
  glowColor = [0.22, 0.74, 0.97],
  dark = 1,
  mapBrightness = 8.5,
  markerSize = 0.035,
  markerElevation = 0.015,
  arcWidth = 0.65,
  arcHeight = 0.3,
  speed = 0.0014,
  theta = 0.2,
  diffuse = 1.4,
  mapSamples = 16000,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const markerRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const planeRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 320, theta: deltaY / 850 }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0
    const startTime = performance.now()

    // Precalculate 3D vectors
    const marker3DData = markers.map((m) => ({
      id: m.id,
      vec: latLonToVec3(m.location[0], m.location[1]),
    }))

    const airplaneArcs = arcs.filter((a) => a.hasAirplane === true).map((a) => ({
      id: a.id,
      p0: latLonToVec3(a.from[0], a.from[1]),
      p2: latLonToVec3(a.to[0], a.to[1]),
      flightSpeed: a.flightSpeed || 0.06,
      flightOffset: a.flightOffset || 0,
    }))

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: width * dpr,
        height: width * dpr,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markers.map((m) => ({
          location: m.location,
          size: m.highlight ? markerSize * 1.35 : markerSize,
          id: m.id,
        })),
        arcs: arcs.map((a) => ({
          from: a.from,
          to: a.to,
          id: a.id,
        })),
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.78,
      })

      function animate(now: number) {
        if (!isPausedRef.current) {
          phi += speed
        }

        const currentPhi = phi + phiOffsetRef.current + dragOffset.current.phi
        const currentTheta = theta + thetaOffsetRef.current + dragOffset.current.theta

        globe?.update({
          phi: currentPhi,
          theta: currentTheta,
        })

        const cosPhi = Math.cos(currentPhi)
        const sinPhi = Math.sin(currentPhi)
        const cosTheta = Math.cos(currentTheta)
        const sinTheta = Math.sin(currentTheta)

        const projectPoint = (v: [number, number, number]) => {
          const x1 = v[0] * cosPhi + v[2] * sinPhi
          const y1 = v[1]
          const z1 = -v[0] * sinPhi + v[2] * cosPhi

          const y2 = y1 * cosTheta - z1 * sinTheta
          const z2 = y1 * sinTheta + z1 * cosTheta

          return {
            x: ((x1 + 1) / 2) * 100,
            y: ((-y2 + 1) / 2) * 100,
            z: z2,
          }
        }

        // 1. Direct positioning using parent % (left/top) for Markers
        for (let i = 0; i < marker3DData.length; i++) {
          const m = marker3DData[i]
          const el = markerRefs.current.get(m.id)
          if (!el) continue

          const proj = projectPoint(m.vec)
          if (proj.z > 0.08) {
            const opacity = Math.min(1, Math.max(0, (proj.z - 0.08) / 0.42))
            el.style.left = `${proj.x.toFixed(2)}%`
            el.style.top = `${proj.y.toFixed(2)}%`
            el.style.opacity = opacity.toFixed(3)
            el.style.visibility = "visible"
          } else {
            el.style.opacity = "0"
            el.style.visibility = "hidden"
          }
        }

        // 2. Direct positioning using parent % (left/top) and angle for Airplanes
        const elapsedTime = (now - startTime) / 1000

        for (let i = 0; i < airplaneArcs.length; i++) {
          const arc = airplaneArcs[i]
          const el = planeRefs.current.get(arc.id)
          if (!el) continue

          const progress = (elapsedTime * arc.flightSpeed + arc.flightOffset) % 1
          const p3D = computeBezierArcPoint(arc.p0, arc.p2, arcHeight, progress)
          const nextP = Math.min(progress + 0.005, 0.999)
          const nextP3D = computeBezierArcPoint(arc.p0, arc.p2, arcHeight, nextP)

          const proj = projectPoint(p3D)
          const nextProj = projectPoint(nextP3D)

          if (proj.z > 0.12) {
            const opacity = Math.min(1, Math.max(0, (proj.z - 0.12) / 0.32))
            const dx = nextProj.x - proj.x
            const dy = nextProj.y - proj.y
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI

            el.style.left = `${proj.x.toFixed(2)}%`
            el.style.top = `${proj.y.toFixed(2)}%`
            el.style.transform = `translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`
            el.style.opacity = opacity.toFixed(3)
            el.style.visibility = "visible"
          } else {
            el.style.opacity = "0"
            el.style.visibility = "hidden"
          }
        }

        animationId = requestAnimationFrame(animate)
      }

      animationId = requestAnimationFrame(animate)
      setTimeout(() => canvas && (canvas.style.opacity = "1"), 50)
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [
    markers,
    arcs,
    markerColor,
    baseColor,
    arcColor,
    glowColor,
    dark,
    mapBrightness,
    markerSize,
    markerElevation,
    arcWidth,
    arcHeight,
    speed,
    theta,
    diffuse,
    mapSamples,
  ])

  const activeAirplanes = arcs.filter((a) => a.hasAirplane === true)

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      {/* 3D WebGL Canvas Globe */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />

      {/* Dynamic 3D Projected Landmark Tags */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {markers.map((m) => (
          <div
            key={m.id}
            ref={(el) => {
              if (el) markerRefs.current.set(m.id, el)
              else markerRefs.current.delete(m.id)
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -125%) scale(0.92)",
              visibility: "hidden",
              willChange: "left, top, opacity",
            }}
            className="flex flex-col items-center pointer-events-none select-none z-30"
          >
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shadow-xl border backdrop-blur-md transition-all duration-300 ${
                m.highlight
                  ? "bg-gradient-to-r from-blue-600/95 via-indigo-600/90 to-cyan-600/95 text-white border-cyan-300/80 shadow-cyan-500/40 ring-1 ring-cyan-400/30"
                  : "bg-slate-900/90 text-slate-100 border-sky-400/35 shadow-black/70"
              }`}
            >
              {m.countryCode && (
                <img
                  src={`https://flagcdn.com/w40/${m.countryCode.toLowerCase()}.png`}
                  alt={m.countryCode}
                  className="w-4 h-2.5 object-cover rounded-xs shadow-xs shrink-0"
                  loading="lazy"
                />
              )}
              <span className="leading-tight whitespace-nowrap">{m.label}</span>
              {m.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping inline-block shrink-0 -ml-0.5" />
              )}
            </div>
            <div className="w-1 h-2 bg-gradient-to-b from-cyan-400 to-transparent -mt-0.5 shadow-sm" />
          </div>
        ))}
      </div>

      {/* Dynamic 3D Flying Airplanes */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {activeAirplanes.map((arc) => (
          <div
            key={arc.id}
            ref={(el) => {
              if (el) planeRefs.current.set(arc.id, el)
              else planeRefs.current.delete(arc.id)
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              visibility: "hidden",
              willChange: "left, top, opacity, transform",
            }}
            className="z-40 pointer-events-none select-none flex items-center justify-center"
          >
            <RealisticAirlinerJet />
          </div>
        ))}
      </div>
    </div>
  )
}
export default Globe;

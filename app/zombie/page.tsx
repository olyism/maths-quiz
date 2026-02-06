'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

const GAME_DURATION_SEC = 3 * 60
const HERO_ZONE_PERCENT = 10
const ZOMBIE_START_X = 98
const ZOMBIE_SPEED_PERCENT_PER_SEC = 6
const SPAWN_INTERVAL_MS = 4500
const POOP_COUNT = 40

type Zombie = {
  id: number
  question: string
  answer: number
  x: number
  y: number
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateZombieQuestion(): { question: string; answer: number } {
  const roll = Math.random()
  if (roll < 0.4) {
    // Addition/subtraction with negatives
    const a = randomInt(-12, 12)
    const b = randomInt(-12, 12)
    const op = Math.random() > 0.5 ? '+' : '-'
    const answer = op === '+' ? a + b : a - b
    const displayA = a < 0 ? `(${a})` : `${a}`
    const displayB = b < 0 ? `(${b})` : `${b}`
    return { question: `${displayA} ${op} ${displayB} = ?`, answer }
  }
  if (roll < 0.7) {
    // 4 or 6 times table multiplication
    const base = Math.random() > 0.5 ? 4 : 6
    const mult = randomInt(1, 12)
    return { question: `${base} × ${mult} = ?`, answer: base * mult }
  }
  // Division (4 or 6)
  const divisor = Math.random() > 0.5 ? 4 : 6
  const quotient = randomInt(1, 12)
  const result = divisor * quotient
  return { question: `${result} ÷ ${divisor} = ?`, answer: quotient }
}

function spawnZombie(id: number): Zombie {
  const { question, answer } = generateZombieQuestion()
  const y = 20 + Math.random() * 60 // % from top
  return {
    id,
    question,
    answer,
    x: ZOMBIE_START_X,
    y,
  }
}

export default function ZombieGamePage() {
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [zombies, setZombies] = useState<Zombie[]>([])
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC)
  const [answerInput, setAnswerInput] = useState('')
  const [laserFeedback, setLaserFeedback] = useState<'hit' | 'miss' | null>(null)
  const [poopEmojis, setPoopEmojis] = useState<Array<{ id: number; x: number; y: number }>>([])
  const nextIdRef = useRef(1)
  const lastTimeRef = useRef<number>(0)
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number>(0)

  const startGame = useCallback(() => {
    setGameStatus('playing')
    setZombies([])
    setLives(3)
    setTimeLeft(GAME_DURATION_SEC)
    setAnswerInput('')
    setLaserFeedback(null)
    setPoopEmojis([])
    nextIdRef.current = 1
  }, [])

  // Game timer
  useEffect(() => {
    if (gameStatus !== 'playing') return
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameStatus('won')
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#22c55e', '#eab308', '#3b82f6', '#a855f7', '#ec4899'],
          })
          setTimeout(() => {
            confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } })
            confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } })
          }, 300)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [gameStatus])

  // Spawn zombies
  useEffect(() => {
    if (gameStatus !== 'playing') return
    spawnTimerRef.current = setInterval(() => {
      setZombies((z) => [...z, spawnZombie(nextIdRef.current++)])
    }, SPAWN_INTERVAL_MS)
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current)
    }
  }, [gameStatus])

  // Movement + collision
  useEffect(() => {
    if (gameStatus !== 'playing') return

    const move = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      setZombies((prev) => {
        const updated = prev
          .map((z) => ({ ...z, x: z.x - ZOMBIE_SPEED_PERCENT_PER_SEC * dt }))
          .filter((z) => {
            if (z.x <= HERO_ZONE_PERCENT) {
              setLives((l) => {
                if (l <= 1) {
                  setGameStatus('lost')
                  setPoopEmojis(() => {
                    const list: Array<{ id: number; x: number; y: number }> = []
                    for (let i = 0; i < POOP_COUNT; i++) {
                      list.push({
                        id: Date.now() + i,
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                      })
                    }
                    return list
                  })
                  confetti({
                    particleCount: 120,
                    spread: 180,
                    origin: { y: 0.6 },
                    colors: ['#78350f', '#92400e', '#a16207', '#654321', '#422006'],
                  })
                }
                return l - 1
              })
              return false
            }
            return true
          })
        return updated
      })

      rafRef.current = requestAnimationFrame(move)
    }

    lastTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(move)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gameStatus])

  const handleShoot = (e: React.FormEvent) => {
    e.preventDefault()
    if (gameStatus !== 'playing' || !answerInput.trim()) return
    const num = parseInt(answerInput.trim(), 10)
    if (Number.isNaN(num)) {
      setLaserFeedback('miss')
      setTimeout(() => setLaserFeedback(null), 600)
      setAnswerInput('')
      return
    }
    const index = zombies.findIndex((z) => z.answer === num)
    if (index >= 0) {
      setZombies((z) => z.filter((_, i) => i !== index))
      setLaserFeedback('hit')
    } else {
      setLaserFeedback('miss')
    }
    setTimeout(() => setLaserFeedback(null), 600)
    setAnswerInput('')
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (gameStatus === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
          🧟 Zombie Maths Survival
        </h1>
        <p className="text-slate-300 text-lg mb-6 text-center max-w-md">
          Zombies are coming! Type the right answer to blast them. Match <strong>any</strong> zombie’s
          answer to hit. Don’t let them reach the hero — 3 minutes, 3 lives. Good luck!
        </p>
        <button
          onClick={startGame}
          className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition"
        >
          Start game
        </button>
        <Link href="/" className="mt-6 text-slate-400 hover:text-white">
          ← Back home
        </Link>
      </div>
    )
  }

  if (gameStatus === 'won') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold text-yellow-400">You survived!</h1>
        <p className="text-slate-300 mt-2">3 minutes of zombie maths — you’re a hero.</p>
        <div className="flex gap-4 mt-8">
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full"
          >
            Play again
          </button>
          <Link href="/" className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-full">
            Home
          </Link>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-amber-900/30 to-slate-900 p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {poopEmojis.map((p) => (
            <span
              key={p.id}
              className="absolute text-4xl md:text-5xl animate-emoji-burst"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              💩
            </span>
          ))}
        </div>
        <div className="text-7xl mb-4 relative z-10">💀</div>
        <h1 className="text-4xl font-bold text-amber-400 relative z-10">Overrun by zombies!</h1>
        <p className="text-slate-300 mt-2 relative z-10">The maths was too strong this time.</p>
        <div className="flex gap-4 mt-8 relative z-10">
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full"
          >
            Try again
          </button>
          <Link href="/" className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-full">
            Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* HUD */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/30 text-white shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-yellow-400">⏱ {formatTime(timeLeft)}</span>
          <span className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className={i <= lives ? 'opacity-100' : 'opacity-30'}>
                ❤️
              </span>
            ))}
          </span>
        </div>
        <span className="text-slate-400">Type an answer &amp; shoot</span>
      </div>

      {/* Game area */}
      <div className="flex-1 relative min-h-0" style={{ minHeight: '320px' }}>
        {/* Hero (left) */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          style={{ left: 24 }}
        >
          <span className="text-6xl md:text-7xl" title="Hero">🦸</span>
          <span className="text-xs text-slate-400 mt-1">Hero</span>
        </div>

        {/* Laser line (visual only when shooting) */}
        {laserFeedback && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-1 z-[5] transition-opacity ${
              laserFeedback === 'hit' ? 'bg-green-400' : 'bg-red-500'
            }`}
            style={{
              left: `${HERO_ZONE_PERCENT}%`,
              width: '70%',
              opacity: 0.9,
            }}
          />
        )}

        {/* Zombies */}
        {zombies.map((z) => (
          <div
            key={z.id}
            className="absolute z-10 flex flex-col items-center transition-none"
            style={{
              left: `${z.x}%`,
              top: `${z.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-4xl md:text-5xl" title="Zombie">🧟</span>
            <span className="text-xs md:text-sm font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded mt-1 whitespace-nowrap">
              {z.question}
            </span>
          </div>
        ))}
      </div>

      {/* Answer input (bottom) */}
      <div className="p-4 bg-black/30 shrink-0">
        <form onSubmit={handleShoot} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto items-center">
          <label className="text-slate-300 text-sm sm:text-base">Answer:</label>
          <input
            type="number"
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            className="flex-1 w-full sm:max-w-[140px] px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white text-xl font-mono focus:border-green-500 focus:outline-none"
            placeholder="?"
            autoFocus
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg shrink-0"
          >
            🔫 Shoot
          </button>
        </form>
        <p className="text-slate-500 text-center text-sm mt-2">
          Hit any zombie whose question has that answer
        </p>
      </div>

      <Link href="/" className="absolute top-2 right-2 text-slate-500 hover:text-white text-sm">
        Exit
      </Link>
    </div>
  )
}

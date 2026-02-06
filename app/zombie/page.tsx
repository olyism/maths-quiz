'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

const HERO_ZONE_PERCENT = 10
const ZOMBIE_START_X = 98
const POOP_COUNT = 40

const TIME_OPTIONS = [
  { value: 1, label: '1 min' },
  { value: 2, label: '2 min' },
  { value: 3, label: '3 min' },
] as const

const DIFFICULTY_CONFIG = {
  easy: { speed: 4, spawnMs: 5500 },
  medium: { speed: 6, spawnMs: 4500 },
  hard: { speed: 9, spawnMs: 3000 },
} as const

type Difficulty = keyof typeof DIFFICULTY_CONFIG
type GameMode = 'maths' | 'touchtype'

type FleeingPig = { id: number; x: number; y: number; createdAt: number }

type Zombie = {
  id: number
  question: string
  matchValue: number | string
  x: number
  y: number
}

// Touch-type vocabulary by level (Year 7, Year 9, Year 12)
const VOCAB_YEAR_7 = [
  'because', 'before', 'always', 'around', 'again', 'after', 'about', 'could', 'would', 'should',
  'their', 'there', 'which', 'while', 'where', 'other', 'often', 'every', 'first', 'right',
  'think', 'thing', 'three', 'through', 'something', 'different', 'important', 'another', 'people', 'little',
  'might', 'night', 'light', 'right', 'write', 'great', 'break', 'bread', 'heard', 'early',
]

const VOCAB_YEAR_9 = [
  'although', 'however', 'therefore', 'otherwise', 'nevertheless', 'meanwhile', 'furthermore', 'consequently',
  'environment', 'government', 'parliament', 'significant', 'experience', 'experiment', 'temperature', 'opportunity',
  'recommend', 'recognise', 'appreciate', 'communicate', 'concentrate', 'demonstrate', 'immediately', 'particularly',
  'responsibility', 'possibility', 'probability', 'availability', 'approximately', 'automatically',
]

const VOCAB_YEAR_12 = [
  'notwithstanding', 'nevertheless', 'conversely', 'consequently', 'predominantly', 'contemporaneous',
  'phenomenon', 'hypothesis', 'paradigm', 'rhetoric', 'synthesis', 'analysis', 'methodology', 'philosophical',
  'entrepreneurship', 'infrastructure', 'sustainability', 'bureaucracy', 'democracy', 'constitutional',
  'multidisciplinary', 'interdisciplinary', 'unprecedented', 'controversial', 'authoritarian', 'revolutionary',
]

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

function getTouchTypeWord(difficulty: Difficulty): string {
  const list = difficulty === 'easy' ? VOCAB_YEAR_7 : difficulty === 'medium' ? VOCAB_YEAR_9 : VOCAB_YEAR_12
  return list[Math.floor(Math.random() * list.length)]
}

function spawnZombie(id: number, mode: GameMode, difficulty: Difficulty): Zombie {
  const y = 20 + Math.random() * 60
  if (mode === 'touchtype') {
    const word = getTouchTypeWord(difficulty)
    return { id, question: word, matchValue: word, x: ZOMBIE_START_X, y }
  }
  const { question, answer } = generateZombieQuestion()
  return { id, question, matchValue: answer, x: ZOMBIE_START_X, y }
}

const FLEE_DURATION_MS = 1200

export default function ZombieGamePage() {
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle')
  const [zombies, setZombies] = useState<Zombie[]>([])
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [answerInput, setAnswerInput] = useState('')
  const [laserFeedback, setLaserFeedback] = useState<'hit' | 'miss' | null>(null)
  const [poopEmojis, setPoopEmojis] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [fleeingPigs, setFleeingPigs] = useState<FleeingPig[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameTimeMinutes, setGameTimeMinutes] = useState(1)
  const [gameMode, setGameMode] = useState<GameMode>('maths')
  const nextIdRef = useRef(1)
  const lastTimeRef = useRef<number>(0)
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number>(0)
  const gameConfigRef = useRef({ durationSec: 60, speed: 4, spawnMs: 5500, mode: 'maths' as GameMode, difficulty: 'easy' as Difficulty })

  const startGame = useCallback(() => {
    const durationSec = gameTimeMinutes * 60
    const config = DIFFICULTY_CONFIG[difficulty]
    gameConfigRef.current = { durationSec, speed: config.speed, spawnMs: config.spawnMs, mode: gameMode, difficulty }
    setGameStatus('playing')
    setZombies([])
    setLives(3)
    setTimeLeft(durationSec)
    setAnswerInput('')
    setLaserFeedback(null)
    setPoopEmojis([])
    setFleeingPigs([])
    nextIdRef.current = 1
  }, [difficulty, gameTimeMinutes, gameMode])

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
    const { spawnMs } = gameConfigRef.current
    const { mode, difficulty: diff } = gameConfigRef.current
    spawnTimerRef.current = setInterval(() => {
      setZombies((z) => [...z, spawnZombie(nextIdRef.current++, mode, diff)])
    }, spawnMs)
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

      const { speed } = gameConfigRef.current
      setZombies((prev) => {
        const updated = prev
          .map((z) => ({ ...z, x: z.x - speed * dt }))
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
    const { mode } = gameConfigRef.current
    let index: number
    if (mode === 'maths') {
      const num = parseInt(answerInput.trim(), 10)
      if (Number.isNaN(num)) {
        setLaserFeedback('miss')
        setTimeout(() => setLaserFeedback(null), 600)
        setAnswerInput('')
        return
      }
      index = zombies.findIndex((z) => z.matchValue === num)
    } else {
      const typed = answerInput.trim().toLowerCase()
      index = zombies.findIndex((z) => typeof z.matchValue === 'string' && z.matchValue.toLowerCase() === typed)
    }
    if (index >= 0) {
      const hitZombie = zombies[index]
      const pigEntry = { id: hitZombie.id, x: hitZombie.x, y: hitZombie.y, createdAt: Date.now() }
      setFleeingPigs((p) => [...p, pigEntry])
      setTimeout(() => {
        setFleeingPigs((p) => p.filter((pig) => pig.id !== hitZombie.id))
      }, FLEE_DURATION_MS + 100)
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

  const difficultyLabel = (d: Difficulty) =>
    gameMode === 'touchtype' ? `${d} (${d === 'easy' ? 'Year 7' : d === 'medium' ? 'Year 9' : 'Year 12'})` : d

  if (gameStatus === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
          🧟 Zombie Survival
        </h1>
        <p className="text-slate-300 text-lg mb-6 text-center max-w-md">
          {gameMode === 'maths'
            ? "Zombies are coming! The magician turns them into piggies when you get the maths right. Match any zombie's answer to hit. Don't let them reach the magician — 3 lives."
            : "Zombies carry words. Type the word to zap them into piggies! Match any zombie's word to hit. Train your touch typing — 3 lives."}
        </p>

        <div className="w-full max-w-sm space-y-6 mb-8">
          <fieldset className="rounded-xl bg-black/20 p-4 border border-slate-600/50">
            <legend className="text-slate-300 font-semibold px-2">Mode</legend>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="mode"
                  value="maths"
                  checked={gameMode === 'maths'}
                  onChange={() => setGameMode('maths')}
                  className="accent-green-500"
                />
                <span>Maths</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="mode"
                  value="touchtype"
                  checked={gameMode === 'touchtype'}
                  onChange={() => setGameMode('touchtype')}
                  className="accent-green-500"
                />
                <span>Touch type</span>
              </label>
            </div>
          </fieldset>
          <fieldset className="rounded-xl bg-black/20 p-4 border border-slate-600/50">
            <legend className="text-slate-300 font-semibold px-2">Difficulty</legend>
            <div className="flex gap-4 mt-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="difficulty"
                    value={d}
                    checked={difficulty === d}
                    onChange={() => setDifficulty(d)}
                    className="accent-green-500"
                  />
                  <span className="capitalize">{difficultyLabel(d)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="rounded-xl bg-black/20 p-4 border border-slate-600/50">
            <legend className="text-slate-300 font-semibold px-2">Time</legend>
            <div className="flex gap-4 mt-2">
              {TIME_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="radio"
                    name="time"
                    value={opt.value}
                    checked={gameTimeMinutes === opt.value}
                    onChange={() => setGameTimeMinutes(opt.value)}
                    className="accent-green-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

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
        <p className="text-slate-300 mt-2">The magician prevailed. So many piggies ran away!</p>
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
          <span className="text-2xl font-bold text-yellow-400">⏱ {formatTime(timeLeft)}</span>
          <span className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`text-2xl ${i <= lives ? 'opacity-100' : 'opacity-30'}`}>
                ❤️
              </span>
            ))}
          </span>
        </div>
        <span className="text-slate-400 text-lg">
          {gameConfigRef.current.mode === 'touchtype' ? 'Type the word & shoot' : 'Type an answer & shoot'}
        </span>
      </div>

      {/* Game area */}
      <div className="flex-1 relative min-h-0" style={{ minHeight: '320px' }}>
        {/* Magician (left) */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          style={{ left: 24 }}
        >
          <span className="text-7xl md:text-8xl" title="Magician">🧙‍♂️</span>
          <span className="text-sm text-slate-400 mt-1">Magician</span>
        </div>

        {/* Fleeing piggies (hit zombies run away) */}
        {fleeingPigs.map((pig) => (
          <div
            key={pig.id}
            className="absolute z-20 flex flex-col items-center pointer-events-none animate-flee-right"
            style={{
              left: `${pig.x}%`,
              top: `${pig.y}%`,
              transform: 'translate(-50%, -50%)',
              ['--flee-start' as string]: `${pig.x}%`,
            }}
          >
            <span className="text-5xl md:text-6xl">🐷</span>
            <span className="text-sm text-pink-300 font-bold">oink oink!</span>
          </div>
        ))}

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
            <span className="text-5xl md:text-6xl" title="Zombie">🧟</span>
            <span className="text-lg md:text-xl font-mono font-bold text-white bg-black/60 px-3 py-1 rounded mt-1 whitespace-nowrap">
              {z.question}
            </span>
          </div>
        ))}
      </div>

      {/* Answer input (bottom) */}
      <div className="p-4 bg-black/30 shrink-0">
        <form onSubmit={handleShoot} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto items-center">
          <label className="text-slate-300 text-base sm:text-lg">
            {gameConfigRef.current.mode === 'touchtype' ? 'Word:' : 'Answer:'}
          </label>
          <input
            type={gameConfigRef.current.mode === 'touchtype' ? 'text' : 'number'}
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            className="flex-1 w-full sm:max-w-[220px] px-4 py-4 rounded-lg bg-slate-800 border border-slate-600 text-white text-2xl font-mono focus:border-green-500 focus:outline-none"
            placeholder={gameConfigRef.current.mode === 'touchtype' ? 'type the word...' : '?'}
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
        <p className="text-slate-500 text-center text-base mt-2">
          {gameConfigRef.current.mode === 'touchtype'
            ? 'Type the word that matches any zombie to hit them'
            : 'Hit any zombie whose question has that answer'}
        </p>
      </div>

      <Link href="/" className="absolute top-2 right-2 text-slate-500 hover:text-white text-base">
        Exit
      </Link>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

// Victoria Year 7 Chinese (second language) – common characters, not heritage/novice
const CHINESE_VOCAB: { char: string; meaning: string }[] = [
  { char: '一', meaning: 'one' },
  { char: '二', meaning: 'two' },
  { char: '三', meaning: 'three' },
  { char: '四', meaning: 'four' },
  { char: '五', meaning: 'five' },
  { char: '六', meaning: 'six' },
  { char: '七', meaning: 'seven' },
  { char: '八', meaning: 'eight' },
  { char: '九', meaning: 'nine' },
  { char: '十', meaning: 'ten' },
  { char: '大', meaning: 'big' },
  { char: '小', meaning: 'small' },
  { char: '多', meaning: 'many' },
  { char: '少', meaning: 'few' },
  { char: '好', meaning: 'good' },
  { char: '你', meaning: 'you' },
  { char: '我', meaning: 'I / me' },
  { char: '他', meaning: 'he' },
  { char: '她', meaning: 'she' },
  { char: '是', meaning: 'is / am / are' },
  { char: '不', meaning: 'not' },
  { char: '有', meaning: 'have' },
  { char: '在', meaning: 'at / in' },
  { char: '吃', meaning: 'eat' },
  { char: '喝', meaning: 'drink' },
  { char: '水', meaning: 'water' },
  { char: '茶', meaning: 'tea' },
  { char: '书', meaning: 'book' },
  { char: '笔', meaning: 'pen' },
  { char: '学', meaning: 'study' },
  { char: '生', meaning: 'student / life' },
  { char: '老', meaning: 'old' },
  { char: '师', meaning: 'teacher' },
  { char: '朋', meaning: 'friend (in 朋友)' },
  { char: '友', meaning: 'friend (in 朋友)' },
  { char: '家', meaning: 'home / family' },
  { char: '爸', meaning: 'dad' },
  { char: '妈', meaning: 'mum' },
  { char: '哥', meaning: 'older brother' },
  { char: '姐', meaning: 'older sister' },
  { char: '弟', meaning: 'younger brother' },
  { char: '妹', meaning: 'younger sister' },
  { char: '谢', meaning: 'thank (in 谢谢)' },
  { char: '再', meaning: 'again' },
  { char: '见', meaning: 'see' },
  { char: '请', meaning: 'please' },
  { char: '红', meaning: 'red' },
  { char: '白', meaning: 'white' },
  { char: '黑', meaning: 'black' },
  { char: '蓝', meaning: 'blue' },
  { char: '绿', meaning: 'green' },
  { char: '黄', meaning: 'yellow' },
  { char: '今', meaning: 'today (in 今天)' },
  { char: '天', meaning: 'day / sky' },
  { char: '明', meaning: 'bright / tomorrow' },
  { char: '年', meaning: 'year' },
  { char: '点', meaning: 'o\'clock' },
  { char: '分', meaning: 'minute' },
  { char: '看', meaning: 'look / watch' },
  { char: '听', meaning: 'listen' },
  { char: '说', meaning: 'speak' },
  { char: '读', meaning: 'read' },
  { char: '写', meaning: 'write' },
  { char: '喜', meaning: 'like (in 喜欢)' },
  { char: '欢', meaning: 'like (in 喜欢)' },
  { char: '很', meaning: 'very' },
  { char: '也', meaning: 'also' },
  { char: '都', meaning: 'all' },
  { char: '会', meaning: 'can / know how' },
  { char: '能', meaning: 'can' },
  { char: '要', meaning: 'want / need' },
]

const QUESTION_TIME_SEC = 10
const TOTAL_GAME_SEC = 60
const PIGGY_RAIN_COUNT = 12

type GamePhase = 'idle' | 'playing' | 'congrats'

type PiggyDrop = { id: number; x: number; delay: number; duration: number }

type AnswerRecord = {
  char: string
  correctMeaning: string
  userAnswer: string | null  // null = timed out or game ended
  correct: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickQuestion() {
  const idx = Math.floor(Math.random() * CHINESE_VOCAB.length)
  const correct = CHINESE_VOCAB[idx]
  const wrongPool = CHINESE_VOCAB.filter((_, i) => i !== idx).map((x) => x.meaning)
  const wrong = shuffle(wrongPool).slice(0, 3)
  const options = shuffle([correct.meaning, ...wrong])
  return { char: correct.char, correctMeaning: correct.meaning, options }
}

export default function ChineseGamePage() {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [score, setScore] = useState(0)
  const [gameTimeLeft, setGameTimeLeft] = useState(TOTAL_GAME_SEC)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_SEC)
  const [question, setQuestion] = useState<ReturnType<typeof pickQuestion> | null>(null)
  const [piggyDrops, setPiggyDrops] = useState<PiggyDrop[]>([])
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([])
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gameEndTriggeredRef = useRef(false)
  const currentQuestionRef = useRef<{ char: string; correctMeaning: string } | null>(null)

  const nextQuestion = useCallback(() => {
    const q = pickQuestion()
    currentQuestionRef.current = { char: q.char, correctMeaning: q.correctMeaning }
    setQuestion(q)
    setQuestionTimeLeft(QUESTION_TIME_SEC)
  }, [])

  const startGame = useCallback(() => {
    gameEndTriggeredRef.current = false
    setPhase('playing')
    setScore(0)
    setGameTimeLeft(TOTAL_GAME_SEC)
    setQuestionTimeLeft(QUESTION_TIME_SEC)
    setAnswerHistory([])
    const q = pickQuestion()
    currentQuestionRef.current = { char: q.char, correctMeaning: q.correctMeaning }
    setQuestion(q)
    setPiggyDrops([])
  }, [])

  // Game clock (1 minute total)
  useEffect(() => {
    if (phase !== 'playing') return
    gameTimerRef.current = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current)
          if (questionTimerRef.current) clearInterval(questionTimerRef.current)
          if (!gameEndTriggeredRef.current) {
            gameEndTriggeredRef.current = true
            const cur = currentQuestionRef.current
            if (cur) {
              setAnswerHistory((h) => [...h, { char: cur.char, correctMeaning: cur.correctMeaning, userAnswer: null, correct: false }])
            }
            setPhase('congrats')
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#fbbf24', '#f59e0b', '#f97316', '#fb923c', '#fcd34d'],
            })
            setTimeout(() => {
              confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } })
              confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } })
            }, 250)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
  }, [phase])

  // Per-question 10 second countdown
  useEffect(() => {
    if (phase !== 'playing' || !question) return
    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          if (questionTimerRef.current) clearInterval(questionTimerRef.current)
          const cur = currentQuestionRef.current
          if (cur) {
            setAnswerHistory((h) => [...h, { char: cur.char, correctMeaning: cur.correctMeaning, userAnswer: null, correct: false }])
          }
          nextQuestion()
          return QUESTION_TIME_SEC
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [phase, question?.char, nextQuestion])

  const handleAnswer = (selected: string) => {
    if (phase !== 'playing' || !question) return
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current)
      questionTimerRef.current = null
    }
    const correct = selected === question.correctMeaning
    setAnswerHistory((h) => [...h, { char: question.char, correctMeaning: question.correctMeaning, userAnswer: selected, correct }])
    if (correct) {
      const points = questionTimeLeft
      setScore((s) => s + points)
      setPiggyDrops(() => {
        const drops: PiggyDrop[] = []
        for (let i = 0; i < PIGGY_RAIN_COUNT; i++) {
          drops.push({
            id: Date.now() + i,
            x: Math.random() * 100,
            delay: Math.random() * 0.3,
            duration: 1.2 + Math.random() * 0.6,
          })
        }
        return drops
      })
      setTimeout(() => setPiggyDrops([]), 2200)
    }
    nextQuestion()
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (phase === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-900/40 via-amber-900/30 to-slate-900 p-4">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-200 mb-2 drop-shadow-lg">
          🐷 Piggy Chinese
        </h1>
        <p className="text-slate-300 text-lg mb-2 text-center max-w-md">
          Match the character to its meaning. Get it right and piggies rain down — you earn points from the seconds left on the clock.
        </p>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
          Victoria Year 7 level · 1 minute · 10 seconds per question · 4 choices
        </p>
        <button
          onClick={startGame}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-xl font-bold py-4 px-8 rounded-full shadow-lg transition"
        >
          Start game
        </button>
        <Link href="/" className="mt-6 text-slate-400 hover:text-white">
          ← Back home
        </Link>
      </div>
    )
  }

  if (phase === 'congrats') {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-rose-900/40 via-amber-900/30 to-slate-900 p-4 py-8">
        <div className="text-7xl mb-2">🎉</div>
        <h1 className="text-4xl font-bold text-amber-200">Time&apos;s up!</h1>
        <p className="text-slate-300 mt-2">You earned</p>
        <p className="text-5xl font-black text-amber-400 mt-2 flex items-center gap-2">
          <span>{score}</span>
          <span>🐷</span>
        </p>
        <p className="text-slate-400 text-sm mt-1">piggy points</p>

        {answerHistory.length > 0 && (
          <div className="w-full max-w-lg mt-8">
            <h2 className="text-xl font-bold text-amber-200/90 mb-3">Question overview</h2>
            <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              {answerHistory.map((record, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-left ${
                    record.correct ? 'bg-emerald-900/40' : 'bg-slate-800/60'
                  }`}
                >
                  <span className="text-2xl shrink-0 font-serif">{record.char}</span>
                  {record.correct ? (
                    <span className="flex items-center gap-2 text-emerald-300">
                      <span>✅</span>
                      <span>{record.correctMeaning}</span>
                    </span>
                  ) : (
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-300">
                      <span className="text-red-300/90">
                        {record.userAnswer ?? '(time ran out)'}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-amber-200/90">{record.correctMeaning}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-4 mt-8 shrink-0">
          <button
            onClick={startGame}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-6 rounded-full"
          >
            Play again
          </button>
          <Link
            href="/"
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-full"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900/40 via-amber-900/30 to-slate-900 flex flex-col overflow-hidden relative">
      {/* Piggy rain */}
      {piggyDrops.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {piggyDrops.map((p) => (
            <span
              key={p.id}
              className="absolute text-4xl animate-piggy-rain"
              style={{
                left: `${p.x}%`,
                top: '-10%',
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            >
              🐷
            </span>
          ))}
        </div>
      )}

      {/* HUD */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/30 text-white shrink-0">
        <span className="text-lg font-bold text-amber-400">
          ⏱ {formatTime(gameTimeLeft)}
        </span>
        <span className="text-2xl font-bold flex items-center gap-1">
          <span>{score}</span>
          <span>🐷</span>
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 text-sm mb-2">What does this character mean?</p>
        <div className="text-8xl md:text-9xl font-serif text-white mb-8 drop-shadow-lg border-4 border-amber-500/50 rounded-2xl bg-black/20 px-10 py-6">
          {question?.char}
        </div>
        <div className="w-full max-w-md">
          <p className="text-amber-300 font-bold text-center mb-3 text-lg">
            {questionTimeLeft}s left
          </p>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(questionTimeLeft / QUESTION_TIME_SEC) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question?.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                className="py-4 px-4 rounded-xl bg-slate-700/80 hover:bg-amber-600/80 border-2 border-slate-600 hover:border-amber-500 text-white font-medium text-lg transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="absolute top-3 right-3 text-slate-500 hover:text-white text-sm"
      >
        Exit
      </Link>
    </div>
  )
}

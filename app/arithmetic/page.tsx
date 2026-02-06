'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

type Question = {
  id: number
  question: string
  answer: number
  type: 'multiplication' | 'division'
}

const DAD_JOKES = [
  "Why don't scientists trust atoms? Because they make up everything! 🐷",
  "Why did the math book look so sad? Because it had too many problems! 🐷",
  "What do you call a pig that does karate? A pork chop! 🐷",
  "Why did the pig go to the doctor? Because it had a boar-ing day! 🐷",
  "What's a pig's favorite game? Oink-ment! 🐷",
  "Why don't pigs like to share? Because they're a little boar-ish! 🐷",
  "What do you call a sleeping pig? A pig-nap! 🐷",
  "Why did the pig sit in the shade? Because it didn't want to be bacon! 🐷",
]

const ENCOURAGEMENTS = [
  "Great job, Zoe! 🌟",
  "You're doing amazing! ⭐",
  "Wow, you're so smart! 🎉",
  "Fantastic work! 🎈",
  "You're a math superstar! ⭐",
  "Keep it up, you're brilliant! 🌈",
  "Amazing! You're getting them all right! 🎊",
  "You're on fire! 🔥",
]

const WRONG_EMOJIS = ['😅', '💦', '💩', '🤡', '😬', '🤢', '😵', '🤮', '😱', '😰', '🤯', '🥴']

export default function ArithmeticPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [selectedJoke, setSelectedJoke] = useState('')
  const [wrongEmojis, setWrongEmojis] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([])

  useEffect(() => {
    generateQuestions()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed((time) => time + 1)
      }, 1000)
    } else if (!isActive && timeElapsed !== 0) {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeElapsed])

  const generateQuestions = () => {
    const newQuestions: Question[] = []
    const usedCombinations = new Set<string>()

    for (let i = 0; i < 10; i++) {
      let question: Question
      let key: string

      // Randomly choose between multiplication and division
      const isDivision = Math.random() > 0.5

      if (isDivision) {
        // Division questions: result ÷ 4 or result ÷ 6
        const divisor = Math.random() > 0.5 ? 4 : 6
        const multiplier = Math.floor(Math.random() * 12) + 1 // 1-12
        const result = divisor * multiplier
        key = `div-${result}-${divisor}`
        
        if (!usedCombinations.has(key)) {
          usedCombinations.add(key)
          question = {
            id: i + 1,
            question: `${result} ÷ ${divisor} = ?`,
            answer: multiplier,
            type: 'division',
          }
        } else {
          i-- // Retry this question
          continue
        }
      } else {
        // Multiplication questions: 4 × ? or 6 × ?
        const base = Math.random() > 0.5 ? 4 : 6
        const multiplier = Math.floor(Math.random() * 12) + 1 // 1-12
        key = `mult-${base}-${multiplier}`
        
        if (!usedCombinations.has(key)) {
          usedCombinations.add(key)
          question = {
            id: i + 1,
            question: `${base} × ${multiplier} = ?`,
            answer: base * multiplier,
            type: 'multiplication',
          }
        } else {
          i-- // Retry this question
          continue
        }
      }

      newQuestions.push(question)
    }

    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeElapsed(0)
    setIsActive(true)
    setQuizComplete(false)
    setUserAnswer('')
    setShowResult(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const answer = parseInt(userAnswer)
    const currentQuestion = questions[currentQuestionIndex]
    const correct = answer === currentQuestion.answer

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
      // Confetti effect!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#FF69B4', '#9370DB'],
      })
      // Additional burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#FF69B4', '#9370DB'],
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#FF69B4', '#9370DB'],
        })
      }, 250)
    } else {
      // Wrong answer - spawn weird emojis
      const newEmojis: Array<{ id: number; emoji: string; x: number; y: number }> = []
      
      // Spawn 5-8 random emojis around the center of the viewport
      const emojiCount = Math.floor(Math.random() * 4) + 5
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400
      
      for (let i = 0; i < emojiCount; i++) {
        const emoji = WRONG_EMOJIS[Math.floor(Math.random() * WRONG_EMOJIS.length)]
        const angle = (Math.PI * 2 * i) / emojiCount + Math.random() * 0.5
        const distance = 100 + Math.random() * 100
        newEmojis.push({
          id: Date.now() + i,
          emoji,
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        })
      }
      setWrongEmojis(newEmojis)
      
      // Clear emojis after animation
      setTimeout(() => {
        setWrongEmojis([])
      }, 2000)
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setUserAnswer('')
        setShowResult(false)
        setWrongEmojis([])
      } else {
        setIsActive(false)
        setQuizComplete(true)
        setSelectedJoke(DAD_JOKES[Math.floor(Math.random() * DAD_JOKES.length)])
      }
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-4">
            Amazing Work, Zoe! 🐷
          </h1>
          <div className="text-3xl mb-6">
            <span className="text-purple-600 font-bold">Score: {score}/10</span>
          </div>
          <div className="text-2xl mb-6 text-gray-700">
            Time: {formatTime(timeElapsed)}
          </div>
          <div className="bg-yellow-100 rounded-2xl p-6 mb-6 border-2 border-yellow-300">
            <p className="text-xl md:text-2xl text-gray-800 font-semibold">
              {selectedJoke}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={generateQuestions}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl font-bold py-4 px-8 rounded-full hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-lg"
            >
              Play Again! 🎮
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 text-xl font-bold py-4 px-8 rounded-full hover:bg-gray-300 transform hover:scale-105 transition-all shadow-lg"
            >
              Story Mode 📖
            </Link>
            <Link
              href="/zombie"
              className="bg-amber-200 text-amber-800 text-xl font-bold py-4 px-8 rounded-full hover:bg-amber-300 transform hover:scale-105 transition-all shadow-lg"
            >
              Zombie Survival 🧟
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🐷</div>
          <p className="text-2xl text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-4 relative overflow-hidden">
      {/* Emoji container for wrong answers */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {wrongEmojis.map((emojiData) => (
          <div
            key={emojiData.id}
            className="absolute text-6xl animate-emoji-burst"
            style={{
              left: `${emojiData.x}px`,
              top: `${emojiData.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {emojiData.emoji}
          </div>
        ))}
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with Timer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-pink-600">
              Arithmetic Quiz 🐷
            </h1>
            <p className="text-gray-600 mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              ⏱️ {formatTime(timeElapsed)}
            </div>
            <div className="text-lg text-gray-600 mt-1">
              Score: {score}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-full h-4 mb-6 overflow-hidden shadow-md">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-6">
          <div className="text-center">
            <div className="text-8xl mb-6">🐷</div>
            <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8">
              {currentQuestion.question}
            </h2>

            {showResult ? (
              <div className={`text-4xl font-bold mb-6 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? (
                  <div>
                    <div className="mb-2">🎉 {ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]}</div>
                    <div className="text-2xl">Correct! The answer is {currentQuestion.answer}</div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2">😊</div>
                    <div className="text-2xl">Not quite! The answer is {currentQuestion.answer}</div>
                    <div className="text-xl text-gray-600 mt-2">Keep trying, you&apos;re doing great!</div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8">
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="text-4xl text-center w-32 h-20 border-4 border-pink-300 rounded-2xl focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-200"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl font-bold py-4 px-8 rounded-full hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-lg mt-4"
                  >
                    Submit Answer ✨
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={generateQuestions}
            className="bg-gray-200 text-gray-700 text-lg font-semibold py-3 px-6 rounded-full hover:bg-gray-300 transition-all"
          >
            🔄 Start New Quiz
          </button>
          <Link
            href="/"
            className="bg-blue-200 text-blue-700 text-lg font-semibold py-3 px-6 rounded-full hover:bg-blue-300 transition-all"
          >
            📖 Story Mode
          </Link>
          <Link
            href="/zombie"
            className="bg-amber-200 text-amber-800 text-lg font-semibold py-3 px-6 rounded-full hover:bg-amber-300 transition-all"
          >
            🧟 Zombie Survival
          </Link>
        </div>
      </div>
    </div>
  )
}

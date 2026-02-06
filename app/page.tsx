'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

type Question = {
  id: number
  question: string
  answer: number
  type: 'multiplication' | 'division'
  character: string
  emoji: string
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

const ANIME_CHARACTERS = [
  { name: 'Sakura the Magical Girl', emoji: '🌸', type: 'magical' },
  { name: 'Kai the Shonen Hero', emoji: '⚔️', type: 'fighter' },
  { name: 'Yuki the Tsundere', emoji: '❄️', type: 'tsundere' },
  { name: 'Ren the Ninja', emoji: '🥷', type: 'ninja' },
  { name: 'Mira the Mecha Pilot', emoji: '🤖', type: 'mecha' },
  { name: 'Luna the Cat Girl', emoji: '🐱', type: 'neko' },
]

// Parody scenarios that subvert anime tropes
const getParodyDivisionQuestion = (character: typeof ANIME_CHARACTERS[0], result: number, divisor: number) => {
  const scenarios = [
    `${character.name} collected ${result} "power of friendship" speeches, but only ${divisor} friends showed up to hear them. How many speeches does each friend have to listen to? (They're all the same speech anyway)`,
    `${character.name} has ${result} dramatic transformation sequences, but the budget only allows ${divisor} episodes. How many transformations per episode? (The animators are crying)`,
    `${character.name} found ${result} plot armor pieces, but needs to share them equally among ${divisor} main characters. How many pieces does each character get? (The villains are jealous)`,
    `${character.name} has ${result} "it's not what it looks like!" misunderstandings and must divide them equally among ${divisor} episodes. How many misunderstandings per episode?`,
    `${character.name} collected ${result} beach episode swimsuits, but only ${divisor} characters are allowed to wear them. How many swimsuits per character? (The rest are for "plot reasons")`,
    `${character.name} has ${result} flashback sequences and needs to spread them across ${divisor} episodes. How many flashbacks per episode? (We get it, you had a sad childhood)`,
  ]
  return scenarios[Math.floor(Math.random() * scenarios.length)]
}

const getParodyMultiplicationQuestion = (character: typeof ANIME_CHARACTERS[0], base: number, multiplier: number) => {
  if (character.type === 'magical') {
    const scenarios = [
      `${character.name} has ${base} transformation scenes. Each scene includes ${multiplier} "I must protect everyone!" speeches. How many speeches does ${character.name} have in total?`,
      `${character.name} performs ${base} magical girl poses. Each pose takes ${multiplier} minutes of sparkles. How many minutes of sparkles are there in total?`,
      `${character.name} has ${base} friendship power-ups. Each power-up requires ${multiplier} transformation sequences. How many transformation sequences are there in total? (Because that's totally how magic works)`,
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  } else if (character.type === 'fighter') {
    const scenarios = [
      `${character.name} has ${base} training arcs. Each arc features ${multiplier} power-up screams ("HAAAAAA!"). How many screams are there in total?`,
      `${character.name} performs ${multiplier} "I'll never give up!" declarations per training session. If there are ${base} training sessions, how many declarations are there in total?`,
      `${character.name} has ${base} rival battles. Each battle includes ${multiplier} training montages. How many montages are there in total? (Because every shonen needs more montages)`,
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  } else if (character.type === 'tsundere') {
    const scenarios = [
      `${character.name} appears in ${base} episodes. Each episode has ${multiplier} "It's not like I like you or anything!" lines. How many denial lines are there in total?`,
      `${character.name} has ${base} blush moments. Each moment includes ${multiplier} hair twirls while looking away. How many hair twirls are there in total?`,
      `${character.name} says "B-baka!" ${multiplier} times per episode. If ${character.name} appears in ${base} episodes, how many "B-baka!" exclamations are there in total?`,
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  } else if (character.type === 'ninja') {
    const scenarios = [
      `${character.name} has ${base} story arcs. Each arc includes ${multiplier} stealth missions (all failed, of course). How many failed missions are there in total?`,
      `${character.name} uses ${multiplier} "Ninja vanish!" smoke bombs per episode. If there are ${base} episodes, how many smoke bombs are used in total?`,
      `${character.name} has ${base} episodes. Each episode features ${multiplier} "This is my ninja way!" speeches. How many speeches are there in total?`,
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  } else if (character.type === 'mecha') {
    const scenarios = [
      `${character.name}'s mecha appears in ${base} battles. Each battle has ${multiplier} giant robot poses. How many poses are there in total?`,
      `${character.name} gives ${multiplier} "We must protect Earth!" speeches per battle. If there are ${base} battles, how many speeches are there in total?`,
      `${character.name}'s mecha has ${base} pilot synchronization scenes. Each scene includes ${multiplier} "The mecha is powered by friendship!" explanations. How many explanations are there in total?`,
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  } else { // neko
    const scenarios = [
      `${character.name} has ${base} cute scenes. Each scene includes ${multiplier} "Nya!" sounds. How many "Nya!" sounds are there in total?`,
      `${character.name} has ${base} episodes. Each episode features ${multiplier} cat ear twitches. How many twitches are there in total?`,
      `${character.name} says "I'm not a cat, I'm a human!" ${multiplier} times per scene. If there are ${base} scenes, how many denials are there in total? (Sure, Luna, sure)`,
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  }
}

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

export default function Home() {
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
          const character = ANIME_CHARACTERS[Math.floor(Math.random() * ANIME_CHARACTERS.length)]
          
          question = {
            id: i + 1,
            question: getParodyDivisionQuestion(character, result, divisor),
            answer: multiplier,
            type: 'division',
            character: character.name,
            emoji: character.emoji,
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
          const character = ANIME_CHARACTERS[Math.floor(Math.random() * ANIME_CHARACTERS.length)]
          
          question = {
            id: i + 1,
            question: getParodyMultiplicationQuestion(character, base, multiplier),
            answer: base * multiplier,
            type: 'multiplication',
            character: character.name,
            emoji: character.emoji,
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
            Amazing Work, Zoe! 🎌✨
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
              href="/arithmetic"
              className="bg-blue-200 text-blue-700 text-xl font-bold py-4 px-8 rounded-full hover:bg-blue-300 transform hover:scale-105 transition-all shadow-lg"
            >
              Arithmetic Mode 🔢
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
          <div className="text-6xl mb-4">🌸</div>
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
              Zoe&apos;s Anime Math Quiz 🎌
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
            <div className="text-8xl mb-6">{currentQuestion.emoji}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
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
            href="/arithmetic"
            className="bg-blue-200 text-blue-700 text-lg font-semibold py-3 px-6 rounded-full hover:bg-blue-300 transition-all"
          >
            🔢 Arithmetic Mode
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

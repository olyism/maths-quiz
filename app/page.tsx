'use client'

import Link from 'next/link'

const TILES = [
  {
    href: '/story',
    emoji: '🌸',
    title: 'Story Mode',
    description: 'Anime parody maths — multiply & divide with magical girls, ninjas & mechas!',
    gradient: 'from-pink-400 via-rose-400 to-fuchsia-500',
    shadow: 'shadow-pink-300/50',
    hoverShadow: 'hover:shadow-pink-400/60',
    bg: 'bg-gradient-to-br from-pink-400 via-rose-300 to-fuchsia-400',
    border: 'border-pink-400/40',
  },
  {
    href: '/arithmetic',
    emoji: '🔢',
    title: 'Arithmetic Quiz',
    description: 'Straight-up 4× and 6× times tables. Clean, quick, no story — just numbers.',
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
    shadow: 'shadow-blue-300/50',
    hoverShadow: 'hover:shadow-blue-400/60',
    bg: 'bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500',
    border: 'border-blue-400/40',
  },
  {
    href: '/zombie',
    emoji: '🧟',
    title: 'Zombie Survival',
    description: 'Magician vs zombies! Type answers to turn them into piggies. Survive the clock.',
    gradient: 'from-amber-400 via-orange-500 to-lime-500',
    shadow: 'shadow-amber-300/50',
    hoverShadow: 'hover:shadow-amber-400/60',
    bg: 'bg-gradient-to-br from-amber-400 via-orange-400 to-lime-500',
    border: 'border-amber-400/40',
  },
  {
    href: '/chinese',
    emoji: '🐷',
    title: 'Piggy Chinese',
    description: 'Match Chinese characters to meanings. Earn piggy points — 1 min, 10s per question.',
    gradient: 'from-rose-400 via-amber-500 to-orange-500',
    shadow: 'shadow-amber-300/50',
    hoverShadow: 'hover:shadow-amber-400/60',
    bg: 'bg-gradient-to-br from-rose-400 via-amber-400 to-orange-500',
    border: 'border-amber-400/40',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg tracking-tight">
          Maths Quiz
        </h1>
        <p className="text-lg md:text-xl text-white/90 mt-2 font-medium">
          Pick a game and have fun!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group relative block rounded-3xl ${tile.bg} border-4 ${tile.border} shadow-2xl ${tile.shadow} ${tile.hoverShadow} hover:scale-[1.03] hover:-translate-y-1 transition-all duration-200 overflow-hidden`}
          >
            <div className="p-8 md:p-10 flex flex-col items-center text-center min-h-[240px] md:min-h-[280px] justify-between">
              <span className="text-7xl md:text-8xl drop-shadow-md group-hover:scale-110 transition-transform duration-200">
                {tile.emoji}
              </span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  {tile.title}
                </h2>
                <p className="text-white/95 text-sm md:text-base mt-3 font-medium leading-snug">
                  {tile.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

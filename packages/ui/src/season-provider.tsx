'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { detectSeason, SEASON_CONFIG } from '@mutluet/lib'
import type { Season } from '@mutluet/db'

interface SeasonContextValue {
  season: Season
  config: typeof SEASON_CONFIG[Season]
  setSeason: (s: Season) => void
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

export function SeasonProvider({
  children,
  initialSeason,
}: {
  children: React.ReactNode
  initialSeason?: Season
}) {
  const [season, setSeason] = useState<Season>(initialSeason ?? detectSeason())

  useEffect(() => {
    const root = document.documentElement
    const cfg = SEASON_CONFIG[season]
    root.setAttribute('data-season', season)
    root.style.setProperty('--season-primary', cfg.primary)
    root.style.setProperty('--season-accent', cfg.accent)
    root.style.setProperty('--season-bg', cfg.bg)
    root.style.setProperty('--season-text', cfg.text)
    root.style.setProperty('--season-gradient', cfg.gradient)
  }, [season])

  return (
    <SeasonContext.Provider value={{ season, config: SEASON_CONFIG[season], setSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const ctx = useContext(SeasonContext)
  if (!ctx) throw new Error('useSeason must be used within SeasonProvider')
  return ctx
}

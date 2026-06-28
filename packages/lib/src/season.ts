import type { Season } from '@mutluet/db'

export function detectSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1 // 1-12
  if (month >= 3 && month <= 5) return 'ilkbahar'
  if (month >= 6 && month <= 8) return 'yaz'
  if (month >= 9 && month <= 11) return 'sonbahar'
  return 'kis'
}

export const SEASON_CONFIG = {
  ilkbahar: {
    label: 'İlkbahar',
    emoji: '🌸',
    primary: '#2E7D5C',
    accent: '#5BA87A',
    bg: '#F0F9F4',
    text: '#1A4A30',
    gradient: 'linear-gradient(135deg, #2E7D5C 0%, #5BA87A 100%)',
    animation: 'leaves-rise',
    eventSuggestions: ['doga', 'cevre', 'spor'] as const,
  },
  yaz: {
    label: 'Yaz',
    emoji: '☀️',
    primary: '#D4820A',
    accent: '#F5B831',
    bg: '#FFFBF0',
    text: '#5C3A00',
    gradient: 'linear-gradient(135deg, #D4820A 0%, #F5B831 100%)',
    animation: 'sunshine',
    eventSuggestions: ['kamp', 'spor', 'tanisma'] as const,
  },
  sonbahar: {
    label: 'Sonbahar',
    emoji: '🍂',
    primary: '#8B3A1A',
    accent: '#D4622A',
    bg: '#FDF5F0',
    text: '#4A1A08',
    gradient: 'linear-gradient(135deg, #8B3A1A 0%, #D4622A 100%)',
    animation: 'leaves-fall',
    eventSuggestions: ['egitim', 'sanat', 'kultur'] as const,
  },
  kis: {
    label: 'Kış',
    emoji: '❄️',
    primary: '#1A3A5C',
    accent: '#2E6A9A',
    bg: '#F0F4FA',
    text: '#0A1A2C',
    gradient: 'linear-gradient(135deg, #1A3A5C 0%, #2E6A9A 100%)',
    animation: 'snow',
    eventSuggestions: ['hasta_ziyareti', 'yemek', 'oyun'] as const,
  },
} satisfies Record<Season, {
  label: string
  emoji: string
  primary: string
  accent: string
  bg: string
  text: string
  gradient: string
  animation: string
  eventSuggestions: readonly string[]
}>

export type SeasonConfig = typeof SEASON_CONFIG[Season]

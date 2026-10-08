import { describe, expect, it } from 'vitest'
import { DEFAULT_HOURS, WEEK_DAYS } from '../admin-branch'

describe('WEEK_DAYS', () => {
  it('lists the seven days starting on Monday', () => {
    expect(WEEK_DAYS).toHaveLength(7)
    expect(WEEK_DAYS.map((day) => day.value)).toEqual([1, 2, 3, 4, 5, 6, 0])
    expect(WEEK_DAYS.map((day) => day.label)).toEqual([
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ])
  })

  it('covers every day of the week exactly once', () => {
    const values = WEEK_DAYS.map((day) => day.value).sort((a, b) => a - b)
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('DEFAULT_HOURS', () => {
  it('opens 09:00-23:00 on every day by default', () => {
    expect(DEFAULT_HOURS).toHaveLength(7)
    DEFAULT_HOURS.forEach((entry) => {
      expect(entry.opening).toBe('09:00')
      expect(entry.closing).toBe('23:00')
      expect(entry.closed).toBe(false)
    })
  })

  it('has one entry per day of the week', () => {
    expect(DEFAULT_HOURS.map((entry) => entry.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6, 0])
    const values = DEFAULT_HOURS.map((entry) => entry.dayOfWeek).sort((a, b) => a - b)
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

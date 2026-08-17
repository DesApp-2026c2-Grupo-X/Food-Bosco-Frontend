import { defineConfig } from '@chakra-ui/react'

export const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `"Outfit", system-ui, sans-serif` },
        body: { value: `"Outfit", system-ui, sans-serif` },
      },
      colors: {
        brand: {
          50: { value: '#FFF4EC' },
          100: { value: '#FFE8D7' },
          200: { value: '#FFCEAD' },
          300: { value: '#FFAD77' },
          400: { value: '#FA8340' },
          500: { value: '#EA580C' },
          600: { value: '#C2410C' },
          700: { value: '#9A3412' },
          800: { value: '#7C2D12' },
          900: { value: '#5B210E' },
        },
        accent: {
          300: { value: '#FCD34D' },
          400: { value: '#FBBF24' },
          500: { value: '#F59E0B' },
          600: { value: '#D97706' },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          value: { _light: '#FFFFFF', _dark: '#000000' },
        },
        'bg.panel': {
          value: { _light: '#FFFFFF', _dark: '#0A0A0A' },
        },
        'bg.muted': {
          value: { _light: '#FFF1E5', _dark: '#1A1A1A' },
        },
        'bg.subtle': {
          value: { _light: '#FFF9F4', _dark: '#121212' },
        },
        fg: {
          value: { _light: '#1C1917', _dark: '#F5F5F5' },
        },
        'fg.muted': {
          value: { _light: '#6B7280', _dark: '#A1A1A1' },
        },
        'fg.subtle': {
          value: { _light: '#9CA3AF', _dark: '#737373' },
        },
        'border.subtle': {
          value: { _light: '#FBE4D2', _dark: '#262626' },
        },
        'border.muted': {
          value: { _light: '#F6D6BE', _dark: '#333333' },
        },
        'border.emphasized': {
          value: { _light: '#EBC2A2', _dark: '#404040' },
        },
        success: {
          value: { _light: '#15803D', _dark: '#4ADE80' },
        },
        warning: {
          value: { _light: '#B45309', _dark: '#FBBF24' },
        },
        danger: {
          value: { _light: '#B91C1C', _dark: '#F87171' },
        },
        info: {
          value: { _light: '#1D4ED8', _dark: '#60A5FA' },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'bg',
      color: 'fg',
    },
  },
})

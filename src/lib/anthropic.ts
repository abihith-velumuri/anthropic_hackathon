import Anthropic from '@anthropic-ai/sdk'

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

if (!apiKey) {
  console.warn('VITE_ANTHROPIC_API_KEY is not set — Claude calls will fail.')
}

export const anthropic = new Anthropic({
  apiKey,
  dangerouslyAllowBrowser: true,
})

export const MODEL = 'claude-opus-4-7'

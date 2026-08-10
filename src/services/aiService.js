import { getToolByName, getToolDefinitions } from './aiTools'

const SYSTEM_PROMPT = `You are TradePulse AI, a helpful business assistant for small business owners.
You help users understand their business data by calling the appropriate tools.

When answering questions about business data:
1. Always call the relevant tool to get real data
2. Present the data clearly with formatted numbers
3. Provide brief insights or recommendations when appropriate
4. Be conversational but professional
5. Use Nigerian Naira (₦) for all currency amounts

If a tool doesn't have data, tell the user the data isn't available yet and suggest what they can do.`

export const chatWithAI = async (messages, apiKey) => {
  if (!apiKey) {
    throw new Error('AI API key not configured. Add VITE_AI_API_KEY to your .env file.')
  }

  const tools = getToolDefinitions()

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: 'auto',
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `AI request failed (${response.status})`)
  }

  const data = await response.json()
  const assistantMessage = data.choices[0]?.message
  if (!assistantMessage) throw new Error('No response from AI')

  if (assistantMessage.tool_calls) {
    const toolResults = []
    for (const toolCall of assistantMessage.tool_calls) {
      const tool = getToolByName(toolCall.function.name)
      if (tool) {
        try {
          const args = JSON.parse(toolCall.function.arguments)
          const result = await tool.execute(args)
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          })
        } catch (err) {
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: err.message }),
          })
        }
      }
    }

    const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
          assistantMessage,
          ...toolResults,
        ],
      }),
    })

    if (!followUpResponse.ok) throw new Error('Failed to get AI follow-up response')
    const followUpData = await followUpResponse.json()
    return followUpData.choices[0]?.message?.content || 'I was unable to generate a response.'
  }

  return assistantMessage.content
}

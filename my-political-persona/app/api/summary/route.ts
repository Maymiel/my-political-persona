import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const conversationText = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'משתתף' : 'בוט'}: ${m.content}`
      )
      .join('\n\n')

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      system: `אתה מנתח שיחה מסדנה על מנהיגות פוליטית.
המשימה: לייצר סיכום שהמשתתף יקרא ויגיד "זה אני בדיוק".

כללים:
- כתוב בעברית טבעית ואישית
- כל משפט בסיכום חייב להתבסס על משהו שנאמר בפועל בשיחה
- היה ספציפי: "כשאמרת ש..." או "הבחירה שלך ב..." — לא כללי
- אל תכתוב דברים שיכולים להתאים לכל אחד
- הסיכום צריך להסביר את ההיגיון: למה הגעת למסקנה הזו

החזר JSON בלבד, בלי כל טקסט נוסף:
{
  "headline": "כותרת קצרה (עד 7 מילים) שמגדירה את הפרסונה — חדה ומדויקת, לא כללית",
  "cognitive_style": "2-3 משפטים על סגנון החשיבה. חייב לציין דוגמה ספציפית מהשיחה. תסביר מה ראית ולמה זה מעיד על סגנון כזה.",
  "values_pattern": "2-3 משפטים על הדפוס הערכי. ציין את הקונפליקט הספציפי שהתגלה ואיזה ערך גבר. הסבר את ההיגיון.",
  "open_question": "שאלה אחת חדה שנובעת ישירות ממה שנאמר בשיחה — לא שאלה גנרית על מנהיגות"
}`,
      messages: [
        {
          role: 'user',
          content: `השיחה המלאה:\n\n${conversationText}\n\nצור סיכום מדויק ואישי, מבוסס על מה שנאמר בפועל.`,
        },
      ],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text in response')
    }

    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    }

    const summary = JSON.parse(jsonText)
    return Response.json(summary)
  } catch (error) {
    console.error('Summary API error:', error)
    return Response.json(
      {
        headline: 'מנהיג עם זהות ערכית ברורה',
        cognitive_style: 'לא ניתן לייצר סיכום. נסה שוב.',
        values_pattern: 'לא ניתן לייצר סיכום. נסה שוב.',
        open_question: 'מה גרם לך לעצור ולחשוב הכי הרבה במהלך השיחה?',
      },
      { status: 200 }
    )
  }
}

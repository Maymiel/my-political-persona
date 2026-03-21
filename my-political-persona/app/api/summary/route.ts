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
      max_tokens: 1200,
      system: `אתה מנתח שיחה מסדנה על מנהיגות פוליטית.
המשימה: לייצר סיכום שהמשתתף יקרא ויגיד "זה אני בדיוק" — לא "זה יכול להיות כל אחד".

כללים קשיחים:
- כל משפט בסיכום חייב להתבסס על משהו שנאמר בפועל בשיחה
- ציטוט ישיר או פרפרזה ספציפית — לא רשמים כלליים
- הסבר את ההיגיון: "כשאמרת X, הבנתי שY" — לא רק מסקנה
- אל תכתוב שום דבר שיכול להתאים לכל אחד
- עברית פשוטה, ישירה, לא אקדמית
- שים לב במיוחד לתשובות על שאלות המחיר ולמה שנאמר בהיפותזה החיה — שם הדברים הכי אמיתיים
- אם המשתתף תיקן את ההיפותזה במהלך השיחה — שקף את התיקון, לא את ההיפותזה המקורית

החזר JSON בלבד, בלי כל טקסט נוסף:
{
  "headline": "כותרת קצרה (עד 7 מילים) שמגדירה את הפרסונה — חדה ומדויקת. לא 'מנהיג ערכי'. משהו כמו 'עומד בגבול גם כשזה עולה לו' או 'מחזיק שניים ולא מפצל'.",
  "cognitive_style": "2-3 משפטים. התחל ב-'כשאמרת [ציטוט קצר]...' ואז הסבר מה זה מגלה על סגנון החשיבה. ספציפי לחלוטין.",
  "values_pattern": "2-3 משפטים. תאר את הקונפליקט הספציפי שהתגלה בשיחה ואיזה ערך גבר. ציין את המחיר שהמשתתף ציין בעצמו.",
  "open_question": "שאלה אחת שנובעת ישירות ממה שנאמר — לא שאלה גנרית. משהו שהשיחה הזו הציפה ועדיין לא נפתר."
}`,
      messages: [
        {
          role: 'user',
          content: `השיחה המלאה:\n\n${conversationText}\n\nצור סיכום מדויק ואישי לחלוטין, מבוסס על מה שנאמר בפועל.`,
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

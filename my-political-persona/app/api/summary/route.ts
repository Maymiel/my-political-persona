import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Format the conversation for the summary prompt
    const conversationText = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === 'user' ? 'משתתף' : 'בוט'}: ${m.content}`
      )
      .join('\n\n')

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      system: `אתה מנתח שיחה מסדנה על מנהיגות פוליטית.
המשימה: לייצר סיכום מובנה של השיחה עבור המשתתף.

החזר JSON בלבד, ללא כל טקסט נוסף. המבנה המדויק:
{
  "headline": "כותרת קצרה ומדויקת (עד 8 מילים) שמתארת את הפרסונה הפוליטית של המשתתף",
  "cognitive_style": "פסקה אחת (3-4 משפטים) על סגנון החשיבה — כיצד המשתתף מתמודד עם אי-ודאות, קונפליקט קוגניטיבי, צורך בסגירה",
  "values_pattern": "פסקה אחת (3-4 משפטים) על הדפוס הערכי — אילו ערכים גוברים כשיש קונפליקט, מה מניע את ההחלטות",
  "open_question": "שאלה אחת פתוחה ומדויקת לקחת הביתה, מבוססת על מה שעלה בשיחה"
}

כתוב בעברית. היה ספציפי, לא כללי. אל תתיוג — תאר דפוסים.`,
      messages: [
        {
          role: 'user',
          content: `הנה השיחה המלאה:\n\n${conversationText}\n\nצור את הסיכום המובנה.`,
        },
      ],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text in response')
    }

    // Parse the JSON from Claude's response
    // Claude sometimes wraps JSON in markdown code blocks
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
        cognitive_style: 'לא ניתן לייצר סיכום אוטומטי. השיחה שלך הייתה עשירה ומעניינת.',
        values_pattern: 'נסה שוב בעוד רגע.',
        open_question: 'מה גרם לך לעצור ולחשוב הכי הרבה במהלך השיחה הזו?',
      },
      { status: 200 }
    )
  }
}

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log(`[MOCK TWILIO WEBHOOK] Message dispatched to ${body.recipient}:`, body.body)
    
    return NextResponse.json({ success: true, message: 'Message sent via Twilio mock' })
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

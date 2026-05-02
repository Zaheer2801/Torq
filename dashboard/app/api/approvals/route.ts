import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { match_id, action } = await req.json() // action: 'approve' | 'reject'

    // 1. Update Match Status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error: matchError } = await supabaseAdmin
      .from('matches')
      .update({ status: newStatus })
      .eq('id', match_id)

    if (matchError) throw matchError

    // 2. Audit Log for Match Review
    await supabaseAdmin.from('audit_logs').insert([
      {
        action_type: `MATCH_${newStatus.toUpperCase()}`,
        entity_id: match_id,
        actor: 'human',
        details: { action, match_id }
      }
    ])

    if (action === 'approve') {
      // 3. Mark pending outbound messages as approved
      const { data: messages, error: msgError } = await supabaseAdmin
        .from('outbound_messages')
        .update({ is_approved: true })
        .eq('match_id', match_id)
        .eq('is_approved', false)
        .select()

      if (msgError) throw msgError

      // 4. Dispatch Messages via Webhooks (Mock)
      for (const msg of messages || []) {
        const webhookUrl = msg.channel === 'whatsapp' 
          ? 'http://localhost:3000/api/webhooks/twilio'
          : 'http://localhost:3000/api/webhooks/resend'

        // Dispatching (in a real app, this might be handled by a queue)
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_id: msg.id, body: msg.message_body, recipient: msg.recipient })
        }).catch(err => console.error('Webhook dispatch failed', err))

        // Update message as sent
        await supabaseAdmin
          .from('outbound_messages')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', msg.id)

        // Audit Log for Dispatch
        await supabaseAdmin.from('audit_logs').insert([
          {
            action_type: 'MESSAGE_DISPATCHED',
            entity_id: msg.id,
            actor: 'system',
            details: { channel: msg.channel, recipient: msg.recipient }
          }
        ])
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

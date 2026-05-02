import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchInventory } from '@/src/services/inventoryService'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { dealer_id, make, model, year_min, year_max, max_price } = body

    // 1. Insert Request
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('requests')
      .insert([
        { dealer_id, make, model, year_min, year_max, max_price, status: 'searching' }
      ])
      .select()
      .single()

    if (requestError) throw requestError

    // 2. Audit Log
    await supabaseAdmin.from('audit_logs').insert([
      {
        action_type: 'DEALER_REQUEST_SUBMITTED',
        entity_id: requestData.id,
        actor: 'human',
        details: body
      }
    ])

    // 3. Fetch Real Inventory using Auto.dev + NHTSA
    // Run asynchronously to not block the request completely if desired, 
    // but for MVP we will await it to ensure we can show results immediately or just let the dashboard poll.
    const inventory = await fetchInventory({ make, model, year_min, year_max, max_price })

    if (inventory.length > 0) {
      // 4. Insert Matches
      for (const vehicle of inventory) {
        const { data: matchData, error: matchError } = await supabaseAdmin
          .from('matches')
          .insert([
            {
              request_id: requestData.id,
              vin: vehicle.vin,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              price: vehicle.price,
              mileage: vehicle.mileage,
              owners: vehicle.owners,
              damage: vehicle.damage,
              recalls: vehicle.recalls,
              description: vehicle.description,
              photos: vehicle.photos,
              location: vehicle.location,
              ai_match_score: vehicle.ai_match_score,
              image_url: vehicle.photos?.[0] || '',
              status: 'pending_review'
            }
          ])
          .select()
          .single()

        if (!matchError && matchData) {
          // 5. Draft Outbound Message (Gated)
          const messageBody = `Hello from TORQai! 🚗 We found a top match (Score: ${vehicle.ai_match_score}/100):\n${vehicle.year} ${vehicle.make} ${vehicle.model}\nPrice: $${vehicle.price}\nMileage: ${vehicle.mileage} miles\nDamage: ${vehicle.damage}\n\nPlease log in to review and approve.`
          
          await supabaseAdmin.from('outbound_messages').insert([
            {
              match_id: matchData.id,
              channel: 'whatsapp',
              recipient: '+15551234567',
              message_body: messageBody,
              is_approved: false
            }
          ])

          await supabaseAdmin.from('audit_logs').insert([
            {
              action_type: 'MESSAGE_DRAFTED',
              entity_id: matchData.id,
              actor: 'agent',
              details: { channel: 'whatsapp', vin: vehicle.vin }
            }
          ])
        }
      }
      
      // Update request to fulfilled
      await supabaseAdmin.from('requests').update({ status: 'fulfilled' }).eq('id', requestData.id)
    }

    return NextResponse.json({ success: true, request: requestData })
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ requests: data })
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

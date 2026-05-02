# Messaging & Approval Skill

## Description
This skill handles drafting outbound messages via WhatsApp (Twilio) and Email (Resend) to dealers about sourced vehicle matches. It strictly enforces the human-in-the-loop approval gate.

## Instructions
1. **Trigger:** Activated when a new match is added to the `matches` table and needs to be communicated to the dealer.
2. **Drafting:** The agent must generate a message using the FTC-Safe Templates provided below.
3. **Database Update:** The drafted message MUST be inserted into the `outbound_messages` table with `is_approved = false`.
4. **Approval Gate:** The agent MUST NOT send the message directly to Twilio or Resend. It must wait until `is_approved` is set to `true` by a human via the dashboard.
5. **Dispatching:** Once `is_approved = true`, the agent (or backend) can dispatch the message to the respective mock webhook endpoint (`/api/webhooks/twilio` or `/api/webhooks/resend`).
6. **Audit Logging:** Every draft and dispatch MUST be logged in the `audit_logs` table (e.g., `MESSAGE_DRAFTED`, `MESSAGE_DISPATCHED`).

## FTC-Safe Templates

### WhatsApp Template (Twilio)
```text
Hello from TORQai! 🚗 We found a potential match for your request:
{Year} {Make} {Model}
Estimated Price: ${Price}
Mileage: {Mileage} miles

Please log in to your TORQai dashboard to review full details and approve this match.
*This is an AI-sourced estimate. Final vehicle condition and availability are subject to dealer verification.*
```

### Email Template (Resend)
```html
<p>Hello,</p>
<p>TORQai has identified a vehicle matching your sourcing criteria:</p>
<ul>
  <li><strong>Vehicle:</strong> {Year} {Make} {Model}</li>
  <li><strong>Estimated Price:</strong> ${Price}</li>
  <li><strong>Mileage:</strong> {Mileage} miles</li>
</ul>
<p>Please log in to your dashboard to review this vehicle, view its history, and approve the match for next steps.</p>
<p><em>Disclaimer: This match was sourced via AI. Vehicle details, history, and availability must be verified by the purchasing dealer.</em></p>
```

## Security Rule
NEVER send a message without a corresponding `id` in `outbound_messages` that has `is_approved = true`.

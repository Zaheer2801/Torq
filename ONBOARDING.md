# TORQai Pilot Onboarding Guide

Welcome to the TORQai MVP Pilot! This guide will help our 3 initial pilot dealers get started with our AI-powered vehicle sourcing platform.

## What is TORQai?
TORQai acts as your automated sourcing assistant. You submit what your customer is looking for, and our OpenClaw agent scans the market (via CarAPI) to find matches. Crucially, **no message goes out to your customer until you approve it**.

---

## Step 1: Submitting a Request
1. Open the **TORQai Intake Dashboard** (e.g., `http://localhost:3000`).
2. Fill out the vehicle requirements:
   - **Make** (e.g., Toyota)
   - **Model** (e.g., Camry)
   - **Min/Max Year** (e.g., 2018 - 2024)
   - **Max Price** (e.g., $25,000)
3. Click **Start AI Sourcing**. The OpenClaw agent will immediately begin searching the database for matching vehicles.

---

## Step 2: Reviewing AI Matches
Once the agent finds potential vehicles, they are placed in a queue awaiting your review.
1. Navigate to the **Approvals Gate** in your dashboard header.
2. Here, you will see a list of vehicle cards labeled **Review Required**.
3. Each card displays the vehicle's specs, estimated price, condition, and mileage.

---

## Step 3: Human-in-the-Loop Approval
Because compliance and accuracy are our top priorities, the AI will draft a message but **will never send it automatically**.

1. **Review the Match**: Ensure the vehicle meets your standards.
2. **Action the Match**:
   - Click **Reject Match** if it's not a good fit. The AI will learn and the match will be discarded.
   - Click **Approve & Send** if you want to notify your customer.
3. **Dispatch**: Once approved, our system dispatches an FTC-compliant template message via WhatsApp (Twilio) or Email (Resend) directly to your customer. 

*(Note: During the MVP phase, these dispatches go to a mock webhook for safety).*

---

## Compliance & Security
- **FTC-Safe Templates:** All outbound messages use strict templates that include necessary disclaimers regarding AI sourcing and dealer verification.
- **Audit Logs:** Every action (search, approval, dispatch) is logged immutably in our database for complete transparency.

If you have any questions during the pilot, please reach out to the TORQai support team. Happy sourcing!

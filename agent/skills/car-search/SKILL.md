# CarAPI Live Search Skill

## Description
This skill instructs the OpenClaw agent to interface with the **live** CarAPI.dev endpoint (`/api/v1/listing`) to source vehicle matches based on real inventory.

## Instructions
1. **Trigger:** Activated when a new sourcing request appears in the `requests` table with `status = 'pending'`.
2. **Action:** Execute an HTTP GET request to `https://carapi.dev/api/v1/listing`. 
   - **Authentication:** Must include the Bearer token (API Key).
   - **Parameters:** Use the `json` query parameter to build a complex filter for Make, Model, Year, Mileage, and Price.
3. **Database Update:** For the top matching vehicle returned from the live API, insert a record into the `matches` table linked to the `request_id`.
4. **Audit Logging:** Securely log the action to `audit_logs` indicating `AGENT_SEARCH_INIT` with the exact query parameters used to call the live API.
5. **No Scraping:** Only use the CarAPI.dev endpoint. Do not attempt to scrape other sites.

## Live API Request Example
```http
GET /api/v1/listing?make=Acura&model=RDX&year=2015&price=8000
Authorization: Bearer <CARAPI_KEY>
```

## Success Criteria
- Live vehicle matches successfully inserted into the database.
- Audit log captures the API query details.
- Request status updated to `searching` or `fulfilled`.

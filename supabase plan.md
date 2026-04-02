# Database Migration: MongoDB to Supabase

Migrating from MongoDB to Supabase (PostgreSQL) is a great move for scalability and relational data integrity. 

## User Review Required

> [!IMPORTANT]
> **Migration Approach Decision**
> Before I rewrite the codebase, we need to decide how deeply we want to integrate Supabase:
> 
> **Option A: Supabase as a "Dumb Database" (Drop-in Replacement)**
> I will swap Mongoose for the `@supabase/supabase-js` client. Our Express backend will still handle generating JWTs, hashing passwords, and sending Ethereal verification emails. Supabase is merely used to store the rows. *This requires the least amount of frontend changes.*
> 
> **Option B: Full Supabase Integration (Recommended)**
> I will completely replace our custom backend authentication with **Supabase Auth**. This means the frontend (`App.jsx`, `Login.jsx`) will talk *directly* to Supabase to log in, register, and handle real verification emails. The Node.js Express server will only be kept to handle the WebSocket Yjs collaboration. *This is the industry standard way to use Supabase and gives you OAuth (Google/Github) capabilities in the future.*
> 
> Please let me know if you prefer **Option A** or **Option B**.

## Proposed Changes (Assuming Option A or B core structure)

### [Prerequisites] User Actions
Because I cannot physically log into your Supabase account, you will need to:
1. Create a new Supabase project at `supabase.com`.
2. Get your `Project URL` and `Service Role Key` and place them in `server/.env`.
3. Run a SQL script (which I will provide) in the Supabase SQL Editor to create the `users` and `documents` tables.

### [Backend Replacement]
#### [DELETE] `server/models/Document.js` & `server/models/User.js`
- Mongoose schemas will be entirely removed.

#### [MODIFY] `server/websocket/persistence.js`
- Will be rewritten to fetch and save the Yjs document state as a `Base64` string into the Supabase `documents` table (since PostgreSQL handles binary data differently than MongoDB).

#### [MODIFY] `server/index.js` & `server/package.json`
- `mongoose` will be uninstalled.
- `@supabase/supabase-js` will be installed.
- Express routes will be updated to use the Supabase client to fetch/create documents.

## Open Questions
1. **Option A or Option B?** (See above)
2. **Have you already created a Supabase project?** If so, I can give you the SQL commands right now in the next step to set up the tables.

## Verification Plan
### Automated Tests
- Test database connection using `@supabase/supabase-js` ping.
### Manual Verification
- Create a document, restart the server, and verify that the Y.js state successfully persisted to Supabase and recovered upon reconnection.

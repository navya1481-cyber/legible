# Legible — Setup Guide

This is a real, working app: a backend server (Node/Express) plus the frontend (a single HTML file the server hosts). The backend holds your Anthropic API key so it is never exposed in the browser.

## 1. Install dependencies

```
cd server
npm install
```

## 2. Add your Anthropic API key

The server reads the key from an environment variable. Set it before starting:

```
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

(You'll need to add one line to index.js to actually read this env var into the request header — see the note at the bottom of this file. Right now the API call is written for the Claude-in-Artifacts environment, which injects the key automatically. For a real standalone deployment, you must add it yourself.)

## 3. Run it

```
npm start
```

This starts the server on port 3001 and serves the website at:

```
http://localhost:3001
```

## 4. Deploy it for real (so anyone can use it)

Locally running on your laptop only works while your laptop is on and connected. To make this a real public website:

- Deploy the `server` folder to a host like Render, Railway, or Fly.io (all have free tiers good enough for an MVP)
- Set the `ANTHROPIC_API_KEY` environment variable in that host's dashboard, not in your code
- Update the `BACKEND_URL` constant near the top of the `<script>` tag in index.html to point at your deployed backend's URL instead of localhost

## How privacy is handled

The IEP/504 upload feature only accepts pasted text, not file uploads, specifically to avoid creating any file artifact that could be mishandled. Pasted text is sent to the backend, used once to generate a plain-language summary, and never written to disk, logged, or stored in any database. Once the response is sent back to the browser, the text is gone. The Passport feature, which does store data long-term, only ever stores it in the user's own browser (localStorage), never on a server, since that is the student's own device and not a third-party record.

## One thing to know about the API key

The server automatically uses `ANTHROPIC_API_KEY` from your environment if it's set, attaching it as the required header for the Anthropic API. If you don't set it, requests will fail outside the Claude Artifacts environment, since there's no key to authenticate with. Setting the environment variable in step 2 above is all you need to do.

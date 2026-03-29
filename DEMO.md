# ContentShield AI — Demo Script (3–4 Minutes)

## Pre-Demo Setup
1. Run `docker-compose up` and open http://localhost:3000
2. Have the dashboard visible on screen
3. Have the Authenticity and Swarm tabs ready to switch to

---

## Minute 0:00 – 0:30 — Introduction

> "ContentShield AI is a multi-agent system that automates the full enterprise
> content lifecycle — from knowledge extraction to publishing — while actively
> preventing misinformation before it goes live."

Show the dashboard. Point out:
- 8 agents in the pipeline
- The pipeline status bar at the top
- The 5 tabs across the top

---

## Minute 0:30 – 1:00 — Start the Pipeline

Click **▶ Run Pipeline**.

Watch agents 1 and 2 complete:
- Knowledge Extractor: "12 facts extracted · 3 compliance constraints loaded"
- Content Generator: "Draft ready · 6 claims tagged with [source] references"

> "Every factual claim in the draft is tagged with a source document ID.
> This is what allows the next agent to verify each one individually."

---

## Minute 1:00 – 1:45 — Authenticity Agent (THE WOW MOMENT)

Watch Agent 3 run. When it completes, switch to the **Authenticity** tab.

Point out:
- Score ring animating to 85/100
- The red CONTRADICTED row: "Revenue grew 340%" → corrected to "34%"
- The source: `q3-earnings-p4 → actual value: 34%`

> "The Authenticity Agent caught a 10x factual error — the draft said 340%
> revenue growth. The source document says 34%. If this had published,
> it would have been a public embarrassment or legal liability."

Switch back to Pipeline tab. The pipeline has already resumed.

---

## Minute 1:45 – 2:15 — Compliance + Human Checkpoint

Watch Agent 4 (Compliance) complete.

The yellow **Human Checkpoint** box appears.

> "The Compliance Agent flagged a competitor mention without the required
> disclaimer. An auto-fix has been applied — the reviewer just needs to
> approve."

Click **✓ Approve & Continue**.

> "In a real enterprise, this could be a legal reviewer, brand manager,
> or compliance officer. One click. The pipeline continues."

---

## Minute 2:15 – 2:45 — Localization

Watch Agent 5 (Localization) complete. Switch to the **Localization** tab.

Point out:
- Hindi: 91% match — auto-approved
- Japanese: 95% match — auto-approved
- German: 78% match — FLAGGED

> "The German translation drifted 22% from the original meaning.
> 'Ensures' became 'guarantees' — a word that carries legal liability.
> The system flagged it automatically and showed the exact fix needed."

---

## Minute 2:45 – 3:15 — Swarm Detection (SECOND WOW MOMENT)

Watch Agents 6 and 7 complete. Switch to the **Swarm Watch** tab.

Point out the escalation panel:
- Swarm probability: 0.79
- 847 suspicious reposts
- 94% of amplifying accounts created less than 14 days ago
- 91% from a single geographic region

> "10 minutes after publishing, the Swarm Agent detected that 847 accounts
> — mostly bots under 14 days old — are amplifying this post in a coordinated
> pattern. The system automatically filed a platform abuse report and notified
> the security team. No human had to monitor this."

---

## Minute 3:15 – 3:30 — Business Impact Close

Switch to the **Impact** tab.

> "One content cycle: 4.8 hours instead of 5–7 days. One hallucination
> caught before it published. Zero compliance violations. And a disinformation
> swarm detected within minutes.
>
> At 200 pieces per month, that's $1.7M in team cost savings, plus
> prevention of a brand incident that could cost millions.
>
> 15 to 20x ROI in 12 months."

---

## Key Talking Points for Q&A

- **"How is this different from Jasper/Copy.ai?"** — Those tools stop at generation. ContentShield adds 6 more stages after generation, including safety checks no other tool does.
- **"Why is Swarm Detection unique?"** — No enterprise content tool today does post-publish coordinated amplification detection. It's an emerging regulatory and brand liability risk.
- **"Is this production-ready?"** — The architecture is production-grade Spring Boot + React + Kafka. This is a prototype of a real buildable system.
- **"What LLM does it use?"** — OpenAI GPT-4o by default, but the LLMClient abstraction supports any model including Claude or on-premise Llama.

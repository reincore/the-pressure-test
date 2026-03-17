# The Pressure Test

An epistemic stress-testing tool. Paste the idea, argument, or opinion you're about to make public. Choose a posture. Receive structured critical feedback — no sycophancy, no validation theater.

Live: [reincore.github.io/the-pressure-test](https://reincore.github.io/the-pressure-test/)

---

## The Three Postures

### Trusted Friend
A pre-mortem from someone who cares but has no stake in your success. Starts with a gut reaction. Identifies 2–3 real risks. Names blind spots. Ends with a verdict: **Proceed / Refine / Reconsider**.

*Sections: First Reaction · What Could Go Wrong · What You're Not Seeing · My Honest Verdict*

### Socratic
Never tells you you're wrong. Instead surfaces the 3–5 weakest assumptions as labeled questions: `[Empirical Claim]`, `[Hidden Assumption]`, `[Scope Problem]`, `[Motivated Reasoning]`, `[Causal Claim]`, `[Definitional Problem]`. Ends with the single Core Question that most undermines the position.

*Sections: Pressure Points · Core Question · What Actually Holds Up*

### Devil's Advocate
A serious intellectual opponent, not a contrarian. Steelmans your position first (one sentence), then constructs the strongest possible case against it. Identifies the Fatal Assumption — the one thing, if wrong, that collapses everything.

*Sections: The Steelman · The Case Against · The Fatal Assumption · Where You're Actually Right*

---

## Getting Started

**Prerequisites:** Node 20+, a [Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)

```bash
git clone https://github.com/reincore/the-pressure-test.git
cd the-pressure-test
npm install
npm run dev
```

Open [localhost:5173/the-pressure-test/](http://localhost:5173/the-pressure-test/), set your API key in the bar at the top, and run.

---

## How it works

- Requests go **directly from your browser** to the Gemini API — no backend, no server, no data stored outside your device
- API key is saved to `localStorage` (never transmitted anywhere except Google)
- Session history (last 15) saved locally and can be reloaded at any time

---

## Tech Stack

- **Vite** + **React** (JSX)
- **lucide-react** for icons
- **Google Gemini 2.5 Flash** via REST API
- Fonts: Playfair Display + IBM Plex Mono (Google Fonts)
- Deployed to **GitHub Pages**

---

## Roadmap

- [ ] Additional postures (Steel Manning only, Bayesian update, adversarial peer review)
- [ ] Export session to plain text / PDF
- [ ] Shareable links (hash-encoded, no backend)
- [ ] Multi-turn follow-up questions within a session
- [ ] Configurable temperature and model selection

---

## Companion Tool

**[The Rabbit Hole](https://reincore.github.io/the-rabbit-hole/)** — a research rabbit hole navigator. Where The Pressure Test helps you stress-test what you *think you know*, The Rabbit Hole helps you explore what you *don't yet know*.

---

## Research Context

The Pressure Test is built on the observation that most idea-validation is socially captured — we share things with people who want us to succeed, or who lack the context to challenge us effectively. Structured adversarial review (pre-mortems, red-teaming, Socratic dialogue) consistently improves decision quality. This tool applies those methods to any argument, on demand, without social cost.

---

## License

MIT — Copyright 2026 reincore

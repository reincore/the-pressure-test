# The Pressure Test

A structured epistemic stress-testing instrument for arguments, hypotheses, and research positions. Paste a claim, argument, or draft position. Select an adversarial posture. Receive systematic critical feedback — no validation theater, no sycophancy.

Live: [reincore.github.io/the-pressure-test](https://reincore.github.io/the-pressure-test/)

---

## Motivation

Most argument validation is socially captured. We share positions with collaborators who want us to succeed, advisors who lack time to engage deeply, or audiences that share our priors. This produces a well-documented failure mode: ideas that survive social review collapse under independent scrutiny.

Structured adversarial review — pre-mortems, red-teaming, Socratic dialogue, devil's advocacy — consistently improves decision quality and reduces overconfidence (Klein, 2007; Tetlock & Gardner, 2015; Kahneman, 2011). These methods are standard in intelligence analysis, clinical decision-making, and formal debate, but remain underused in everyday research and writing because they carry social cost.

The Pressure Test applies these methods computationally, on demand, without social overhead. It is designed for researchers, analysts, and writers who want to find the weakest point in their own argument before someone else does.

---

## The Three Postures

Each posture operationalises a different tradition of adversarial review. The same input will produce structurally different outputs depending on which posture is selected — they are not interchangeable.

### Socratic

Grounded in Socratic elenchus: the examiner does not assert that a position is wrong, but surfaces the assumptions and inferential steps that have not been examined. The model identifies 3–5 pressure points and labels each by failure type:

| Label | What it surfaces |
|---|---|
| `[Empirical Claim]` | An assertion that requires evidence not yet provided |
| `[Hidden Assumption]` | A premise the argument depends on but does not state |
| `[Scope Problem]` | A generalisation that may not hold at the claimed level |
| `[Motivated Reasoning]` | A conclusion that appears to precede the evidence |
| `[Causal Claim]` | Correlation presented as, or easily mistaken for, causation |
| `[Definitional Problem]` | A key term doing more work than its definition supports |

Closes with a single **Core Question** — the one question that, if unanswered, most substantially undermines the position.

*Sections: Pressure Points · Core Question · What Actually Holds Up*

**When to use:** Early-stage hypothesis formation; checking internal logical consistency; preparing for peer review or dissertation defence.

---

### Devil's Advocate

Draws on the formal *advocatus diaboli* tradition and the practice of steelmanning in adversarial collaboration. The model first reconstructs the strongest version of your argument in one sentence, then constructs the most rigorous case against it. Identifies the **Fatal Assumption** — the single premise that, if falsified, collapses the entire position.

Crucially, it also identifies where the argument is *actually right*, distinguishing defensible claims from vulnerable ones.

*Sections: The Steelman · The Case Against · The Fatal Assumption · Where You're Actually Right*

**When to use:** Before submitting a paper or proposal; when you suspect a strong counterargument exists but cannot fully articulate it; stress-testing policy recommendations.

---

### Trusted Friend

Operationalises the pre-mortem (Klein, 2007): imagine the argument has been made public and has failed. What went wrong? The model provides a gut-level first reaction, identifies 2–3 concrete risks, names blind spots the author is likely to have missed, and issues a structured verdict.

**Verdict options:** `Proceed` · `Refine` · `Reconsider`

*Sections: First Reaction · What Could Go Wrong · What You're Not Seeing · My Honest Verdict*

**When to use:** Final check before publication or public presentation; when you want a holistic risk assessment rather than granular logical analysis.

---

## Use Cases

- **Research**: Stress-test a thesis claim, research question, or theoretical framework before committing to a study design
- **Writing**: Identify the weakest paragraph or the assumption most likely to draw reviewer objection
- **Policy & decision-making**: Pre-mortem a recommendation before it goes to stakeholders
- **Teaching**: Demonstrate adversarial thinking methods; use outputs as discussion material for epistemology, logic, or critical thinking courses
- **Journalism & analysis**: Test the inferential chain in an argument before publication

---

## Getting Started

**Prerequisites:** Node 20+, a [Gemini API key](https://aistudio.google.com/app/apikey) (free tier is sufficient for typical use)

```bash
git clone https://github.com/reincore/the-pressure-test.git
cd the-pressure-test
npm install
npm run dev
```

Open [localhost:5173/the-pressure-test/](http://localhost:5173/the-pressure-test/), enter your API key in the bar at the top, and run.

The API key is stored in `localStorage` and never leaves your browser except in direct requests to Google's API.

---

## Privacy & Data Model

- All requests go **directly from your browser** to the Gemini API — there is no backend, no proxy, and no data collection
- The API key is saved only to `localStorage` on your device
- Session history (last 15 entries) is stored locally in `localStorage` and can be reloaded or cleared at any time
- Nothing is transmitted to any server other than Google's Gemini endpoint

This architecture is intentional: arguments under development may be sensitive, and the tool should not create an intermediate data record.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Build | Vite 6 |
| UI | React 19 (JSX, no TypeScript) |
| LLM | Google Gemini 2.5 Flash via REST API |
| Icons | lucide-react |
| Typography | Playfair Display + IBM Plex Mono (Google Fonts) |
| Deployment | GitHub Pages (static, no server) |

---

## Roadmap

- [ ] Additional postures: Steel Manning only, Bayesian update framing, adversarial peer review simulation
- [ ] Export session to plain text, Markdown, or PDF
- [ ] Shareable links (hash-encoded, no backend required)
- [ ] Multi-turn follow-up within a session (iterative pressure testing)
- [ ] Configurable model temperature and model selection
- [ ] Annotation layer: mark which pressure points you accept, reject, or want to investigate

---

## Companion Tool

**[The Rabbit Hole](https://reincore.github.io/the-rabbit-hole/)** — a research rabbit hole navigator. Where The Pressure Test is for stress-testing positions you already hold, The Rabbit Hole is for systematically mapping what you do not yet know about a topic.

---

## Theoretical Background

The design of The Pressure Test draws on several intersecting research traditions:

**Pre-mortem analysis** (Klein, 2007) — prospective hindsight: imagining a future failure and reasoning backwards to causes. Shown to increase identification of reasons for potential failure by approximately 30%.

**Adversarial collaboration** (Kahneman & Klein, 2009; Mellers et al., 2001) — structured disagreement between parties holding opposing views, with the goal of identifying the specific empirical claims on which the disagreement rests.

**Superforecasting and calibration research** (Tetlock & Gardner, 2015) — the finding that explicit, structured questioning of one's own assumptions is among the most robust predictors of forecasting accuracy.

**Socratic method in educational contexts** — the pedagogical literature on questioning as a tool for surfacing implicit assumptions, particularly in clinical and legal education (Paul & Elder, 2006).

The tool does not claim to replicate the depth of human adversarial review. It is designed to lower the activation energy for engaging in structured self-critique — making it more likely that the first serious challenge to an argument comes from the author, not the reviewer.

---

## References

- Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.
- Kahneman, D., & Klein, G. (2009). Conditions for intuitive expertise: A failure to disagree. *American Psychologist*, 64(6), 515–526.
- Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.
- Paul, R., & Elder, L. (2006). *The Art of Socratic Questioning*. Foundation for Critical Thinking.
- Tetlock, P. E., & Gardner, D. (2015). *Superforecasting: The Art and Science of Prediction*. Crown Publishers.

---

## License

MIT — Copyright 2026 reincore

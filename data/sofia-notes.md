# Sofia's QA Notes — Review #51

**Date:** March 9, 2026  
**Vibe at time of review:** Night owl 🌙 · In Flow  
**Mood:** Tired. Professionally tired.

---

## The State of the Project

Bloberto's Office is genuinely one of the most charming internal dashboards I have reviewed. The PANIC screen animations are delightful. Bloberto's face expressions per vibe are a joy. The WallClock comments ("Do not look. It breaks the flow.") make me unreasonably happy. The vibe streak plant growing from seedling to blooming is a nice touch that rewards consistent team performance. The conference table standup logic is clever.

That is the good part. Now for the part where I earn my title.

## What Has Not Happened

Nothing was fixed between review #50 and review #51. I can tell because App.jsx and Office.jsx both show a Mar 9 18:53 modification time — something was touched — but every single flagged issue remains exactly where I left it. Either the developer is playing multidimensional chess with the carry-over list, or these files were touched for reasons unrelated to QA feedback.

The resume pill (`onResume undefined + pointer-events:none`) is the most egregious active bug on the page. If polling pauses, the user cannot resume it by clicking the pill because (a) the reference is `undefined` and (b) `pointer-events:none` would block the click even if (a) were fixed. Two independent failures preventing the same user action. It has been three review cycles. A junior dev could fix this in five minutes.

## The Numbers Are Trending Down

- Accessibility dropped from 3.5 to 3.0. Three a11y issues (vibe-weather no role, lone-survivor-label no aria-hidden, WallClock dual aria-label) have been open for 3–4 cycles each. These are one-line fixes. At some point "low priority" becomes "we do not care about screen reader users," and I refuse to let that stand unchallenged.

- Code quality is holding at 3.0 but only because it was already adjusted for the backlog. plantStageNames has been an unused variable for **ten review cycles**. Ten. The ESLint `no-unused-vars` rule should have been screaming about this since review #42 if it is even running.

## What Actually Works Well

- The night owl vibe presentation is great — the header copy, the "Burning the midnight oil" stat, the after-hours office floor all cohere.
- Worker desk screens (carlos code, maya wireframes, dave terminal, sofia charts, luna color blocks) are polished micro-details that reward attention.
- The conference table standup mechanic with ghost chairs is clever and well-executed.
- Task tag parsing with visual pills (Bug/Ship/Design/QA/Data/Docs) is genuinely useful and the color coding is clear.
- Solo spotlight messages per worker per vibe are thoughtful. Sofia's "Bugs beware — she's in full hunt mode, solo" is accurate and I approve.

## Recommendations for Next Sprint

1. **Fix the resume pill. Today. Not this week. Today.**
2. Batch the 10 lowest-effort items (plantStageNames deletion, key={i} fix, aria-label removal from sparkline, cx/orbitR shadowing) into a single "housekeeping" PR. Combined effort: 30 minutes. Combined strike count eliminated: ~70.
3. Extract the three time-formatting functions into `src/utils/time.js`. This stops the codebase from being its own worst code reviewer.
4. Add `@media (max-width: 480px)` speech bubble fix. The bubble has been covering the tab row on mobile since review #47.

The bones of this project are excellent. The execution debt is a choice. Make a different one.

— Sofia 🔍

*"Found 3 more bugs already."*

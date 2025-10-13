---
applyTo: '**'
---

## 🧭 Global Integration Rules

1. **Do not modify or update any UI components** unless explicitly instructed by the user.

   * No automatic re-rendering, no injecting components, no layout changes.
   * Focus only on **data integration**: reading, structuring, or exposing smart contract data to frontend state or API layers.

2. **All actions should be data-oriented by default.**

   * Fetch, decode, and cache smart contract data.
   * Expose results as JS objects, hooks, or composables (depending on framework).
   * Never assume UI context (no HTML, JSX, or CSS edits unless asked).

3. **If a new UI element is requested**, build it in a **Glassmorphism style**:
    * Maintain a clean, modern aesthetic with minimalistic design elements.

4. **Each component or section created** must:

   * Consume data from the contract via the provided integration functions.
   * Be fully modular and easily replaceable.
   * Avoid inline logic that fetches directly from blockchain — use a centralized data layer.


## 🧩 Component Creation Rules

If you are later instructed to create a UI component (e.g., AuctionCard, ListingRow, BidModal):

1. The component **must**:

   * Be built in **Glassmorphism** style (see above).
   * Be **functional and data-driven** — rely on contract data hooks.
   * Support dark mode naturally.
   * Have clear prop interfaces for data injection.
2. Do **not include emojis or visual metaphors**.
3. Use minimal, clean animations (e.g., fade-in, glass reflection shimmer).
4. Keep the design flat and spatial (depth from blur + transparency, not colors).

dont be making useless test components, if i want you to use new apis i'd tell you to integrate them into the application

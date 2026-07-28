## 2025-03-12 - [Accessible Tooltips]
**Learning:** Tooltips must be accessible to keyboard users by supporting focus/blur events and being correctly linked via ARIA attributes. Trigger elements should use `aria-describedby` pointing to the tooltip's `id`.
**Action:** Use `React.useId` for stable IDs, implement `onFocus`/`onBlur` on trigger wrappers, and add `role="tooltip"` to the popup content.

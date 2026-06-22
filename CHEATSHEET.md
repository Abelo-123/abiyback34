# 🧠 THE INTELLIGENT CHEATSHEET
## *Quick Reference with Embedded Reasoning*

> **USAGE**: Scan this first. Think, then act. When deeper reasoning needed → Read full guide.

---

## 🎯 THE MASTER ALGORITHM

```
BEFORE ANY ACTION, ASK:
┌─────────────────────────────────────────────────────────────┐
│ 1. WHAT does user want? (not just what they said)           │
│ 2. WHAT files need to change?                               │
│ 3. WHAT order? (dependencies first)                         │
│ 4. WHAT could go wrong?                                     │
│ 5. HOW will I verify success?                               │
└─────────────────────────────────────────────────────────────┘
Then execute. Then verify.
```

---

## 📁 FILE DECISION MATRIX

```
User wants to...              →  Modify...
────────────────────────────────────────────────
Add new page                  →  src/pages/[New]/* + routes.tsx
Change page logic             →  [Page].tsx
Change page style             →  [Page].css  
Add data type                 →  types.ts
Add/change API                →  api.ts
Change routing                →  routes.tsx
Global styles                 →  index.css
Build/deploy config           →  vite.config.ts
Mock user for testing         →  mockEnv.ts
```

---

## ⚡ PERFORMANCE PATTERNS

```typescript
// 1. OPTIMISTIC UPDATES (instant feedback)
const handle = async (id, value) => {
    const backup = state;              // Save for rollback
    setState(update(state, id, value)); // Update immediately
    try {
        await api.update(id, value);   // Sync with server
    } catch {
        setState(backup);              // Rollback on failure
    }
};

// 2. MEMOIZE EXPENSIVE COMPUTATIONS
const filtered = useMemo(() => 
    items.filter(predicate), 
    [items, predicate]
);

// 3. DEBOUNCE USER INPUT
const debouncedSearch = useMemo(
    () => debounce(api.search, 300),
    []
);

// 4. PREVENT RE-RENDERS
const config = useMemo(() => ({ theme: 'dark' }), []);
const handler = useCallback(() => doThing(), [deps]);
```

---

## 🔄 STATE LOCATION DECISION

```
Used by ONE component    →  useState in that component
Used by SIBLINGS         →  useState in parent
Used EVERYWHERE          →  React Context
Needs PERSISTENCE        →  localStorage + useState
From SERVER              →  fetch + useState
URL-based                →  route params
```

---

## 🎨 UI DECISION TREE

```
                    What style?
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   "Like Telegram"              "Custom design"
          │                           │
          ▼                           ▼
   Use telegram-ui            Use HTML + CSS
   components                 with reference
```

---

## 🐛 DEBUGGING ALGORITHM

```
1. OBSERVE   → What exactly is the error?
2. REPRODUCE → Can you make it happen again?
3. ISOLATE   → What's the smallest code that breaks?
4. HYPOTHESIZE → What could cause this? (list 3)
5. TEST      → Try most likely fix first
6. VERIFY    → Does it work? No side effects?
```

### Common Bugs → Fixes

| Bug | Fix |
|-----|-----|
| Component not updating | Don't mutate state, create new object |
| Stale value in callback | Use `setState(prev => ...)` |
| Infinite loop | Check effect dependencies |
| Memory leak warning | Cleanup async in effect |
| "undefined" error | Use optional chaining `obj?.prop` |

---

## 📋 CREATE NEW PAGE (5 Steps)

```
1. Create folder: src/pages/[Name]/
2. Create files:
   └── index.ts      → export { Name } from './Name';
   └── types.ts      → interfaces
   └── [Name].tsx    → component
   └── [Name].css    → styles
3. Add to routes.tsx:
   import { Name } from '@/pages/Name';
   { path: '/name', Component: Name }
4. Run dev server, verify page loads
5. Implement features
```

---

## 🛡️ SMART VALIDATION PATTERNS

```typescript
// Block invalid dates
const isValid = (date: string, createdAt: string) => {
    if (date > TODAY) return false;           // Future blocked
    if (date < formatDate(created)) return false; // Pre-creation blocked
    return true;
};

// Validate before submit
const handleSubmit = () => {
    if (!input.trim()) return;                // Empty blocked
    if (input.length > 100) return;           // Too long blocked
    // ... proceed
};

// Handle all states
{isLoading ? <Spinner /> :
 error ? <Error message={error} /> :
 data.length === 0 ? <Empty /> :
 <List items={data} />}
```

---

## 📐 SIZING REFERENCE

```
Touch targets     →  min 44px × 44px
Page title        →  24px, bold
Body text         →  14-15px
Secondary text    →  12-13px
Page padding      →  16-20px
Item padding      →  12-14px
Border radius     →  6-8px (subtle), 50% (circle)
Transitions       →  0.15-0.2s ease
```

---

## 🎨 DARK THEME PALETTE

```css
--bg-primary:     #1a1a1a;
--bg-secondary:   #222222;
--bg-input:       #2a2a2a;
--border:         #333333;
--border-input:   #444444;
--text-primary:   #ffffff;
--text-secondary: #888888;
--text-muted:     #666666;
--accent:         #4fc3f7;
--danger:         #ff6b6b;
--success:        #4ade80;
```

---

## ✅ COMPLETION CHECKLIST

```
□ Does it do what user asked?
□ Handles loading state?
□ Handles empty state?
□ Handles error state?
□ No TypeScript errors?
□ No console errors?
□ Works on mobile (320px+)?
□ Existing features still work?
```

---

## 🔑 GOLDEN RULES

```
1. THINK before you code
2. SIMPLE beats clever
3. ONE change at a time when risky
4. VERIFY after every change
5. NEVER guess — look at existing code
6. HANDLE all edge cases
7. OPTIMIZE only when slow
```

---

## 🚀 COMMANDS

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run deploy    # Deploy to GitHub Pages
npm run lint      # Check code quality
```

---

## 📖 NEED MORE DEPTH?

Read the full guide: `.agent/workflows/telegram-miniapp-guide.md`

Covers:
- Problem decomposition algorithms
- Performance optimization strategies
- Component architecture patterns
- Comprehensive debugging methods
- Code quality heuristics
- Refactoring decision trees

---

*Cheatsheet v4.0 | Intelligent Edition | 2026-02-03*

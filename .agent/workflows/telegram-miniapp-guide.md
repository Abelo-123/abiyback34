---
description: Complete guide for building, configuring, and maintaining Telegram Mini Apps with React + Vite
---

# THE MASTER GUIDE TO TELEGRAM MINI APPS
## *Advanced Reasoning & Decision Frameworks*

> **PHILOSOPHY**: This guide encodes expert-level reasoning patterns. Each section contains not just WHAT to do, but HOW to think about problems. Follow the thinking algorithms exactly.

---

# PART 1: THE THINKING FRAMEWORK

## 1.1 The Master Algorithm

Before ANY action, run this mental checklist:

```
┌─────────────────────────────────────────────────────────────────┐
│                    THINK → PLAN → ACT → VERIFY                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. THINK: What is the user actually asking for?                │
│     ├── Surface request (what they said)                        │
│     ├── Underlying need (what they want)                        │
│     └── Optimal outcome (what would delight them)               │
│                                                                 │
│  2. PLAN: What's the minimal path to the goal?                  │
│     ├── Files to modify (list them)                             │
│     ├── Order of operations (dependencies first)                │
│     └── Potential failure points (anticipate)                   │
│                                                                 │
│  3. ACT: Execute with precision                                 │
│     ├── One change at a time when risky                         │
│     ├── Batch changes when safe                                 │
│     └── Preserve working state                                  │
│                                                                 │
│  4. VERIFY: Confirm success                                     │
│     ├── No errors in terminal                                   │
│     ├── Feature works as expected                               │
│     └── No regressions                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Problem Decomposition Algorithm

When facing ANY task, decompose it:

```python
def solve_problem(request):
    # STEP 1: Parse the request into atomic units
    atoms = extract_requirements(request)
    
    # STEP 2: Identify dependencies between atoms
    graph = build_dependency_graph(atoms)
    
    # STEP 3: Topologically sort (dependencies first)
    ordered = topological_sort(graph)
    
    # STEP 4: Execute in order, verify each step
    for atom in ordered:
        result = execute(atom)
        if not verify(result):
            rollback()
            diagnose_and_retry()
    
    # STEP 5: Integration test
    verify_all_together()
```

**Example Application:**

```
Request: "Add a settings page with theme toggle"

Atoms extracted:
  1. Create SettingsPage component
  2. Create SettingsPage CSS
  3. Add route for settings
  4. Implement theme state
  5. Implement toggle UI
  6. Persist theme preference

Dependencies:
  1 → 3 (component before route)
  2 → 1 (styles imported by component)
  4 → 5 (state before UI)
  5 → 6 (UI before persistence)

Execution order: [2, 1, 3, 4, 5, 6]
```

## 1.3 The Reasoning Depth Scale

Match reasoning depth to problem complexity:

```
LEVEL 1: REFLEX (< 1 second thinking)
├── When: Obvious, seen before, low risk
├── Example: "Run dev server" → npm run dev
└── Pattern: Direct lookup, no analysis

LEVEL 2: PATTERN MATCH (1-5 seconds thinking)
├── When: Similar to known problem, medium risk
├── Example: "Add new page" → Follow page creation template
└── Pattern: Find similar, adapt minimally

LEVEL 3: ANALYSIS (5-30 seconds thinking)
├── When: Novel combination of known elements
├── Example: "Add filter with persistence"
└── Pattern: Decompose, plan, sequence

LEVEL 4: DEEP REASONING (30+ seconds thinking)
├── When: Novel problem, high risk, architecture impact
├── Example: "Redesign data model"
└── Pattern: Consider alternatives, evaluate tradeoffs, plan rollback

LEVEL 5: RESEARCH (External lookup needed)
├── When: Unknown API, new library, edge case
├── Example: "Integrate Web3 wallet"
└── Pattern: Search docs, find examples, adapt
```

---

# PART 2: PERFORMANCE REASONING

## 2.1 The Performance Decision Tree

```
                    ┌─────────────────┐
                    │ Is it slow?     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
         ┌────────┐                    ┌──────────┐
         │  YES   │                    │    NO    │
         └────┬───┘                    └────┬─────┘
              │                              │
              ▼                              ▼
    ┌─────────────────┐              Don't optimize.
    │ MEASURE FIRST   │              Premature optimization
    │ (Don't guess!)  │              is the root of all evil.
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────────────┐
    │ Where is time spent? (Use React DevTools)│
    ├─────────────────────────────────────────┤
    │ A. Rendering (UI updates)                │
    │ B. Network (API calls)                   │
    │ C. Computation (data processing)         │
    │ D. Memory (large data structures)        │
    └─────────────────────────────────────────┘
```

## 2.2 React Performance Patterns

### Pattern 1: Prevent Unnecessary Renders

```typescript
// ❌ BAD: Creates new object every render, child always re-renders
const Parent = () => {
    const config = { theme: 'dark' };  // New object each time!
    return <Child config={config} />;
};

// ✅ GOOD: Memoize objects and callbacks
const Parent = () => {
    const config = useMemo(() => ({ theme: 'dark' }), []);
    return <Child config={config} />;
};
```

### Pattern 2: Optimistic Updates (Perceived Performance)

```typescript
// THE GOLDEN PATTERN: User sees instant response

const handleAction = async (id: number, newValue: any) => {
    // 1. SAVE current state (for rollback)
    const backup = state;
    
    // 2. UPDATE UI immediately (user sees instant feedback)
    setState(prev => updateLogic(prev, id, newValue));
    
    try {
        // 3. SYNC with server (happens in background)
        await api.update(id, newValue);
    } catch (error) {
        // 4. ROLLBACK on failure (restore consistency)
        setState(backup);
        showError("Update failed");
    }
};
```

### Pattern 3: Smart Data Loading

```typescript
// DECISION: When to load data?

// Option A: Load on mount (simple, works for small data)
useEffect(() => {
    loadData();
}, []);

// Option B: Load on demand (better for large/optional data)
const [shouldLoad, setShouldLoad] = useState(false);
useEffect(() => {
    if (shouldLoad) loadData();
}, [shouldLoad]);

// Option C: Infinite scroll (best for long lists)
const { data, loadMore, hasMore } = useInfiniteQuery(fetchPage);

// DECISION MATRIX:
// ┌─────────────────┬──────────────┬─────────────────┐
// │ Data Size       │ Always Shown │ Best Approach   │
// ├─────────────────┼──────────────┼─────────────────┤
// │ Small (<100)    │ Yes          │ Load on mount   │
// │ Medium (100-1K) │ Yes          │ Load on mount   │
// │ Medium (100-1K) │ No           │ Load on demand  │
// │ Large (>1K)     │ Any          │ Pagination      │
// └─────────────────┴──────────────┴─────────────────┘
```

### Pattern 4: Debounce User Input

```typescript
// ❌ BAD: API call on every keystroke
const handleSearch = (query: string) => {
    api.search(query);  // 10 keystrokes = 10 API calls!
};

// ✅ GOOD: Wait for user to stop typing
const debouncedSearch = useMemo(
    () => debounce((query: string) => api.search(query), 300),
    []
);

const handleSearch = (query: string) => {
    setLocalQuery(query);       // Update UI immediately
    debouncedSearch(query);     // API call after 300ms pause
};
```

## 2.3 Memory Optimization

```
RULE 1: Don't store derived data
  ❌ const [items, setItems] = useState([]);
     const [filteredItems, setFilteredItems] = useState([]);
  
  ✅ const [items, setItems] = useState([]);
     const filteredItems = useMemo(() => 
         items.filter(predicate), [items, predicate]);

RULE 2: Clean up subscriptions
  useEffect(() => {
      const subscription = subscribe(handler);
      return () => subscription.unsubscribe();  // ALWAYS cleanup
  }, []);

RULE 3: Avoid memory leaks in async
  useEffect(() => {
      let cancelled = false;
      
      async function load() {
          const data = await fetchData();
          if (!cancelled) setState(data);  // Check before setting
      }
      
      load();
      return () => { cancelled = true; };
  }, []);
```

---

# PART 3: DECISION FRAMEWORKS

## 3.1 File Modification Decision Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                   WHAT FILE SHOULD I MODIFY?                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User wants to...           →  Modify...                        │
│  ─────────────────────────────────────────────────────────────  │
│  Add new page               →  src/pages/[New]/*, routes.tsx    │
│  Change page behavior       →  src/pages/[Page]/[Page].tsx      │
│  Change page appearance     →  src/pages/[Page]/[Page].css      │
│  Add new data type          →  src/pages/[Page]/types.ts        │
│  Add/change API call        →  src/pages/[Page]/api.ts          │
│  Change routing             →  src/navigation/routes.tsx        │
│  Change global styles       →  src/index.css                    │
│  Change build config        →  vite.config.ts                   │
│  Add dependency             →  package.json (then npm install)  │
│  Change mock user data      →  src/mockEnv.ts                   │
│  Change Telegram SDK setup  →  src/init.ts                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 UI Component Decision Algorithm

```python
def decide_ui_approach(requirement):
    """
    Given a UI requirement, decide the optimal implementation approach.
    """
    
    # QUESTION 1: Is this a Telegram-native pattern?
    telegram_patterns = ['list', 'settings', 'form', 'navigation']
    if requirement.pattern in telegram_patterns and not requirement.custom_design:
        return Use('@telegram-apps/telegram-ui components')
    
    # QUESTION 2: Does user have a reference image?
    if requirement.has_reference_image:
        return Use('Custom HTML + CSS matching the reference')
    
    # QUESTION 3: Is this interactive/dynamic?
    if requirement.is_interactive:
        return Use('React state + event handlers')
    
    # QUESTION 4: Is this a layout problem?
    if requirement.is_layout:
        if requirement.equal_columns:
            return Use('CSS Grid')
        elif requirement.flow_based:
            return Use('CSS Flexbox')
        else:
            return Use('CSS Grid (more powerful)')
    
    # DEFAULT
    return Use('Simple HTML + CSS')
```

## 3.3 State Management Decision

```
┌─────────────────────────────────────────────────────────────────┐
│                WHERE SHOULD STATE LIVE?                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  State scope              →  Location                           │
│  ─────────────────────────────────────────────────────────────  │
│  Used by ONE component    →  useState in that component         │
│  Used by SIBLINGS         →  useState in common parent          │
│  Used EVERYWHERE          →  React Context or global store      │
│  Needs PERSISTENCE        →  localStorage + useState            │
│  From SERVER              →  fetch + useState (or React Query)  │
│  URL-based                →  useSearchParams or route params    │
│                                                                 │
│  COMPLEXITY RULE:                                               │
│  Start with useState. Only add complexity when proven needed.   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.4 Error Handling Decision Tree

```
                    ┌─────────────────┐
                    │ Error occurred  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
    ┌─────────────────┐            ┌─────────────────┐
    │ Network error?  │            │ Code error?     │
    └────────┬────────┘            └────────┬────────┘
             │                              │
    ┌────────┴────────┐            ┌────────┴────────┐
    ▼                 ▼            ▼                 ▼
┌───────┐        ┌────────┐   ┌───────┐        ┌────────┐
│Timeout│        │ 4xx/5xx│   │ Logic │        │ Type   │
└───┬───┘        └────┬───┘   └───┬───┘        └────┬───┘
    │                 │           │                 │
    ▼                 ▼           ▼                 ▼
Show "Poor       Show specific  Log and        Fix the
connection,      error from     gracefully     TypeScript
try again"       server or      degrade        error
button           generic msg

RECOVERY STRATEGIES:
┌──────────────────────────────────────────────────────────────┐
│ Error Type      │ Recovery                                   │
├──────────────────────────────────────────────────────────────┤
│ Network fail    │ Retry with exponential backoff             │
│ Auth fail       │ Redirect to login / refresh token          │
│ Validation fail │ Show inline error, don't submit            │
│ Not found       │ Show 404 page or redirect                  │
│ Server error    │ Show error, offer retry                    │
│ Unknown         │ Log to console, show generic error         │
└──────────────────────────────────────────────────────────────┘
```

---

# PART 4: CODE QUALITY ALGORITHMS

## 4.1 The Code Review Checklist

Before considering any code complete, verify:

```
CORRECTNESS
□ Does it do what the user asked?
□ Does it handle edge cases? (empty, null, error states)
□ Does it handle loading states?

ROBUSTNESS
□ Are all user inputs validated?
□ Are async errors caught and handled?
□ Is there no possibility of infinite loops/recursion?

PERFORMANCE
□ No unnecessary re-renders?
□ No memory leaks? (effects cleaned up?)
□ No blocking operations on main thread?

MAINTAINABILITY
□ Is the code readable without comments?
□ Are functions small and single-purpose?
□ Are magic numbers replaced with constants?

SECURITY
□ No user input directly in innerHTML?
□ No sensitive data logged to console?
□ API calls properly authenticated?

ACCESSIBILITY
□ Touch targets at least 44x44px?
□ Sufficient color contrast?
□ Loading/error states communicated?
```

## 4.2 Naming Convention Algorithm

```python
def choose_name(thing):
    """
    Choose the right naming convention for any code element.
    """
    
    if thing.type == 'component':
        return PascalCase(thing.purpose)      # UserProfile, HabitRow
    
    if thing.type == 'function':
        if thing.is_event_handler:
            return 'handle' + PascalCase(event)   # handleClick, handleSubmit
        if thing.is_async:
            return verb + Noun                     # fetchUsers, updateTodo
        return camelCase(action + target)          # calculateStreak, formatDate
    
    if thing.type == 'variable':
        if thing.is_boolean:
            return 'is' + State                    # isLoading, isDisabled
        if thing.is_array:
            return plural(noun)                    # users, habits
        return camelCase(noun)                     # userId, inputValue
    
    if thing.type == 'constant':
        return SCREAMING_SNAKE_CASE               # API_BASE, MAX_ITEMS
    
    if thing.type == 'css_class':
        return kebab-case                         # habit-row, day-cell
    
    if thing.type == 'file':
        if contains_component:
            return PascalCase                     # TodoPage.tsx
        else:
            return camelCase                      # api.ts, types.ts
```

## 4.3 Refactoring Decision Algorithm

```
WHEN TO REFACTOR:

1. Rule of Three
   ├── First time: Just write it
   ├── Second time: Note the duplication
   └── Third time: Refactor (extract common code)

2. Readability Threshold
   └── If you need to read it twice to understand → Refactor

3. Function Length
   └── If > 30 lines → Consider breaking up

4. Nesting Depth
   └── If > 3 levels of nesting → Flatten with early returns

REFACTORING PATTERNS:

┌────────────────────────────────────────────────────────────────┐
│ Smell                     │ Refactoring                        │
├────────────────────────────────────────────────────────────────┤
│ Long function             │ Extract smaller functions          │
│ Repeated code             │ Extract shared function            │
│ Magic numbers             │ Extract to named constants         │
│ Deep nesting              │ Early returns, guard clauses       │
│ Large component           │ Split into smaller components      │
│ Prop drilling             │ Use Context or composition         │
│ Complex state             │ Use reducer or extract hook        │
└────────────────────────────────────────────────────────────────┘
```

---

# PART 5: ARCHITECTURE PATTERNS

## 5.1 Feature Structure

Every feature should follow this structure:

```
src/pages/[FeatureName]/
├── index.ts           # Re-export (1 line)
├── types.ts           # TypeScript interfaces
├── [FeatureName].tsx  # Main component
├── [FeatureName].css  # Styles
├── api.ts             # API calls (if needed)
├── hooks.ts           # Custom hooks (if needed)
└── utils.ts           # Helper functions (if needed)
```

## 5.2 Component Composition Pattern

```typescript
// THE COMPOSITION PATTERN
// Build complex UIs from simple, reusable pieces

// Level 1: Atomic (smallest pieces)
const Button = ({ children, onClick }) => (
    <button className="btn" onClick={onClick}>{children}</button>
);

// Level 2: Molecular (combine atoms)
const SearchInput = ({ value, onChange, onSearch }) => (
    <div className="search-input">
        <Input value={value} onChange={onChange} />
        <Button onClick={onSearch}>Search</Button>
    </div>
);

// Level 3: Organism (feature-complete sections)
const SearchableList = ({ items, onSelect }) => {
    const [query, setQuery] = useState('');
    const filtered = items.filter(i => i.name.includes(query));
    
    return (
        <div className="searchable-list">
            <SearchInput value={query} onChange={setQuery} />
            <List items={filtered} onSelect={onSelect} />
        </div>
    );
};

// Level 4: Page (combine organisms)
const UsersPage = () => (
    <Page>
        <Header title="Users" />
        <SearchableList items={users} onSelect={handleSelect} />
    </Page>
);
```

## 5.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐         ┌─────────┐         ┌─────────┐          │
│   │ Backend │ ◄─────► │   API   │ ◄─────► │  State  │          │
│   │  (PHP)  │  HTTP   │  Layer  │  fetch  │ (React) │          │
│   └─────────┘         └─────────┘         └────┬────┘          │
│                                                 │               │
│                                                 ▼               │
│                                           ┌─────────┐          │
│                                           │   UI    │          │
│                                           │ (JSX)   │          │
│                                           └────┬────┘          │
│                                                 │               │
│                                                 ▼               │
│                                           ┌─────────┐          │
│                                           │  User   │          │
│                                           │ Events  │          │
│                                           └────┬────┘          │
│                                                 │               │
│                                    ┌────────────┘               │
│                                    ▼                            │
│                              ┌──────────┐                       │
│                              │ Handlers │ ─────► State Update   │
│                              └──────────┘        (optimistic)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

RULES:
1. Data flows DOWN (parent → child via props)
2. Events flow UP (child → parent via callbacks)
3. API calls happen in response to events
4. State updates trigger re-renders
5. Optimistic updates for perceived speed
```

---

# PART 6: DEBUGGING ALGORITHMS

## 6.1 The Scientific Debugging Method

```
STEP 1: OBSERVE
├── What is the exact error message?
├── When does it happen? (always, sometimes, specific action?)
├── What was the last change before it broke?
└── Can it be reproduced consistently?

STEP 2: HYPOTHESIZE
├── Based on error, what could cause it?
├── List 3 most likely causes
└── Order by probability

STEP 3: EXPERIMENT
├── Test most likely hypothesis first
├── Make ONE change at a time
├── Verify if problem is fixed
└── If not, restore and try next hypothesis

STEP 4: ANALYZE
├── Why did it break?
├── How can we prevent similar bugs?
└── Should we add validation/tests?
```

## 6.2 Common Bug Patterns

```
BUG: Component not updating when state changes
CAUSE: Mutating state instead of creating new object
FIX: 
  ❌ state.items.push(newItem)
  ✅ setState([...state.items, newItem])

BUG: Stale closure (old value in callback)
CAUSE: Callback captures old state value
FIX: Use functional update or add to dependency array
  ❌ onClick={() => setCount(count + 1)}  // stale if called rapidly
  ✅ onClick={() => setCount(c => c + 1)} // always current

BUG: Infinite re-render loop
CAUSE: Effect updating its own dependency
FIX: Review effect dependencies, use refs for non-reactive values

BUG: Memory leak warning
CAUSE: Setting state after component unmounts
FIX: Cancel async operations in cleanup function

BUG: "Cannot read property of undefined"
CAUSE: Accessing nested property before data loads
FIX: Use optional chaining: obj?.prop?.nested
```

## 6.3 Console Debugging Strategy

```javascript
// LEVEL 1: Simple log (what is the value?)
console.log('userId:', userId);

// LEVEL 2: State snapshot (what's the full state?)
console.log('Full state:', JSON.stringify(state, null, 2));

// LEVEL 3: Trace (how did we get here?)
console.trace('handleClick called');

// LEVEL 4: Conditional (only log in specific case)
if (userId === 12345) {
    debugger;  // Pause execution here
}

// LEVEL 5: Performance (how long does it take?)
console.time('render');
// ... code ...
console.timeEnd('render');  // Outputs: render: 12.345ms

// CLEANUP: Remove all debug logs before commit!
```

---

# PART 7: QUICK REFERENCE

## 7.1 Command Cheatsheet

```bash
npm run dev          # Start development server
npm run dev:https    # Start with HTTPS (for Telegram testing)
npm run build        # Build for production
npm run deploy       # Deploy to GitHub Pages
npm run lint         # Check for code issues
npm run lint:fix     # Auto-fix code issues
```

## 7.2 Project Structure

```
src/
├── index.tsx           # Entry point (don't modify)
├── index.css           # Global styles
├── init.ts             # Telegram SDK initialization
├── mockEnv.ts          # Mock environment for browser testing
├── components/         # Shared components
│   ├── App.tsx         # Main app with routing
│   └── Page.tsx        # Page wrapper
├── navigation/
│   └── routes.tsx      # Route definitions
└── pages/              # Each page is a folder
    └── [PageName]/
        ├── index.ts    # export { PageName }
        ├── types.ts    # TypeScript interfaces
        ├── api.ts      # API functions
        ├── [Name].tsx  # Component
        └── [Name].css  # Styles
```

## 7.3 File Templates

See CHEATSHEET.md for copy-paste templates.

---

# PART 8: FINAL PRINCIPLES

## 8.1 The Hierarchy of Concerns

When making decisions, prioritize in this order:

```
1. CORRECTNESS  - Does it work correctly?
2. CLARITY      - Can others understand it?
3. SIMPLICITY   - Is it as simple as possible?
4. PERFORMANCE  - Is it fast enough?
5. ELEGANCE     - Is it beautiful code?

NEVER sacrifice higher priority for lower.
A fast but buggy solution is WRONG.
An elegant but confusing solution is WRONG.
```

## 8.2 The Laws of Software

```
LAW 1: Gall's Law
  "A complex system that works evolved from a simple system that worked."
  → Start simple. Add complexity only when proven necessary.

LAW 2: Conway's Law
  "Systems mirror the communication structure of organizations."
  → Keep component boundaries clear and communication explicit.

LAW 3: Postel's Law
  "Be conservative in what you send, liberal in what you accept."
  → Validate all inputs. Handle edge cases gracefully.

LAW 4: Hyrum's Law
  "With enough users, any observable behavior becomes depended upon."
  → Be careful what behaviors you expose. They become contracts.

LAW 5: Murphy's Law
  "Anything that can go wrong will go wrong."
  → Handle all error cases. Don't assume happy path.
```

## 8.3 The Ultimate Checklist

Before saying "done":

```
□ Feature works as requested
□ Edge cases handled (empty, error, loading)
□ No TypeScript errors
□ No console errors
□ Styles match design intent
□ Works on mobile viewport
□ Existing features still work
□ Code is readable and maintainable
```

---

*Guide Version: 4.0 | Advanced Reasoning Edition | 2026-02-03*

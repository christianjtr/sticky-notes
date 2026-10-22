# 📝 Basic Sticky Notes

A sticky notes board built with React and TypeScript using Vite. Notes are created, moved, resized and deleted on a free canvas, and everything is persisted in the browser.

## 🕹️ Technologies

- **React 19**: concurrent features, with the React Compiler enabled for automatic memoization
- **TypeScript**: strict mode, `noUnusedLocals`, `verbatimModuleSyntax`
- **Vite**: build tool and development server
- **HTML5 Drag and Drop API**: native drag interactions for the desktop
- **Pointer Events**: resizing and touch dragging
- **CSS Modules**: scoped styling, with a shared design token layer in CSS custom properties
- **Vitest + Testing Library**: unit and component tests
- **ESLint**: linting
- **LocalStorage API**: client side data persistence

## Getting Started

```bash
pnpm install
pnpm dev
```

Open the browser on the printed localhost URL.

### Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Type check and build the production bundle |
| `pnpm preview` | Serve the production bundle locally |
| `pnpm lint` | Run ESLint over the project |
| `pnpm typecheck` | Run the TypeScript compiler without emitting |
| `pnpm test` | Run the test suite once |
| `pnpm test:watch` | Run the test suite in watch mode |
| `pnpm test:coverage` | Run the test suite with a coverage report |
| `pnpm validate` | Lint, typecheck, test and build in one go |

## 👀 Samples

##### Live demo

[GitHub pages project](https://christianjtr.github.io/sticky-notes/)

##### Preview

<p align="center">
    <img src="https://github.com/christianjtr/sticky-notes/blob/main/samples/sticky-notes-board.gif" alt="gif-demo"/>
</p>

## 👨‍🏫 Architecture

The application is organised in layers that only depend on the layer below. `types` holds the domain model (`Note`, `Position`, `Size`, `BoardBounds`), `constants` and `utils` hold the pure logic, `services` is the only place that talks to the outside world (`localStorage`), `hooks` own the stateful behaviour and `components` render the result. Components never touch the storage or the browser APIs directly, they receive data and callbacks through props, which keeps them trivial to render in isolation in the tests. Path aliases (`@app-types`, `@hooks`, `@services`, `@styles`, `@utils`, `@constants`) are declared once in `tsconfig.app.json` and mirrored in `vite.config.ts`, so the source layout is independent of the build tool.

State lives in a single `Map` inside the `useBoard` hook, keyed by the note id and kept in insertion order. The hook exposes a deliberately small API: `addNote`, `updateNote`, `deleteNote` and `bringToFront`. `updateNote` takes a patch instead of a whole note, so an update can never drop a field that was written concurrently, and it is the only place that clamps a position against the measured board bounds. Persistence is debounced by 500 ms to avoid writing on every keystroke, and pending changes are flushed on `pagehide` and on `visibilitychange`, so closing the tab right after typing no longer discards the last edit. The payload that is read back is validated against the domain model, so a corrupted or outdated entry can never break the board.

Interaction logic is split by concern. `useBoardDragAndDrop` owns the HTML5 drag lifecycle and keeps the point the user grabbed the note by, so a note no longer jumps when it is dropped. `useNoteResize` owns the pointer and keyboard driven resizing, and always derives the new size from the position the gesture started at, which keeps the note from drifting. `useBoardBounds` measures the canvas with a `ResizeObserver` so that notes spawn across the whole board and can never be pushed underneath the toolbar or off screen. The `Note` component itself stays presentational: it renders a textarea, a resize handle and a delete button, and translates user input into calls on the hooks above.

## 🚀 Features

- Create notes with a random colour and a random position across the board
- Move notes by dragging, keeping the grab point, clamped to the board
- Resize notes by dragging the bottom right corner, or with the arrow keys
- Edit note text with automatic persistence
- Bring a note to the front when it is focused or interacted with
- Delete notes by dragging them over the trash zone, with the delete button, or with the keyboard
- Automatic persistence to `localStorage`, flushed when the tab is closed
- Full keyboard navigation: arrow keys move a note, shift plus arrow moves it further
- Screen reader support with readable labels, live announcements and focus management
- Responsive design for different screen sizes

## 🧪 Testing

The suite runs on Vitest with jsdom and covers the pure logic, the hooks and the components.

```bash
pnpm test
```

| Suite | Focus |
| --- | --- |
| `src/utils/__tests__` | Board maths, drop positioning and storage validation |
| `src/hooks/__tests__` | State, persistence, drag and drop, resizing and measurement |
| `src/components/__tests__` | Note, board, toolbar and trash zone behaviour |

The keyboard regression tests are the important ones: they pin the behaviour that separates a note from its textarea, so that pressing `Backspace` inside a note can never delete the note again.

## 📚 Topics Covered

### React Development

- **Hooks**: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef` and custom hooks
- **Component Composition**: building a complex UI from small components
- **Event Handling**: drag, pointer, touch and keyboard events

### TypeScript

- **Type Definitions**: interfaces for the domain model and the props
- **Type Safety**: `strict` mode plus a runtime validation layer at the storage boundary
- **Discriminated unions** for the patch API of the board state

### Web APIs

- **HTML5 Drag and Drop**: native drag with a custom payload
- **Pointer Events**: cross device resizing
- **LocalStorage**: debounced persistence with an unload flush
- **ResizeObserver**: measurement of the usable canvas
- **CSS Transforms**: hardware accelerated movement

### Accessibility

- **Keyboard Navigation**: arrow keys for movement and resizing
- **Screen Reader Support**: readable labels instead of raw ids, live announcements
- **Focus Management**: visible focus indicators and focusable controls
- **Semantic HTML**: landmarks, headings and a labelled live region

### Browser Compatibility

- **Cross-browser Support**: HTML5 drag with a Firefox friendly payload
- **Safari and Firefox specifics**: the resize and drag interactions avoid vendor specific APIs
- **Responsive**: the board follows the viewport size

## 📦 Deployment

The production build accepts a `BASE_PATH` environment variable, so the same bundle can be published at the root of a domain or under a sub path such as `https://<user>.github.io/sticky-notes/`.

```bash
BASE_PATH=/sticky-notes/ pnpm build
```

The `Deploy` workflow publishes the build to the `demo` branch, which is what GitHub Pages serves.

## ⚠️ Areas for Improvement

- Notes are stored as a single `localStorage` entry, which does not scale to thousands of notes
- Touch dragging works, but the board is designed for a mouse and a pointer
- The undo history is not implemented yet
- There is no end to end test running in a real browser

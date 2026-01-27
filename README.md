# Basic Sticky Notes

This is a simple sticky notes application built with React and TypeScript using Vite. It provides a clean, interactive workspace for creating, editing, and organizing virtual sticky notes on a digital board.

## 🕹️ Technologies

- **React 19**: Latest version with concurrent features and improved performance
- **TypeScript**: Strong typing for better code quality and developer experience
- **Vite**: Fast build tool and development server
- **HTML5 Drag and Drop API**: Native browser API for smooth drag interactions
- **CSS Modules**: Scoped styling to prevent CSS conflicts
- **ESLint**: Code linting and formatting
- **LocalStorage API**: Client-side data persistence

## Getting Started

```bash
pnpm install
pnpm dev
```

Open your browser to the provided localhost URL to start using the app.

## 👀 Samples

##### Preview

<p align="center">
    <img src="https://github.com/christianjtr/sticky-notes/blob/main/samples/sticky-notes-board.gif" alt="gif-demo"/>
</p>

## 👨‍🏫 Architecture

The application follows a modular, component-based architecture with clear separation of concerns. State management is handled through custom React hooks, promoting reusability and testability.

### Component Structure

- **App**: Root component managing global state and persistence
- **Board**: Main workspace container with drag-and-drop handling
- **Note**: Individual note component with editing and interaction capabilities
- **Toolbar**: UI controls for note creation
- **TrashZone**: Deletion area with visual feedback

### State Management

- **useBoard Hook**: Manages notes collection, CRUD operations, and localStorage persistence
- **useBoardDragAndDrop Hook**: Handles drag-and-drop logic for moving and deleting notes
- **Component State**: Local state for UI interactions (editing, resizing)

### Key Design Patterns

- **Custom Hooks**: Encapsulate complex logic (drag handling, state management)
- **Compound Components**: Modular component composition
- **TypeScript Interfaces**: Strong typing for data structures and props
- **CSS Modules**: Scoped and maintainable styling

## 🚀 Features

- Create new notes with random colors and positions
- Drag notes around the board using HTML5 Drag API
- Resize notes by dragging the bottom-right corner
- Edit note text with auto-save
- Bring notes to front on interaction (z-index management)
- Delete notes by dragging over the trash zone
- Automatic persistence to localStorage
- Full keyboard navigation (arrow keys to move notes)
- Screen reader accessibility with ARIA labels and live regions
- Focus management with visual indicators
- Responsive design for different screen sizes

## 📚 Topics Covered

This project demonstrates modern web development practices and covers several important topics:

### React Development

- **Hooks**: useState, useEffect, custom hooks
- **Component Composition**: Building complex UIs from smaller components
- **Event Handling**: Pointer events, drag events, keyboard events
- **State Management**: Local and global state patterns

### TypeScript

- **Type Definitions**: Interfaces for props and data structures
- **Generic Types**: Reusable component and hook types
- **Type Safety**: Preventing runtime errors through compile-time checks

### Web APIs

- **HTML5 Drag and Drop**: Native browser drag functionality
- **Pointer Events**: Cross-device input handling
- **LocalStorage**: Client-side data persistence
- **CSS Transforms**: Hardware-accelerated animations

### Accessibility

- **Keyboard Navigation**: Arrow keys for note movement
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Proper tab order and focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Performance

- **Virtual DOM**: React's efficient rendering
- **Event Optimization**: Debounced updates and efficient event handling
- **CSS Performance**: Hardware acceleration with transforms

### Browser Compatibility

- **Cross-browser Support**: HTML5 APIs with fallbacks
- **Mobile Responsiveness**: Touch and pointer event handling
- **Safari-specific Fixes**: Addressing browser quirks

## ⚠️ Areas for Improvement

###### Browser Compatibility

- Node.js version warning (22.11.0 vs required 22.12+)
- Safari-specific drag handling could be enhanced
- Touch/mobile responsiveness could be improved

###### Performance Optimizations

- Large React bundle (63.88 kB gzipped) due to React 19
- Could implement virtualization for many notes
- Event debouncing for rapid interactions

###### Testing Coverage

- No unit tests implemented
- E2E tests missing
- Accessibility testing not automated

# Gwent-Like Card Game Engine

A modern, browser-based, **Gwent-inspired card game engine** written in TypeScript and React.  
This project provides a flexible foundation for building and playing Gwent-like card games directly in your browser, with support for custom cards, effects, AI, and more.

---

## Features

- ⚔️ **Gwent-Inspired Gameplay**: Row-based battlefield, card abilities, and round-based scoring.
- 🃏 **Customizable Card Library**: Easily define new cards, effects, statuses, and abilities.
- 🤖 **AI & Human Players**: Play against AI, scripted bots, or another human.
- 🖥️ **Modern Web UI**: Built with React for a responsive, interactive experience.
- 🔄 **Token & Unit Generation**: Supports spawning tokens and units with special effects.
- 🛠️ **Extensible Engine**: Designed for modding and custom rulesets.
- 🔍 **TypeScript Strong Typing**: Ensures reliability and ease of extension.

---

## Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/gwent-like.git
cd gwent-like
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Start the Development Server**

```bash
npm run dev
```

This will launch the game in your default browser at [http://localhost:3000](http://localhost:3000).

---

## How to Play

- Drag and drop cards from your hand onto the battlefield.
- Activate abilities and target enemy or friendly units as described on each card.
- The game supports both AI and human players; you can configure controllers in the code.
- Rounds are scored based on the total power of units on each side.

---

## Project Structure

- **/src/core/**: Game engine logic, card definitions, state management, and helpers.
- **/src/ui/**: React components for the game board, hand, rows, and controls.
- **/src/controllers/**: AI and scripted player logic.
- **/src/cli/**: Entry point and game loop.

---

## Customization

- **Add new cards**: Edit `/src/core/cards.ts` to define new cards, abilities, and effects.
- **Modify rules**: Tweak constants and engine logic in `/src/core/`.
- **Create new AI**: Implement new controllers in `/src/controllers/`.

---

## SEO Keywords

Gwent card game engine, browser card game, TypeScript card game, React card game, Gwent clone, digital card game engine, open source Gwent, web-based card game, modding card game engine, Gwent-like game

---

## License

MIT License

---

## Contributing

Pull requests and suggestions are welcome! Please open an issue or submit a PR to help improve the engine.

---

**Build your own Gwent-inspired card game in the browser with this flexible, modern engine!**
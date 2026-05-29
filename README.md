# 🎵 Quinteur

Interactive music theory exercise to practice fifths.

## Features

- Random questions on fifths (ascending/descending)

### Prerequisites

- Node.js and npm installed
- A local HTTP server (Python or Node.js)

### Installation and quick start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Compile TypeScript**
   ```bash
   npm run build
   ```

3. **Start local server**

   Option 1 - With Python 3 (recommended if already installed):
   ```bash
   python3 -m http.server 8000
   ```

   Option 2 - With Node.js http-server:
   ```bash
   npx http-server -p 8000
   ```

4. **Open in browser**

   Visit: `http://localhost:8000`

### Development mode with automatic recompilation

For more comfortable development, start compilation in watch mode in one terminal:

```bash
npm run watch
```

Then in a second terminal, start the HTTP server (see step 3 above).

With each modification to the TypeScript code, it will be automatically recompiled. Simply refresh your browser to see the changes.

### Available commands

- `npm run build` - Compile TypeScript once
- `npm run watch` - Compile continuously (watch mode)
- `npm run clean` - Remove compiled files

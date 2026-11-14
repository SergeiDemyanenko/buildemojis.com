# Build an Emoji — [buildemojis.com](https://buildemojis.com/)

[![Play Build an Emoji](public/image/og-preview.png)](https://buildemojis.com/)

**Build an Emoji** is an interactive, zero-dependency browser puzzle game where you drag and drop scattered typographic character pieces across the canvas to assemble classic text emoticons and Japanese kaomoji (such as `:)`, `¯\_(ツ)_/¯`, and `(╯°□°)╯︵┻┻`).

Inspired by the quirky web toy [buildshruggie.com](https://buildshruggie.com/).

---

## 🎮 How to Play

1. Open **[https://buildemojis.com/](https://buildemojis.com/)**.
2. Check the target emoticon name in the top navigation bar (e.g., **Smile**, **Rose**, **Shrug**, **Table flip**).
3. **Drag and drop** character pieces using a mouse, trackpad, touchscreen, or keyboard into the central assembly zone.
4. Pieces subtly illuminate with a green proximity glow when correctly positioned; once all pieces are aligned within tolerance, they automatically snap into place!
5. **Interactive Controls:**
   - **Previous / Next (`«` / `»`) & Level Picker:** Navigate through all 16 levels grouped by difficulty (`Easy`, `Medium`, `Hard`, `Extreme`).
   - **Outline (`O`):** Toggle a faint silhouette hint inside the assembly zone.
   - **Reset (`R`):** Scatter character pieces across the screen from their current locations.
   - **Robot (`Do it for me`):** Automatically assemble the current emoticon.
   - **Dark Mode (`D`):** Toggle between Light and Dark themes (persisted in `localStorage` with OS `prefers-color-scheme` support).
   - **Shortcuts (`[⌨]` or `?`):** Open the interactive keyboard shortcuts cheat sheet.
   - **Copy / Copy Link:** Copy the assembled emoticon text or a shareable `?smile=<id>&done` showcase link.

### ⌨️ Keyboard Controls

| Key | Action |
| :--- | :--- |
| `Tab` / `Shift+Tab` | Focus and cycle between pieces on canvas |
| `Arrow Keys` | Nudge selected piece by **8px** |
| `Shift + Arrow Keys` | Fast nudge selected piece by **28px** |
| `[` / `]` | Previous / Next level |
| `R` | Reset and scatter pieces |
| `O` | Toggle Outline hint |
| `D` | Toggle Dark / Light theme |
| `?` or `Shift+/` | Toggle Keyboard Shortcuts popover |
| `Esc` | Close popover or deselect current piece |

### ⭐ 3-Star Rating System

- **★★★ (3 Stars):** Solved manually without hints.
- **★★☆ (2 Stars):** Solved with Outline assistance enabled.
- **★☆☆ (1 Star):** Assembled with Robot ("Do it for me").
- Solved emoticons and earned star ratings are automatically saved in `localStorage` and displayed in the level picker.

### 🔗 URL Parameters

- `?smile=<id>` — Load a specific emoticon puzzle (e.g. [`?smile=shrug`](https://buildemojis.com/?smile=shrug)).
- `?smile=<id>&done` — Open a puzzle in its completed state (e.g. [`?smile=shrug&done`](https://buildemojis.com/?smile=shrug&done)).

---

## 🧩 Playable Emoticons & Kaomoji (16 Levels)

| # | ID (`?smile=`) | Title | Category | Emoticon / Kaomoji | Pieces | Play Link |
| :-: | :--- | :--- | :--- | :---: | :-: | :--- |
| 1 | `smile` | Smile | Easy | `:)` | 2 | [Play](https://buildemojis.com/?smile=smile) |
| 2 | `laughing` | Laughing | Easy | `:D` | 2 | [Play](https://buildemojis.com/?smile=laughing) |
| 3 | `tears_of_happiness` | Tears of happiness | Easy | `:')` | 3 | [Play](https://buildemojis.com/?smile=tears_of_happiness) |
| 4 | `surprise` | Surprise | Easy | `:-O` | 3 | [Play](https://buildemojis.com/?smile=surprise) |
| 5 | `kiss` | Kiss | Easy | `:-*` | 3 | [Play](https://buildemojis.com/?smile=kiss) |
| 6 | `wink` | Wink | Easy | `; -)` | 3 | [Play](https://buildemojis.com/?smile=wink) |
| 7 | `tongue_sticking_out` | Tongue sticking out | Easy | `:-P` | 3 | [Play](https://buildemojis.com/?smile=tongue_sticking_out) |
| 8 | `angel` | Angel | Easy | `O:-)` | 4 | [Play](https://buildemojis.com/?smile=angel) |
| 9 | `evil` | Evil | Medium | `>:-)` | 4 | [Play](https://buildemojis.com/?smile=evil) |
| 10 | `rose` | Rose | Medium | `@}->--` | 6 | [Play](https://buildemojis.com/?smile=rose) |
| 11 | `shock` | Shock | Medium | `(O_O)` | 5 | [Play](https://buildemojis.com/?smile=shock) |
| 12 | `troubled` | Troubled | Medium | `(>_<)` | 5 | [Play](https://buildemojis.com/?smile=troubled) |
| 13 | `excited` | Excited | Hard | `\(^o^)/` | 7 | [Play](https://buildemojis.com/?smile=excited) |
| 14 | `worried` | Worried | Hard | `(-_-メ)` | 6 | [Play](https://buildemojis.com/?smile=worried) |
| 15 | `shrug` | Shrug | Extreme | `¯\_(ツ)_/¯` | 9 | [Play](https://buildemojis.com/?smile=shrug) |
| 16 | `table_flip` | Table flip | Extreme | `(╯°□°)╯︵┻┻` | 10 | [Play](https://buildemojis.com/?smile=table_flip) |

---

## 🛠️ Tech Stack & Project Structure

The project is built with **zero external runtime dependencies** using modern Vanilla JavaScript (`Pointer Events API`, `Web Animations API`, `History API`), semantic HTML5, and CSS3.

All deployable web assets live inside [`public/`](public/), ensuring that repo configuration and tests are never exposed on the production domain.

```text
buildemojis.com/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # Automated test runner on PR & push
│   │   └── deploy.yml           # Deploys ./public to GitHub Pages on push to main
│   └── CODEOWNERS               # Code ownership definitions
├── public/                      # Production web root deployed to buildemojis.com
│   ├── css/
│   │   └── styles.css           # Theme variables, responsive layout & piece animations
│   ├── image/
│   │   ├── apple-touch-icon.png # 180x180 iOS/Android home screen icon
│   │   ├── favicon.svg          # Vector browser favicon
│   │   ├── next.svg             # Vector navigation icon
│   │   ├── og-preview.png       # 1200x630 Open Graph preview banner
│   │   └── robot.svg            # Vector robot hint icon
│   ├── js/
│   │   ├── data.js              # Clean emoticon level definitions
│   │   └── script.js            # Game engine, drag-and-drop, rating, SPA navigation & theme
│   ├── CNAME                    # Custom domain configuration (buildemojis.com)
│   ├── favicon.ico              # Multi-size legacy ICO favicon
│   ├── index.html               # Main entry point (JSON-LD Schema & Open Graph tags)
│   ├── llms.txt                 # AI / LLM crawler manifest (GEO)
│   ├── robots.txt               # Search engine crawler policies
│   ├── sitemap.xml              # XML Sitemap for all 16 emoticon levels
│   └── site.webmanifest         # Progressive Web App manifest
├── tests/
│   └── test.js                  # Comprehensive zero-dependency Node.js test suite
├── .gitignore
├── LICENSE.txt
└── README.md
```

---

## 🚀 Running Locally & Testing

### Run the Game Locally
Since the project uses pure static files with zero build step required, you can open `public/index.html` directly in any modern browser or serve the `public/` directory with any static HTTP server:

```bash
npx serve public
# or
python -m http.server 8080 --directory public
```

### Run Automated Tests
The repository includes a built-in zero-dependency test suite (`tests/test.js`) that validates JavaScript syntax, level definitions in `public/js/data.js`, Pointer Events drag-and-drop mechanics, puzzle completion logic, `public/` deployment isolation, SVG/PNG assets, and SEO/GEO metadata:

```bash
node tests/test.js
```

---

## ➕ Adding a New Emoji

To add a new emoticon level, add a new entry to the `data` object in [`public/js/data.js`](public/js/data.js):

```javascript
my_emoji: {
    title: 'My Emoji',
    model: [
        { character: ':' },
        { character: '-' },
        { character: ')' }
    ]
}
```

- Each character piece is automatically measured and padded by `measureGlyphBox` at runtime.
- For glyphs with non-standard vertical metrics (e.g. `_` or `︵`), you can provide an optional `itemStyleFix: { top: 0.1 }` ratio to fine-tune vertical alignment.

---

## 👤 Author & License

- **Author:** [Sergey Demyanenko](https://www.linkedin.com/in/sergey-demyanenko/) ([GitHub](https://github.com/SergeiDemyanenko))
- **License:** Licensed under the [MIT License](LICENSE.txt).

GRIZZLY RAPIDS — V5 BEAR & WOLF POWER-UPS
Naches Learning Hub · November 2026

QUICK SETUP (NO CODE EDITING REQUIRED)
1. Open Grizzly_Rapids_V5_Update_Builder.html in Chrome or Edge.
2. Click "Build my updated index.html".
   - This retrieves the public index.html from:
     https://raw.githubusercontent.com/jkramer-cloud/grizzly-rapids/main/index.html
   - If retrieval fails, click "Or choose my current index.html" and select a copy
     of the latest index.html from your existing grizzly-rapids GitHub repository.
3. Your browser downloads a new index.html.
4. In GitHub, open the grizzly-rapids repository. Back up the existing index.html,
   then upload the downloaded index.html to the repository root, replacing it.
5. Commit changes and reload:
   https://jkramer-cloud.github.io/grizzly-rapids/
   Press Ctrl+Shift+R to avoid a cached version.
6. No changes to the Naches Learning Hub repository are required.

FEATURES
- Tab: Bear Rescue. Animated grizzly catches one selected fish, or the
  most urgent fish if none is selected. Starts with 1 rescue in rivers 1-2,
  2 rescues in rivers 3-6. Up to 3 held. Earn 1 every 5 fully typed words.
- Enter: Wolf Pack. Six animated wolves run from both banks and catch all
  fish currently visible. Unlocks in river 3; starts with 1 in rivers 3-6.
  Up to 2 held. Earn 1 every 12 fully typed words (from river 3 onward).
- Rescues count toward fish caught/river goal but do not falsely inflate
  typed characters, accuracy, or words-per-minute.
- Animated splashes and synthesized sound effects honor the existing
  Effects On/Off setting. Music controls remain intact.
- Corrects accidental spacecraft artwork and text from earlier game builds.
- Preserves the complete existing source, six levels, vocabulary categories,
  grade selection, word shuffling, saved records and local browser progress.

FALLBACK
An advanced user can insert grizzly_powerups_v5.js as an inline <script>
BEFORE the closing </body> of the current game, AFTER its original script.
Do not use an external script reference unless the .js file is also published.

QUALITY CHECKS
A simulated browser run verified the builder's generated HTML, both button
and keyboard power-ups, caught count vs. typing stats, supply replenishment,
and target speed recovery when pausing during an animation. The current live
GitHub game source was examined, but the deployed version was not directly
modified and its complete runtime was not independently exercised here.

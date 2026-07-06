# Putt-Putt! — Google Play Store Listing

## App title (max 30 characters — this is 29 ✓)

```
Putt-Putt! ⛳ Family Scorecard
```

## Short description (max 80 characters — this is 78 ✓)

```
Mini golf scoring made magic — leaderboards, fireworks & the Wooden Spoon! ⛳🎉
```

## Full description (max 4000 characters — this is ~1700 ✓)

```
⛳ Grab your putters — Putt-Putt! turns every mini golf round into a proper family event! 🎉

No more soggy paper scorecards and broken pencils 📝❌ — just big friendly buttons, automatic maths, and celebrations the whole family will demand at every hole 🥳

🌈 SET UP IN SECONDS
⛳ 9 to 30 holes — Quick 9 ⚡, Classic 18, Marathon 27 🏃, or the Full 30 🔥
👨‍👩‍👧‍👦 Unlimited players — everyone gets their own emoji and colour 🦄🦁🦖🦩
⚡ Quick-add your regulars — the app remembers the whole crew

🏆 PLAY LIKE A PRO
👍 Massive +/− buttons — score with one thumb
🥇 Live leaderboard that updates after every single putt
⭐ Hole-in-one? Sparkle explosion + ACE badge 🎆
💰 Skins mode — win the hole outright, win the point (ties carry over 🔥)
🕳️ Set par per hole and track over/under like the pros
📖 Rules built right in — "honours", the 6-stroke limit, the wall rule and more

🎊 FINISH IN STYLE
🍾 Full-screen CHAMPION! announcement with non-stop fireworks 🎆🥂
🥄 The Wooden Spoon award for last place (tissues provided 🧻😭)
🏅 Fun awards — Most 7s 😅, Comeback of the Day 📈, Windmill Victim 🌀
📸 Share the podium as a picture straight to the family group chat 💬

📊 BRAG FOREVER
💾 Every tap saved automatically — close the app mid-game and pick up exactly where you left off
📜 Full game history with tappable scorecards from every past round
🏆 All-time family stats: games played, wins, best round, and total holes-in-one ⭐

Free, no ads, no account, works completely offline. Just putt! 🏌️‍♀️

The windmill is rigged for everyone equally 🌀😄
```

## Graphic assets (all generated, ready to upload)

| Play Console slot | File | Size | Spec |
|---|---|---|---|
| App icon | `assets/play-icon-512.png` | 512×512 | PNG, ≤1 MB ✓ |
| Feature graphic | `store/feature-graphic-1024x500.png` | 1024×500 | PNG/JPG ✓ |
| Phone screenshot 1 | `store/screenshots/01-setup.png` | 1080×2340 | Player setup with emoji crew |
| Phone screenshot 2 | `store/screenshots/02-game.png` | 1080×2340 | Scoring + live leaderboard + skins |
| Phone screenshot 3 | `store/screenshots/03-results.png` | 1080×2340 | Podium + fun awards |
| Phone screenshot 4 | `store/screenshots/04-champion.png` | 1080×2340 | CHAMPION! + Wooden Spoon overlay |
| Phone screenshot 5 | `store/screenshots/05-stats.png` | 1080×2340 | Family stats + game history |
| Phone screenshot 6 | `store/screenshots/06-rules.png` | 1080×2340 | Built-in rules page |

Play Console also asks for:
- **Category:** Sports (or Casual)
- **Content rating questionnaire:** no ads, no user content, no data collected → rated Everyone
- **Privacy policy:** ready to host at `store/privacy-policy.html` — upload it anywhere public (GitHub Pages, Google Sites, or a folder on vvd.co.za) and paste that URL into the Play Console field. Update the effective date if you edit it.

## Regenerating the images

- Icon + splash sources: `node tools/gen-assets.js` (writes to `assets/`)
- Feature graphic: edit `store/feature.html`, then capture with headless Edge at 1024×500
- Screenshots: start the preview server (`.claude/launch.json`, port 8321) and capture
  `http://localhost:8321/?demo=setup|game|results|champion|stats|rules`
  with headless Edge at `--window-size=540,1170 --force-device-scale-factor=2`
  (the `?demo=` modes seed pretend data and never trigger in the packaged app)

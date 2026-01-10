# Local Logo Migration Guide

This guide outlines the process for migrating team logos from external URLs to local storage, served directly by our Render server.

## 1. Directory Structure

The following directories have been created in `frontend/public/logos/`. Place your `.png` files here.

```
frontend/public/logos/
  ├── premier-league/   (e.g., arsenal.png)
  ├── la-liga/          (e.g., real-madrid.png)
  ├── bundesliga/       (e.g., bayern-munich.png)
  ├── serie-a/          (e.g., juventus.png)
  ├── ligue-1/          (e.g., psg.png)
  └── mls/              (e.g., inter-miami.png)
```

## 2. Naming Standard
- **Format**: Lowercase, hyphen-separated (kebab-case).
- **Extension**: `.png`
- **Dimensions**: At least 200x200px.
- **Background**: Transparent.

## 3. Implementation Workflow

### Step A: Download & Name Logos
Download logos for all teams (see list below) and place them in the correct folders locally.

### Step B: Push to GitHub/Render
Use the deploy script or git commands to push the new files.
```bash
./deploy.sh "chore: Add team logos"
```
Once deployed, Render will automatically serve these files.
**Test URL**: `https://www.sportsprophecyapp.com/logos/premier-league/arsenal.png`

### Step C: Update Database
Run the provided SQL script (`backend/src/scripts/update_logos.sql`) to link the teams to these new URLs.

## 4. Team List & Filenames

### Premier League (`/premier-league/`)
| Team Name | Filename |
| :--- | :--- |
| Arsenal | `arsenal.png` |
| Aston Villa | `aston-villa.png` |
| Bournemouth | `bournemouth.png` |
| Brentford | `brentford.png` |
| Brighton | `brighton.png` |
| Chelsea | `chelsea.png` |
| Crystal Palace | `crystal-palace.png` |
| Everton | `everton.png` |
| Fulham | `fulham.png` |
| Liverpool | `liverpool.png` |
| Luton Town | `luton-town.png` |
| Man City | `man-city.png` |
| Man United | `man-united.png` |
| Newcastle | `newcastle.png` |
| Nottm Forest | `nottingham-forest.png` |
| Sheffield Utd | `sheffield-united.png` |
| Tottenham | `tottenham.png` |
| West Ham | `west-ham.png` |
| Wolves | `wolves.png` |
| Burnley | `burnley.png` |

*(Repeat this pattern for other leagues: La Liga, Bundesliga, Serie A, Ligue 1, MLS)*

## 5. Testing
1.  **Direct URL Access**: Try opening a logo URL in your browser.
2.  **App Verification**: Open the app and check the Game Deck. If a logo fails to load, it will fall back to the placeholder letter (e.g., "A" for Arsenal).

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

## 4. Current Status (Automated Migration)

- **Database**: All teams have been updated to point to local paths (e.g., `https://www.sportsprophecyapp.com/logos/premier-league/arsenal.png`).
- **Files**: An automated script attempted to download logos.
    - **If you see a team initial (e.g., "A")**: The logo file is missing from the folder.
    - **Action**: Download the logo manually and place it in the corresponding folder in `frontend/public/logos`.

## 5. Team List & Filenames (Reference)

### Premier League (`/premier-league/`)
| Team Name | Filename |
| :--- | :--- |
| Arsenal | `arsenal.png` |
| ... | ... |

*(Refer to `backend/src/scripts/update_logos_auto.sql` for the full list of mapped paths)*

## 6. Testing
1.  **Direct URL Access**: Try opening a logo URL in your browser.
2.  **App Verification**: Open the app and check the Game Deck. If a logo fails to load, it will fall back to the placeholder letter.

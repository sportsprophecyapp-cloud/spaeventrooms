# Local Logo Migration Guide

This guide outlines the process for migrating team logos from external URLs to local storage.

## 🏆 Current Status: 100% COMPLETE

As of January 10, 2026, the logo database for the **Top 5 European Leagues** is fully populated and verified.

### 📊 League Statistics:
- **Premier League**: 20/20
- **La Liga**: 20/20
- **Serie A**: 20/20
- **Bundesliga**: 18/18
- **Ligue 1**: 18/18

**Total Logos Migrated: 96 Teams**

## 1. Directory Structure
All logos are stored in `frontend/public/logos/[league]/`.

```
frontend/public/logos/
  ├── premier-league/   (20 files)
  ├── la-liga/          (20 files)
  ├── bundesliga/       (18 files)
  ├── serie-a/          (20 files)
  └── ligue-1/          (18 files)
```

## 2. Naming & Format Standard
- **Naming**: lowercase kebab-case (e.g., `man-city.png`).
- **Format**: Transparent PNG or SVG.
- **Implementation**: The app automatically loads logos based on the team's slug (kebab-case name).

## 3. Maintenance Guide
To add a new team or update an existing logo:
1.  **Source**: Find the team on `football-logos.cc` or similar.
2.  **Save**: Ensure the file has a transparent background.
3.  **Place**: Move the file to the correct directory in `frontend/public/logos/[league]/`.
4.  **Rename**: Ensure the filename is lowercase kebab-case (e.g., `new-team.png`).
5.  **Verify**: The app will automatically attempt to load the file based on the team's slug.

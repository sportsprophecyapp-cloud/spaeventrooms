# Local Logo Migration Guide

This guide outlines the process for migrating team logos from external URLs to local storage.

## 🏆 Current Status: 100% PRODUCTION READY
 
 As of January 11, 2026, the logo system has transitioned from external URLs to a **Manifest-Guided Local System**.
 
 ### 📊 Sync Statistics (Database Matches):
 - **Premier League**: 25/29 Matches Synced
 - **La Liga**: 15/18 Matches Synced
 - **Serie A**: 19/21 Matches Synced
 - **Bundesliga**: 11/16 Matches Synced
 - **Ligue 1**: 16/18 Matches Synced
 
 **Total Synced: 86+ Matches (96+ Local Team Assets)**
 
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
 
 ## 2. Production Synchronization (Render)
 In the Render production environment, the backend cannot browse the frontend's static directory. To solve this, we use a **Manifest System**:
 
 - **Manifest File**: `backend/src/data/logo_manifest.json`
 - **Function**: The backend reads this JSON file to know which logos are available in the public directory without needing direct file system access.
 - **Automation**: The sync script `update_database_logos.ts` runs automatically on deployment via `db-init.ts`, converting all external URLs (API-Football) to relative local paths (`/logos/...`).
 
 ## 3. Maintenance Guide
 To add a new team or update an existing logo:
 1.  **Place**: Move the file to `frontend/public/logos/[league]/`.
 2.  **Rename**: Use lowercase kebab-case (e.g., `new-team.png`).
 3.  **Manifest**: Regenerate the manifest (or update it manually) to include the new filename.
 4.  **Deploy**: The next deployment will automatically update the database to use the new logo.

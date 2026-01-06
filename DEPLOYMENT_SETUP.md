# Deployment Setup: SportsProphecyApp

This project is deployed on **Render** using a full-stack blueprint configuration.

## 🚀 Live Update Workflow
The project uses a custom deployment script to ensure all changes are staged, committed, and pushed to Render in a single, consistent step.

### How to Deploy:
1. Open your terminal in the root folder (`/Users/williamcommu/Desktop/mobile`).
2. Ensure you are at the main prompt (e.g., `192:mobile williamcommu$`).
3. Run the following command:
   ```bash
   bash deploy.sh "Your descriptive commit message"
   ```

**⚠️ Troubleshooting:**
If you type `sh` or `bash` before running the command, you will enter a sub-shell and the deploy won't start until you type `exit`. **Always run the command directly.**

## 🏗 Infrastructure (Render Blueprints)
Defined in `render.yaml`:
1. **Database (`sportsprophecy-db`)**: PostgreSQL.
2. **Backend (`spa-backend`)**: Node.js/Express.
3. **Frontend (`spa-frontend`)**: Next.js.

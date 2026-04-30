# 📱 Events Arena: App Store & Google Play Submission Checklist

This checklist tracks the manual steps required to launch the mobile application on the Apple App Store and Google Play Store. 

---

## Phase 1: Accounts & Prerequisites
Before building the app, ensure you have the following accounts active and upgraded to **Business/Organization** status (Individual accounts will be rejected for apps featuring sweepstakes/contests):
- [ ] **Apple Developer Program (Organization)**
  - Status: **Pending Migration** (New Case ID: `102883092966`)
  - Entity: `JustMe Media`
  - D-U-N-S: `243354843` (Verified)
- [x] **Google Play Console (Business)**
  - Status: **COMPLETED** (Account type updated to Organization)
  - Entity: `JustMe Media`
- [x] **D-U-N-S Number Verified** (`243354843`)
- [x] **Official Website Active** (https://sportsprophecyapp.com)
- [x] **Privacy Policy & Terms of Service** (Cleaned & Branded)

## Phase 2: Generating the Binaries (Cloud Build)
We use Expo Application Services (EAS) to securely compile the apps in the cloud. Open your terminal, navigate to the `mobile` folder (`cd mobile`), and run:

- [ ] Run `npx eas-cli login` to authenticate with your Expo account.
- [ ] Run `npx eas-cli build --platform ios --profile production` to generate the Apple build.
    - *Note: EAS will prompt you to log into your Apple account to automatically generate certificates.*
- [ ] Run `npx eas-cli build --platform android --profile production` to generate the Google build.
    - *Note: EAS will generate an Android Keystore automatically.*
- [ ] Download the resulting `.ipa` (iOS) and `.aab` (Android) files from the Expo dashboard links provided in the terminal.

## Phase 3: Apple App Store Connect (iOS)
- [/] **Status: PENDING Account Migration** (Case: `102883092966`)
- [ ] Log into [App Store Connect](https://appstoreconnect.apple.com/).
- [ ] Create a New App (Select iOS, enter the bundle ID `com.eventsarena.app`).
- [ ] Upload the `.ipa` file (Requires local terminal build).
- [ ] Fill out the Store Metadata:
  - [ ] App Name: **Events Arena: Sports Prophecy**
  - [ ] Promotional Description & Keywords
  - [ ] Support URL: `https://www.sportsprophecyapp.com/corporate/`
  - [ ] Privacy Policy URL: `https://www.sportsprophecyapp.com/corporate/`
- [ ] Upload App Screenshots.
- [ ] Submit for Apple Review.

## Phase 4: Google Play Console (Android)
- [x] **Status: SUBMITTED - IN REVIEW (April 30, 2026)**
- [x] Create a New App.
- [x] Upload Build 28 (v4.1.1) to the Production track.
- [x] Fill out the Store Listing (Updated to `contact@sportsprophecyapp.com`).
- [x] Complete the **Data Safety Form**.
- [x] Complete **App Content** declarations (No financial features).
- [x] Submit for Google Review (Submitted Build 28).

---

## 🚀 Post-Launch Verification
- [ ] Monitor Google Play Console for "Approved" status.
- [ ] Monitor Apple Developer account for migration completion.

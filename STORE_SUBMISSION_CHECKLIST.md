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
- [ ] Log into [App Store Connect](https://appstoreconnect.apple.com/).
- [ ] Create a New App (Select iOS, enter the bundle ID `com.eventsarena.app`).
- [ ] Upload the `.ipa` file (or use the `eas submit` command).
- [ ] Fill out the Store Metadata:
  - [ ] App Name & Subtitle
  - [ ] Promotional Description & Keywords
  - [ ] Support URL & Privacy Policy URL
- [ ] Upload App Screenshots:
  - [ ] 6.5-inch display screenshots (iPhone Max sizes)
  - [ ] 5.5-inch display screenshots (Standard iPhone sizes)
- [ ] Submit for Apple Review (usually takes 24-48 hours).

## Phase 4: Google Play Console (Android)
- [ ] Log into the [Google Play Console](https://play.google.com/console).
- [ ] Create a New App.
- [ ] Upload the `.aab` file to the Production or Closed Testing track.
- [ ] Fill out the Store Listing:
  - [ ] Short Description & Full Description
  - [ ] App Icon (512x512)
  - [ ] Feature Graphic (1024x500)
  - [ ] Phone Screenshots
- [ ] Complete the **Data Safety Form** (Declare that the app collects email addresses and uses JWT authentication).
- [ ] Submit for Google Review (can take up to 7 days for new accounts).

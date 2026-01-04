# Social Authentication Setup Guide

Follow these steps to obtain the necessary IDs and Keys for Apple and Google Sign-In.

## 🍎 1. Apple Sign-In
**Requirement**: Apple Developer Account ($99/year).

1.  **Log in** to the [Apple Developer Portal](https://developer.apple.com/account/).
2.  Go to **Certificates, Identifiers & Profiles** > **Identifiers**.
3.  Select your App ID (`com.sportsprophecy.app`).
4.  Scroll down to the **Capabilities** list.
5.  Check **Sign In with Apple**.
6.  Click **Save** (and Confirm if prompted).

*Note: You don't strictly need a "Key" file (`.p8`) for basic Expo usage unless we are doing backend verification, but enabling the capability is mandatory.*

---

## 🤖 2. Google Sign-In
**Requirement**: Google Account (Free).

1.  **Go to** [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a Project** (e.g., "Sports Prophecy Mobile").
3.  **Configure OAuth Consent Screen**:
    -   Go to **APIs & Services** > **OAuth consent screen**.
    -   Select **External** > Create.
    -   Fill in App Name ("Sports Prophecy"), Support Email, and Developer Email.
    -   Click Save & Continue.
4.  **Create Credentials** (You need 3 separate Client IDs):
    -   Go to **Credentials** > **Create Credentials** > **OAuth client ID**.

    ### A. iOS Client ID
    -   **Application type**: iOS
    -   **Bundle ID**: `com.sportsprophecy.app`
    -   **Name**: "iOS Client"
    -   **Click Create**. Copy the **Client ID**.

    ### B. Android Client ID
    -   **Application type**: Android
    -   **Package name**: `com.sportsprophecy.app`
    -   **SHA-1 Certificate Fingerprint**:
        -   Open your terminal and run: `eas credentials`
        -   Select "Android" > "Production" > "Keystore".
        -   Copy the **SHA1 Fingerprint** provided.
    -   **Name**: "Android Client"
    -   **Click Create**. Copy the **Client ID**.

    ### C. Web Client ID (Required for Expo)
    -   **Application type**: Web application
    -   **Name**: "Web Client"
    -   **Authorized JavaScript origins**: `https://auth.expo.io`
    -   **Authorized redirect URIs**: `https://auth.expo.io/@sportsprophecy/sportsprophecyapp`, `https://www.sportsprophecyapp.com`
    -   **Click Create**. Copy the **Client ID**.

---

## 📝 3. Summary of Keys Needed
Once you have them, please providing the following:

1.  **Google Web Client ID**: `690358031158-n4e5sqsu936iega8rh9ge8f0kjikveht.apps.googleusercontent.com`
2.  **Google iOS Client ID**: `690358031158-c8shuqjc5h66ffg811j1re5b7ihgimrh.apps.googleusercontent.com`
3.  **Google Android Client ID**: `690358031158-ii4ae9s6l59tmhg5gf0sd1a7imk4cjfq.apps.googleusercontent.com`

(Apple just needs the capability enabled on the App ID).

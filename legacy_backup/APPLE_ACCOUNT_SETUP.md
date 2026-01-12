# Apple Developer Account Setup Guide

To publish your app to the App Store and use TestFlight, you need an Apple Developer Account.

## 1. Preparation
You will need:
- An **Apple ID** (preferably with 2-Factor Authentication enabled).
- A valid **Credit Card** (for the $99 USD annual fee).
- A valid **ID** (Driver's License or Passport) for identity verification.

## 2. Enrollment Steps
1.  Go to the [Apple Developer Verification Page](https://developer.apple.com/enroll/).
2.  Click **"Start Your Enrollment"**.
3.  Sign in with your Apple ID.
4.  **Select Entity Type**:
    -   **Individual**: If you are a solo developer (Recommended for now). Your name will appear as the "Seller".
    -   **Organization**: If you have a registered business (LLC, Inc). You need a D-U-N-S number.
5.  **Enter Contact Information**: Fill in your legal name, phone, and address.
6.  **Verify Identity**: likely via the "Apple Developer" app on an iPhone or iPad if asked, or upload ID documents.
7.  **Payment**: Pay the **$99 USD** annual fee.

## 3. After Payment
- **Verification Time**: It can take **24-48 hours** (sometimes less) for Apple to approve your account.
- **Email Confirmation**: You will receive a "Welcome to the Apple Developer Program" email.

## 4. Why Checking "Individual" vs "Organization" Matters
- **Individual**: Faster approval. "William Commu" shows on App Store.
- **Organization**: Slower (requires D-U-N-S). "SportsProphecy LLC" shows on App Store.

## ⚠️ Critical Note for Our App
Since we added **Google Sign-In**, Apple's Review Guidelines **REQUIRE** us to also add **Apple Sign-In**.
- Once your account is active, we will generate the necessary keys to implement Apple Sign-In.

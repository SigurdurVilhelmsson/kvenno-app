# Azure AD Authentication Setup

Developer documentation for Azure AD (Microsoft Entra ID) authentication in the kvenno-app lab-reports SPA.

## Overview

The lab-reports app uses Microsoft Authentication Library (MSAL.js) to authenticate users with their Kvennaskólinn school accounts (`@kvenno.is`). Authentication is implemented client-side using the redirect flow -- no backend auth server is needed.

Key libraries:
- `@azure/msal-browser` -- Core authentication library
- `@azure/msal-react` -- React integration (hooks, components, provider)

## Azure AD App Registration

To configure authentication, an App Registration is needed in the Azure AD (Microsoft Entra ID) portal.

### Required Settings

1. **Supported account types**: Single tenant (Kvennaskólinn organization only)
2. **Platform**: Single-page application (SPA)
3. **Redirect URIs**:
   - Production: `https://kvenno.app/auth/callback`
   - Development: `http://localhost:3000/auth/callback`
4. **API permissions**: `User.Read` (delegated) -- for basic profile info (name, email)

### Important Notes

- The app uses a **centralized redirect URI** (`/auth/callback`) rather than per-deployment-path URIs. This allows the same registration to work for lab-reports deployed at both `/efnafraedi/2-ar/lab-reports/` and `/efnafraedi/3-ar/lab-reports/`.
- The user's original URL is saved in `sessionStorage` before the redirect and restored after authentication.

## Environment Variables

Set these in the `.env` file for the lab-reports app (or in CI/CD):

```bash
# Required: Azure AD App Registration credentials
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id

# Required: Comma-separated list of teacher email addresses
VITE_TEACHER_EMAILS=teacher1@kvenno.is,teacher2@kvenno.is

# Optional: Base path for the deployment (set by build script)
VITE_BASE_PATH=/efnafraedi/2-ar/lab-reports/

# Optional: Skip authentication in development
VITE_BYPASS_AUTH=true
```

The `VITE_AZURE_CLIENT_ID` and `VITE_AZURE_TENANT_ID` values are public (baked into client-side JavaScript at build time). They identify the app but do not grant access on their own.

## Auth Flow

The authentication flow uses MSAL's redirect method:

```
1. User visits a protected page (wrapped in AuthGuard)
2. AuthGuard detects user is not authenticated
3. AuthGuard saves current URL to sessionStorage
4. AuthGuard triggers MSAL loginRedirect() -> user goes to Azure AD login page
5. User authenticates with @kvenno.is credentials
6. Azure AD redirects to /auth/callback with auth response
7. AuthCallback component processes the redirect response
8. AuthCallback reads saved URL from sessionStorage
9. User is navigated back to their original page, now authenticated
```

### MSAL Configuration

Defined in `apps/lab-reports/src/config/authConfig.ts`:

- **Authority**: `https://login.microsoftonline.com/{tenantId}`
- **Redirect URI**: `https://kvenno.app/auth/callback` (production) or `http://localhost:3000/auth/callback` (dev)
- **Cache location**: `sessionStorage`
- **Scopes**: `['User.Read']`
- **navigateToLoginRequestUrl**: `false` (manual navigation handling)

### MSAL Instance

The MSAL `PublicClientApplication` is created once in `apps/lab-reports/src/utils/msalInstance.ts` and shared across the entire app. Do not create multiple instances.

Initialization (`initializeMsal()`) must be called before rendering the app. It:
1. Initializes the MSAL instance
2. Handles any pending redirect promises (if returning from Azure AD)
3. Redirects to the saved return URL if on the `/auth/callback` route

## Teacher Role System

Teachers are identified by email address, configured via the `VITE_TEACHER_EMAILS` environment variable.

### Implementation (`apps/lab-reports/src/utils/roles.ts`)

```typescript
// Emails are loaded from environment at build time
export const TEACHER_EMAILS: string[] = (import.meta.env.VITE_TEACHER_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean);

// Check if a user is a teacher
export const isTeacher = (email: string): boolean => {
  return TEACHER_EMAILS.some(
    (teacherEmail) => teacherEmail.toLowerCase() === email.toLowerCase().trim()
  );
};

// Get role from MSAL account
export const getUserRole = (account: AccountInfo | null): 'teacher' | 'student' => {
  if (!account?.username) return 'student';
  return isTeacher(account.username) ? 'teacher' : 'student';
};
```

### Security Note

This is a **client-side role check for UI purposes only**. It controls which features are shown/hidden in the UI (e.g., teacher grading interface vs. student view). It does not provide server-side authorization. For critical operations, roles should be validated server-side (planned future enhancement).

### Adding Teachers

Update the `VITE_TEACHER_EMAILS` environment variable with a comma-separated list, rebuild, and redeploy:

```bash
VITE_TEACHER_EMAILS=existing.teacher@kvenno.is,new.teacher@kvenno.is
```

## Components

### AuthButton (`apps/lab-reports/src/components/AuthButton.tsx`)

Login/logout button for the header. Shows:
- "Skra inn" (Log in) with login icon when unauthenticated
- User name + "Skra ut" (Log out) when authenticated

Uses MSAL's `loginRedirect()` and `logoutRedirect()` methods. Styled with the Kvenno design system (orange border, 8px radius).

### AuthGuard (`apps/lab-reports/src/components/AuthGuard.tsx`)

Wrapper component that protects routes/content requiring authentication:

```tsx
<AuthGuard>
  <ProtectedContent />
</AuthGuard>
```

Behavior:
- If user is authenticated, renders children
- If user is not authenticated, saves current URL and triggers redirect login
- Shows a loading spinner during authentication
- Supports `VITE_BYPASS_AUTH=true` in development mode to skip auth

### AuthCallback (`apps/lab-reports/src/components/AuthCallback.tsx`)

Handles the redirect from Azure AD after authentication. Mounted at the `/auth/callback` route.

Behavior:
- Processes the MSAL redirect response
- Extracts the saved return URL from sessionStorage
- Navigates user back to their original page
- Shows loading state while processing
- Shows error state with "Til baka" (Back) button on failure

## Troubleshooting

### Redirect URI mismatch

**Error**: `AADSTS50011: The redirect URI specified in the request does not match...`

**Fix**: Ensure the redirect URI registered in Azure AD portal exactly matches what the app sends. Check:
- Production: `https://kvenno.app/auth/callback`
- Development: `http://localhost:3000/auth/callback`
- The URI must include the correct protocol (http vs https) and port

### CORS errors

**Error**: `Access to XMLHttpRequest at 'https://login.microsoftonline.com/...' has been blocked by CORS`

**Fix**: This usually means the app is making API calls instead of using redirect flow. Ensure `loginRedirect()` is used (not `loginPopup()` or direct API calls).

### Token expired / silent token acquisition failed

**Error**: `InteractionRequiredAuthError`

**Fix**: MSAL handles token refresh automatically. If tokens expire and silent refresh fails, the user needs to re-authenticate. The AuthGuard component handles this automatically by triggering a new login redirect.

### Authentication works locally but not in production

**Check**:
1. `VITE_AZURE_CLIENT_ID` and `VITE_AZURE_TENANT_ID` are set in the production build environment
2. The production redirect URI (`https://kvenno.app/auth/callback`) is registered in Azure AD
3. The app is served over HTTPS (required for MSAL in production)

### Auth bypass in development

Set `VITE_BYPASS_AUTH=true` in your `.env` file to skip authentication during local development. This only works when `import.meta.env.DEV` is true (Vite dev server). It will not work in production builds.

# Amazon Seller Integration Documentation

## Overview

The Amazon Seller Integration feature enables QuickBoarder users to connect their Amazon Seller Central accounts and upload products from their QuickBoarder catalogue to Amazon using the SP-API (Selling Partner API).

## Architecture

### Components

1. **OAuth Manager** (`lib/amazon/oauth.ts`)
   - Handles OAuth 2.0 authorization flow
   - Generates authorization URLs with CSRF protection
   - Exchanges authorization codes for tokens
   - Refreshes expired access tokens

2. **Token Manager** (`lib/amazon/token-manager.ts`)
   - Manages token lifecycle and encryption
   - Automatically refreshes tokens when expiring
   - Stores encrypted tokens in database

3. **Product Mapper** (`lib/amazon/product-mapper.ts`)
   - Transforms QuickBoarder products to Amazon listing format
   - Generates unique SKUs
   - Maps categories to Amazon product types

4. **SP-API Client** (`lib/amazon/sp-api-client.ts`)
   - Low-level HTTP client for Amazon SP-API
   - Handles API requests and responses
   - Parses error responses

5. **Upload Handler** (`lib/amazon/upload-handler.ts`)
   - Orchestrates product upload operations
   - Implements rate limiting and retry logic
   - Tracks upload history

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Amazon Seller Integration
AMAZON_CLIENT_ID=your_client_id_here
AMAZON_CLIENT_SECRET=your_client_secret_here
AMAZON_REDIRECT_URI=http://localhost:3000/api/amazon/callback
AMAZON_ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### Getting Amazon Credentials

1. Register as an Amazon SP-API developer at https://developer.amazonservices.com/
2. Create a new application in Seller Central
3. Note your Client ID and Client Secret
4. Configure the OAuth redirect URI to match your application URL

### Generating Encryption Key

Generate a secure 32-character encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

The integration requires three database models:

1. **AmazonConnection** - Stores encrypted OAuth tokens
2. **AmazonUploadHistory** - Tracks product upload history
3. **OAuthState** - Temporary storage for OAuth state parameters

Run Prisma migrations to create the tables:

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

## OAuth Flow

### 1. Initiate Connection

User clicks "Connect Amazon" in Settings:

```typescript
import { initiateAmazonConnection } from "@/actions/amazon-connection";

const result = await initiateAmazonConnection({
  marketplaceId: "ATVPDKIKX0DER", // US marketplace
});

if (result.authorizationUrl) {
  window.location.href = result.authorizationUrl;
}
```

### 2. OAuth Callback

Amazon redirects to `/api/amazon/callback` with authorization code:

- Validates state parameter (CSRF protection)
- Exchanges code for access and refresh tokens
- Encrypts and stores tokens in database
- Redirects to Settings page with success message

### 3. Token Refresh

Tokens are automatically refreshed when they have <5 minutes remaining:

```typescript
import { getValidAccessToken } from "@/lib/amazon/token-manager";

const accessToken = await getValidAccessToken(userId);
// Returns fresh token, automatically refreshing if needed
```

## Product Upload

### Upload Flow

1. User selects products in Catalog page
2. Clicks "Upload to Amazon" button
3. Confirms upload in dialog
4. Products are uploaded sequentially with rate limiting
5. Results are displayed with success/failure status

### Upload Implementation

```typescript
import { uploadProductsToAmazon } from "@/actions/amazon-upload";

const result = await uploadProductsToAmazon({
  productIds: ["product1", "product2"],
});

if (result.results) {
  result.results.forEach((r) => {
    console.log(`${r.productName}: ${r.status}`);
  });
}
```

### Rate Limiting

- 500ms delay between requests
- Exponential backoff on rate limit errors (1s, 2s, 4s)
- Maximum 3 retries per product

## Error Handling

### Error Categories

1. **Authentication Errors** - Token expired, invalid credentials
2. **Validation Errors** - Invalid product data
3. **API Errors** - Rate limits, server errors
4. **Network Errors** - Connection timeouts, DNS failures

### Error Logging

```typescript
import { logError } from "@/lib/amazon/error-logger";

try {
  // Operation
} catch (error) {
  logError(userId, "upload_products", error as Error, {
    productIds: ["product1"],
  });
}
```

## Security

### Token Encryption

- Algorithm: AES-256-GCM
- Unique IV per encryption operation
- Key derivation: PBKDF2 with 100,000 iterations
- Format: `salt:iv:authTag:encryptedData` (base64 encoded)

### CSRF Protection

- State parameter generated with `crypto.randomBytes(32)`
- Stored in database with 10-minute expiration
- One-time use (deleted after validation)

### Subscription Enforcement

- FREE users blocked from connecting Amazon
- PRO and ENTERPRISE users allowed
- Checks performed in server actions and API routes

## Maintenance

### Cleanup Tasks

Run periodic cleanup to remove old data:

```typescript
import { runAllCleanupTasks } from "@/lib/amazon/cleanup-utilities";

// Clean up expired OAuth states and old upload history
await runAllCleanupTasks();
```

### Token Refresh Check

Check and refresh expiring tokens on app startup:

```typescript
import { checkAndRefreshExpiringTokens } from "@/lib/amazon/token-refresh-check";

await checkAndRefreshExpiringTokens();
```

### Metrics

Track performance metrics:

```typescript
import { getMetricsSummary, logMetrics } from "@/lib/amazon/metrics";

const metrics = await getMetricsSummary();
logMetrics(metrics);
```

## Testing

### Manual Testing Checklist

- [ ] OAuth flow with Amazon Seller Central sandbox
- [ ] Token refresh after expiration
- [ ] Single product upload
- [ ] Batch product upload (5+ products)
- [ ] Failed upload retry
- [ ] Rate limit handling
- [ ] Network error handling
- [ ] Subscription enforcement (FREE vs PRO)

### Test Credentials

Use Amazon's sandbox environment for testing:
- Sandbox endpoint: `https://sandbox.sellingpartnerapi-na.amazon.com`
- Test seller accounts available in Seller Central

## Troubleshooting

### Connection Issues

**Problem**: "Invalid state parameter" error

**Solution**: State may have expired (10-minute limit). Try connecting again.

**Problem**: "Token exchange failed"

**Solution**: Verify `AMAZON_CLIENT_ID` and `AMAZON_CLIENT_SECRET` are correct.

### Upload Issues

**Problem**: "Rate limit reached"

**Solution**: Wait a few minutes before retrying. The system will automatically retry with exponential backoff.

**Problem**: "Amazon connection expired"

**Solution**: Reconnect your Amazon account in Settings.

### Database Issues

**Problem**: "Encryption key missing"

**Solution**: Ensure `AMAZON_ENCRYPTION_KEY` is set in `.env` file.

## API Reference

### Server Actions

#### `initiateAmazonConnection(values)`

Initiates OAuth flow for Amazon connection.

**Parameters:**
- `values.marketplaceId` (string) - Amazon marketplace ID

**Returns:**
- `authorizationUrl` (string) - URL to redirect user to Amazon OAuth page
- `error` (string) - Error message if failed

#### `disconnectAmazon()`

Disconnects Amazon account and deletes tokens.

**Returns:**
- `success` (boolean) - Whether disconnection succeeded
- `error` (string) - Error message if failed

#### `uploadProductsToAmazon(values)`

Uploads products to Amazon.

**Parameters:**
- `values.productIds` (string[]) - Array of product IDs to upload

**Returns:**
- `results` (UploadResult[]) - Array of upload results
- `error` (string) - Error message if failed

#### `retryFailedAmazonUploads(values)`

Retries failed product uploads.

**Parameters:**
- `values.productIds` (string[]) - Array of failed product IDs

**Returns:**
- `results` (UploadResult[]) - Array of retry results
- `error` (string) - Error message if failed

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in console
3. Verify environment variables are set correctly
4. Test with Amazon sandbox environment first

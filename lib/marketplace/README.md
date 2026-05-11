# Unified Marketplace Connections

A unified, extensible architecture for managing OAuth connections to multiple e-commerce marketplace platforms (Amazon, Flipkart, Shopify, eBay, Etsy, etc.).

## Overview

The unified marketplace connection system consolidates OAuth flows, token management, and encryption across all marketplace platforms. It replaces platform-specific implementations with a consistent, adapter-based architecture that makes adding new marketplaces straightforward.

### Key Benefits

- **Unified API**: Single interface for all marketplace operations
- **Extensible**: Add new marketplaces in < 2 hours
- **Secure**: AES-256-GCM encryption for all OAuth tokens
- **Type-Safe**: Full TypeScript support with Zod validation
- **Maintainable**: Eliminates code duplication across platforms

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Server Actions Layer                     │
│              (marketplace-connection.ts)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Core Services Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ OAuth Manager│  │Token Manager │  │  Encryption  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    Adapter Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Amazon Adapter│  │Flipkart Adap.│  │Shopify Adap. │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Connecting a Marketplace

```typescript
import { initiateConnection } from "@/actions/marketplace-connection";

// Initiate OAuth flow
const result = await initiateConnection({
  provider: "amazon",
  marketplaceId: "ATVPDKIKX0DER" // Optional
});

if (result.data?.success) {
  // Redirect user to authorization URL
  window.location.href = result.data.authorizationUrl;
}
```

### Getting Connection Status

```typescript
import { getMarketplaceConnectionStatus } from "@/actions/marketplace-connection";

const result = await getMarketplaceConnectionStatus({
  provider: "amazon"
});

if (result.data?.success && result.data.status.connected) {
  console.log(`Connected as seller ${result.data.status.sellerId}`);
}
```

### Disconnecting a Marketplace

```typescript
import { disconnectConnection } from "@/actions/marketplace-connection";

const result = await disconnectConnection({
  provider: "amazon"
});

if (result.data?.success) {
  console.log("Disconnected successfully");
}
```

### Using Access Tokens

```typescript
import { getValidAccessToken } from "@/lib/marketplace/token-manager";

// Automatically refreshes if token expires soon
const accessToken = await getValidAccessToken(userId, "amazon");

// Use token for API requests
const response = await fetch("https://sellingpartnerapi-na.amazon.com/...", {
  headers: {
    "Authorization": `Bearer ${accessToken}`
  }
});
```

## Platform Adapter Interface

Each marketplace platform implements the `MarketplaceAdapter` interface:

```typescript
interface MarketplaceAdapter {
  /**
   * Get OAuth endpoints (authorization and token URLs)
   */
  getOAuthEndpoints(): MarketplaceOAuthEndpoints;
  
  /**
   * Get OAuth configuration from environment variables
   */
  getOAuthConfig(): MarketplaceConnectionConfig;
  
  /**
   * Get marketplace metadata (name, display name, etc.)
   */
  getMarketplaceMetadata(): MarketplaceMetadata;
  
  /**
   * Extract seller ID from OAuth token response
   */
  extractSellerIdFromTokenResponse(data: any): string;
}
```

### Example: Amazon Adapter

```typescript
export class AmazonAdapter implements MarketplaceAdapter {
  getOAuthEndpoints() {
    return {
      authorization: "https://sellercentral.amazon.com/apps/authorize/consent",
      token: "https://api.amazon.com/auth/o2/token"
    };
  }
  
  getOAuthConfig() {
    return {
      clientId: process.env.AMAZON_CLIENT_ID!,
      clientSecret: process.env.AMAZON_CLIENT_SECRET!,
      redirectUri: process.env.AMAZON_REDIRECT_URI!,
      encryptionKey: process.env.AMAZON_ENCRYPTION_KEY!
    };
  }
  
  getMarketplaceMetadata() {
    return {
      name: "amazon",
      displayName: "Amazon",
      countryCode: "US",
      apiEndpoint: "https://sellingpartnerapi-na.amazon.com"
    };
  }
  
  extractSellerIdFromTokenResponse(data: any) {
    return data.seller_id || data.selling_partner_id;
  }
}
```

## Adding a New Marketplace

Follow these steps to add support for a new marketplace platform:

### 1. Create Environment Variables

Add to `.env`:

```bash
# Shopify Seller Integration
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_REDIRECT_URI=http://localhost:3000/api/marketplace/callback?provider=shopify
SHOPIFY_ENCRYPTION_KEY=your_32_byte_base64_key
```

### 2. Add Provider to Types

Update `types/marketplace.ts`:

```typescript
export type MarketplaceProvider = 
  | "amazon" 
  | "flipkart" 
  | "shopify"  // Add new provider
  | "ebay" 
  | "etsy";
```

Update Prisma schema `prisma/schema.prisma`:

```prisma
enum MarketplaceProvider {
  AMAZON
  FLIPKART
  SHOPIFY  // Add new provider
  EBAY
  ETSY
}
```

Run `pnpm prisma generate` to update the Prisma client.

### 3. Create Adapter

Create `lib/marketplace/adapters/shopify.ts`:

```typescript
import type { MarketplaceAdapter } from "../types";
import type {
  MarketplaceConnectionConfig,
  MarketplaceMetadata,
  MarketplaceOAuthEndpoints,
} from "@/types/marketplace";

export class ShopifyAdapter implements MarketplaceAdapter {
  getOAuthEndpoints(): MarketplaceOAuthEndpoints {
    return {
      authorization: "https://accounts.shopify.com/oauth/authorize",
      token: "https://accounts.shopify.com/oauth/token"
    };
  }
  
  getOAuthConfig(): MarketplaceConnectionConfig {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
    const encryptionKey = process.env.SHOPIFY_ENCRYPTION_KEY;
    
    if (!clientId || !clientSecret || !redirectUri || !encryptionKey) {
      throw new Error("Shopify OAuth configuration missing");
    }
    
    return { clientId, clientSecret, redirectUri, encryptionKey };
  }
  
  getMarketplaceMetadata(): MarketplaceMetadata {
    return {
      name: "shopify",
      displayName: "Shopify",
      apiEndpoint: "https://api.shopify.com"
    };
  }
  
  extractSellerIdFromTokenResponse(data: any): string {
    return data.shop_id || data.store_id;
  }
}
```

### 4. Register Adapter

Update `lib/marketplace/adapter-registry.ts`:

```typescript
import { ShopifyAdapter } from "./adapters/shopify";

const adapters: Record<string, MarketplaceAdapter> = {
  amazon: new AmazonAdapter(),
  flipkart: new FlipkartAdapter(),
  shopify: new ShopifyAdapter(),  // Add new adapter
};
```

### 5. Test the Integration

```typescript
// Test connection flow
const result = await initiateConnection({ provider: "shopify" });
// Follow OAuth flow...

// Test token retrieval
const token = await getValidAccessToken(userId, "shopify");

// Test disconnection
await disconnectConnection({ provider: "shopify" });
```

That's it! The new marketplace is now fully integrated.

## Environment Variable Configuration

All marketplace credentials follow a consistent naming convention:

```bash
{PROVIDER}_CLIENT_ID=        # OAuth client ID
{PROVIDER}_CLIENT_SECRET=    # OAuth client secret
{PROVIDER}_REDIRECT_URI=     # OAuth callback URL
{PROVIDER}_ENCRYPTION_KEY=   # Token encryption key (32 bytes, base64)
```

### Generating Encryption Keys

```bash
# Generate a secure 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Migration from Legacy APIs

If you're migrating from platform-specific APIs (e.g., `lib/amazon/oauth.ts`), follow these steps:

### 1. Run Data Migration

```bash
pnpm tsx scripts/migrate-marketplace-connections.ts
```

This migrates existing connections from `AmazonConnection` and `FlipkartConnection` to the unified `MarketplaceConnection` model.

### 2. Update Code References

**Before (Legacy):**
```typescript
import { generateAuthorizationUrl } from "@/lib/amazon/oauth";
import { getValidAccessToken } from "@/lib/amazon/token-manager";

const { url } = await generateAuthorizationUrl(userId, marketplaceId);
const token = await getValidAccessToken(userId);
```

**After (Unified):**
```typescript
import { generateAuthorizationUrl } from "@/lib/marketplace/oauth";
import { getValidAccessToken } from "@/lib/marketplace/token-manager";

const { url } = await generateAuthorizationUrl(userId, "amazon", marketplaceId);
const token = await getValidAccessToken(userId, "amazon");
```

### 3. Update Redirect URIs

Update your OAuth application redirect URIs to use the unified callback:

**Old:** `http://localhost:3000/api/amazon/callback`  
**New:** `http://localhost:3000/api/marketplace/callback?provider=amazon`

## Error Handling

The system provides structured error handling with user-friendly messages:

```typescript
import { 
  MarketplaceError, 
  MarketplaceErrorCode,
  logMarketplaceError 
} from "@/lib/marketplace/errors";

try {
  await initiateConnection({ provider: "amazon" });
} catch (error) {
  if (error instanceof MarketplaceError) {
    console.error(`Error code: ${error.code}`);
    console.error(`User message: ${error.getUserMessage()}`);
  }
  
  logMarketplaceError(error as Error, {
    operation: "initiateConnection",
    userId,
    provider: "amazon"
  });
}
```

### Error Codes

- `CONFIG_MISSING`: OAuth configuration not set
- `INVALID_STATE`: CSRF validation failed
- `TOKEN_EXCHANGE_FAILED`: Failed to exchange code for tokens
- `TOKEN_REFRESH_FAILED`: Failed to refresh access token
- `NETWORK_ERROR`: Network connectivity issue
- `SUBSCRIPTION_REQUIRED`: User plan doesn't allow marketplace connections
- `CONNECTION_NOT_FOUND`: No connection found for user
- `UNSUPPORTED_PROVIDER`: Marketplace provider not supported
- `ENCRYPTION_FAILED`: Token encryption failed
- `DECRYPTION_FAILED`: Token decryption failed

## Security

### Token Encryption

All OAuth tokens are encrypted using AES-256-GCM:

- Unique IV (initialization vector) for each encryption
- PBKDF2 key derivation with 100,000 iterations
- Salt-based key strengthening
- Authentication tags for integrity verification

### CSRF Protection

OAuth flows use cryptographically secure state parameters:

- 32-byte random state (64 hex characters)
- 10-minute expiration
- One-time use (deleted after validation)

### Token Refresh

Tokens are automatically refreshed when they expire in < 5 minutes:

- Exponential backoff retry (1s, 2s, 4s)
- Maximum 3 retry attempts
- Automatic database update on success

## Troubleshooting

### "OAuth configuration missing" Error

**Cause:** Environment variables not set correctly.

**Solution:** Verify all required environment variables are set:
```bash
echo $AMAZON_CLIENT_ID
echo $AMAZON_CLIENT_SECRET
echo $AMAZON_REDIRECT_URI
echo $AMAZON_ENCRYPTION_KEY
```

### "Invalid state parameter" Error

**Cause:** State expired or OAuth flow was interrupted.

**Solution:** Restart the connection flow. State parameters expire after 10 minutes.

### "Token refresh failed" Error

**Cause:** Refresh token expired or was revoked.

**Solution:** User needs to reconnect their marketplace account.

### "Marketplace provider is not supported" Error

**Cause:** Provider not registered in adapter registry.

**Solution:** Verify the provider is added to `lib/marketplace/adapter-registry.ts`.

## API Reference

### Server Actions

- `initiateConnection(provider, marketplaceId?)` - Start OAuth flow
- `disconnectConnection(provider)` - Revoke connection
- `getMarketplaceConnectionStatus(provider)` - Get connection status

### OAuth Manager

- `generateAuthorizationUrl(userId, provider, marketplaceId?)` - Generate OAuth URL
- `handleCallback(code, state, provider)` - Handle OAuth callback
- `refreshAccessToken(refreshToken, provider)` - Refresh access token

### Token Manager

- `getValidAccessToken(userId, provider)` - Get valid access token (auto-refresh)
- `storeTokens(userId, provider, tokens, sellerId, marketplaceId)` - Store encrypted tokens
- `revokeConnection(userId, provider)` - Delete connection
- `getConnectionStatus(userId, provider)` - Get connection status

### Encryption Service

- `encryptToken(token, provider)` - Encrypt token
- `decryptToken(encryptedToken, provider)` - Decrypt token

## Contributing

When adding new features or fixing bugs:

1. Update types in `types/marketplace.ts`
2. Add tests for new functionality
3. Update this README with examples
4. Follow the existing code style and patterns

## License

Internal use only - Onboarder platform.

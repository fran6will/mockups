# GDPR Webhooks Implementation

**Date**: 2026-01-27
**Status**: ✅ IMPLEMENTED - Ready for App Store Submission

---

## Summary

All three mandatory GDPR webhooks have been successfully implemented and configured for Shopify App Store compliance.

---

## What Was Implemented

### 1. Webhook Handler: `app/routes/webhooks.gdpr.tsx`

**Location**: `/app/routes/webhooks.gdpr.tsx`

**Features**:
- ✅ Handles all 3 GDPR webhook topics
- ✅ Proper error handling with try/catch
- ✅ Detailed logging with `[GDPR]` prefix
- ✅ Returns 200 OK for all cases (prevents Shopify retries)
- ✅ JSON responses with status messages

### 2. Webhook Configuration: `shopify.app.toml`

**Added to configuration**:
```toml
[[webhooks.subscriptions]]
topics = [ "customers/data_request" ]
uri = "/webhooks/gdpr"

[[webhooks.subscriptions]]
topics = [ "customers/redact" ]
uri = "/webhooks/gdpr"

[[webhooks.subscriptions]]
topics = [ "shop/redact" ]
uri = "/webhooks/gdpr"
```

All three webhooks point to the same route handler which switches based on topic.

---

## Implementation Details

### CUSTOMERS_DATA_REQUEST

**Purpose**: Merchant requests customer data on behalf of a customer (GDPR right to access)

**Our Implementation**:
```typescript
case "CUSTOMERS_DATA_REQUEST":
    console.log(`[GDPR] Data request for shop ${shop} - No customer data stored`);
    return new Response(JSON.stringify({
        message: "No customer data stored"
    }), { status: 200 });
```

**Rationale**:
- This app does NOT store any individual customer data
- Only shop-level data is stored (shop owner name/email in Session table)
- Returning 200 OK confirms we have no customer data to provide

**Compliance**: ✅ Meets Shopify requirements

---

### CUSTOMERS_REDACT

**Purpose**: Merchant requests customer data deletion (GDPR right to erasure)

**Our Implementation**:
```typescript
case "CUSTOMERS_REDACT":
    console.log(`[GDPR] Redact request for shop ${shop} - No customer data to delete`);
    return new Response(JSON.stringify({
        message: "No customer data to redact"
    }), { status: 200 });
```

**Rationale**:
- No individual customer data exists in our database
- Nothing to delete
- 200 OK confirms compliance

**Compliance**: ✅ Meets Shopify requirements

---

### SHOP_REDACT

**Purpose**: Delete ALL shop data 48 hours after app uninstallation

**Our Implementation**:
```typescript
case "SHOP_REDACT":
    console.log(`[GDPR] Shop redact request for ${shop} - Deleting all shop data...`);

    const deletedSessions = await db.session.deleteMany({
        where: { shop: shop }
    });

    console.log(`[GDPR] Deleted ${deletedSessions.count} session(s) for shop ${shop}`);

    return new Response(JSON.stringify({
        message: "Shop data deleted successfully",
        deletedRecords: deletedSessions.count
    }), { status: 200 });
```

**What Gets Deleted**:
- All `Session` records for the shop
- This includes:
  - Shop owner first/last name
  - Shop owner email
  - OAuth access tokens
  - Refresh tokens
  - All session state

**Compliance**: ✅ Meets Shopify requirements

**Timeline**: Webhook is sent 48 hours after app uninstallation

---

## Data Stored by This App

For complete transparency, here's what personal data this app stores:

### Session Table (Prisma Schema)

```prisma
model Session {
  id                  String    @id
  shop                String    // Shop domain (e.g., "mystore.myshopify.com")
  state               String    // OAuth state
  isOnline            Boolean
  scope               String?
  expires             DateTime?
  accessToken         String    // OAuth access token
  userId              BigInt?
  firstName           String?   // Shop owner first name
  lastName            String?   // Shop owner last name
  email               String?   // Shop owner email
  accountOwner        Boolean
  locale              String?
  collaborator        Boolean?
  emailVerified       Boolean?
  refreshToken        String?
  refreshTokenExpires DateTime?
}
```

### What We DON'T Store

- ❌ Individual customer data (names, emails, addresses)
- ❌ Generated product images (sent directly to Shopify Media API)
- ❌ Generation history or logs
- ❌ Payment information
- ❌ Usage analytics per customer
- ❌ Any PII beyond shop owner info

---

## Error Handling

**Strategy**: Always return 200 OK, even on errors

```typescript
} catch (error) {
    console.error(`[GDPR] Error processing ${topic} webhook:`, error);

    return new Response(JSON.stringify({
        message: "Error processed",
        error: error instanceof Error ? error.message : "Unknown error"
    }), { status: 200 });
}
```

**Rationale**:
- Returning non-200 status causes Shopify to retry webhooks
- We log errors for debugging
- We don't want infinite retry loops
- 200 OK with error message in body is acceptable

---

## Testing Recommendations

### Manual Testing (via Shopify CLI)

```bash
# Trigger GDPR webhooks manually
shopify app webhook trigger --topic=customers/data_request
shopify app webhook trigger --topic=customers/redact
shopify app webhook trigger --topic=shop/redact
```

### Expected Behavior

**customers/data_request**:
- ✅ Returns 200 OK
- ✅ Logs: `[GDPR] Data request for shop [shop] - No customer data stored`
- ✅ Response: `{"message": "No customer data stored"}`

**customers/redact**:
- ✅ Returns 200 OK
- ✅ Logs: `[GDPR] Redact request for shop [shop] - No customer data to delete`
- ✅ Response: `{"message": "No customer data to redact"}`

**shop/redact**:
- ✅ Returns 200 OK
- ✅ Logs: `[GDPR] Shop redact request...` + `Deleted N session(s)`
- ✅ Response: `{"message": "Shop data deleted successfully", "deletedRecords": N}`
- ✅ Database: All Session records for shop are deleted

### Production Testing

After deployment:
1. Install app on test store
2. Uninstall app
3. Wait 48 hours
4. Check logs for `[GDPR] Shop redact` message
5. Verify session deleted from database

---

## Compliance Checklist

- [x] ✅ All 3 GDPR webhooks implemented
- [x] ✅ Webhooks configured in `shopify.app.toml`
- [x] ✅ All webhooks return 200 OK
- [x] ✅ SHOP_REDACT deletes all shop data
- [x] ✅ Error handling prevents infinite retries
- [x] ✅ Detailed logging for audit trail
- [x] ✅ No customer data stored (only shop owner info)
- [x] ✅ 30-day compliance timeline met (immediate responses)

---

## Next Steps

### Before App Store Submission

1. **Deploy to production**:
   ```bash
   shopify app deploy
   ```

2. **Verify webhooks registered**:
   - Go to Shopify Partners Dashboard
   - Check that all 3 GDPR webhooks appear

3. **Test in production**:
   ```bash
   shopify app webhook trigger --topic=shop/redact
   ```

4. **Monitor logs**:
   - Check Vercel logs for `[GDPR]` entries
   - Verify database deletions work

### After App Store Approval

1. **Monitor GDPR requests**:
   - Set up alerts for GDPR webhook calls
   - Review logs monthly

2. **Audit data storage**:
   - If you add new features that store customer data, update webhooks
   - Document what data is stored

3. **Update documentation**:
   - Keep this file updated with any changes
   - Update privacy policy if data storage changes

---

## Privacy Policy Requirements

Your privacy policy should state:

> **Data Storage**
>
> Copié-Collé stores minimal data required for app functionality:
> - Shop owner name and email (for authentication)
> - OAuth access tokens (for Shopify API access)
> - Session state (for login persistence)
>
> We do NOT store:
> - Individual customer data
> - Generated product images (sent directly to your Shopify store)
> - Payment information
> - Usage history
>
> **Data Deletion**
>
> All shop data is automatically deleted 48 hours after app uninstallation.
> You can request data deletion at any time by contacting support@yourapp.com.

---

## Support & Compliance

**GDPR Officer**: [Your Name/Email]
**Support Email**: support@yourapp.com
**Response Time**: Within 30 days (per GDPR requirements)

**Documentation**:
- Privacy Policy: [URL]
- Terms of Service: [URL]
- Data Processing Agreement: [URL if applicable]

---

## Changelog

**2026-01-27**: Initial implementation
- Created `webhooks.gdpr.tsx` handler
- Configured 3 GDPR webhooks in `shopify.app.toml`
- Added database deletion for SHOP_REDACT
- Implemented error handling and logging

---

## References

- [Shopify GDPR Compliance Docs](https://shopify.dev/docs/apps/build/privacy-law-compliance)
- [GDPR Official Regulation](https://gdpr-info.eu/)
- [Shopify Webhook Best Practices](https://shopify.dev/docs/apps/build/webhooks)

---

**Status**: ✅ READY FOR APP STORE SUBMISSION

This implementation meets all Shopify App Store requirements for GDPR compliance.

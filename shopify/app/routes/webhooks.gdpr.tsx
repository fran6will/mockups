import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Compliance Webhooks
 * Required for Shopify App Store approval
 *
 * This app stores minimal personal data (only shop owner info in Session table).
 * No individual customer data is stored.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
    const { topic, shop, session, admin } = await authenticate.webhook(request);

    console.log(`[GDPR] Received webhook: ${topic} for shop: ${shop}`);

    try {
        switch (topic) {
            case "CUSTOMERS_DATA_REQUEST":
                /**
                 * Shopify merchant requests customer data on behalf of a customer
                 *
                 * Our app does NOT store any individual customer data.
                 * We only store shop-level session data (shop owner name/email).
                 *
                 * Compliance: Return 200 OK to confirm no customer data exists.
                 */
                console.log(`[GDPR] Data request for shop ${shop} - No customer data stored in our system`);
                return new Response(JSON.stringify({
                    message: "No customer data stored"
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });

            case "CUSTOMERS_REDACT":
                /**
                 * Shopify merchant requests customer data deletion
                 *
                 * Our app does NOT store any individual customer data.
                 *
                 * Compliance: Return 200 OK to confirm no customer data to delete.
                 */
                console.log(`[GDPR] Redact request for shop ${shop} - No customer data to delete`);
                return new Response(JSON.stringify({
                    message: "No customer data to redact"
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });

            case "SHOP_REDACT":
                /**
                 * App uninstalled - delete ALL shop data (sent 48h after uninstall)
                 *
                 * Delete all Session records for this shop from our database.
                 * This removes: shop owner info, OAuth tokens, session data.
                 */
                console.log(`[GDPR] Shop redact request for ${shop} - Deleting all shop data...`);

                const deletedSessions = await db.session.deleteMany({
                    where: { shop: shop }
                });

                console.log(`[GDPR] Deleted ${deletedSessions.count} session(s) for shop ${shop}`);

                return new Response(JSON.stringify({
                    message: "Shop data deleted successfully",
                    deletedRecords: deletedSessions.count
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });

            default:
                console.log(`[GDPR] Unknown webhook topic: ${topic}`);
                return new Response(JSON.stringify({
                    message: "Unknown webhook topic"
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
        }
    } catch (error) {
        // Log error but still return 200 to prevent Shopify retries
        console.error(`[GDPR] Error processing ${topic} webhook:`, error);

        return new Response(JSON.stringify({
            message: "Error processed",
            error: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
};

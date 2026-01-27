import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Copie Colle" },
    { name: "description", content: "Privacy Policy for Copie Colle Shopify App" },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: "1.6",
      color: "#1a1a1a"
    }}>
      <h1 style={{ marginBottom: "8px" }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>
        <strong>Copie Colle - AI Product Shot Multiplier</strong><br />
        Last updated: January 27, 2026
      </p>

      <section style={{ marginBottom: "32px" }}>
        <h2>1. Introduction</h2>
        <p>
          Copie Colle ("we", "our", or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information
          when you use our Shopify application.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>2. Data We Collect</h2>
        <p>We collect minimal data required for app functionality:</p>
        <ul>
          <li><strong>Shop Information:</strong> Store name, domain, and owner contact details (name, email) for authentication</li>
          <li><strong>OAuth Tokens:</strong> Secure access tokens to interact with your Shopify store</li>
          <li><strong>Product Data:</strong> Temporary access to product images you select for mockup generation</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>3. Data We Do NOT Collect</h2>
        <p>We do NOT store or have access to:</p>
        <ul>
          <li>Your customers' personal information</li>
          <li>Payment or financial data</li>
          <li>Order history or transaction details</li>
          <li>Generated images (sent directly to your Shopify media library)</li>
          <li>Browsing behavior or analytics beyond basic app usage</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>4. How We Use Your Data</h2>
        <ul>
          <li><strong>Authentication:</strong> To verify your identity and maintain login sessions</li>
          <li><strong>API Access:</strong> To read your products and add generated mockups to your store</li>
          <li><strong>Billing:</strong> To process subscription payments through Shopify's secure billing system</li>
          <li><strong>Support:</strong> To respond to your inquiries and provide assistance</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>5. Data Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties.
          We may share data with:
        </p>
        <ul>
          <li><strong>AI Service Providers:</strong> Product images are temporarily processed by our AI partners to generate mockups</li>
          <li><strong>Shopify:</strong> As required for app functionality and billing</li>
          <li><strong>Hosting Providers:</strong> Vercel for application hosting (no personal data stored)</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>6. Data Retention & Deletion</h2>
        <p>
          <strong>Session Data:</strong> Retained while your app is installed. Automatically deleted within 48 hours of app uninstallation.
        </p>
        <p>
          <strong>Generated Images:</strong> Not stored on our servers. Images are sent directly to your Shopify media library.
        </p>
        <p>
          <strong>Immediate Deletion:</strong> You can request immediate deletion of all your data by contacting us at{" "}
          <a href="mailto:support@nanobanana.pro">support@nanobanana.pro</a>.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>7. GDPR Compliance</h2>
        <p>We fully comply with GDPR and other privacy regulations. You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
          <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
          <li><strong>Erasure:</strong> Request deletion of your data</li>
          <li><strong>Portability:</strong> Request your data in a portable format</li>
        </ul>
        <p>
          We respond to all GDPR-mandated webhooks from Shopify (customers/data_request,
          customers/redact, shop/redact) to ensure compliance.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>8. Security</h2>
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul>
          <li>Encrypted data transmission (HTTPS/TLS)</li>
          <li>Secure OAuth 2.0 authentication</li>
          <li>Regular security audits</li>
          <li>Access controls and monitoring</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes by updating the "Last updated" date and, where appropriate,
          through the app interface.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or wish to exercise your
          data rights, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:support@nanobanana.pro">support@nanobanana.pro</a></li>
          <li><strong>Website:</strong> <a href="https://copiecolle.ai" target="_blank" rel="noopener noreferrer">copiecolle.ai</a></li>
        </ul>
      </section>

      <footer style={{
        marginTop: "48px",
        paddingTop: "24px",
        borderTop: "1px solid #eee",
        color: "#666",
        fontSize: "14px"
      }}>
        <p>Copie Colle by Nanobanana</p>
      </footer>
    </div>
  );
}

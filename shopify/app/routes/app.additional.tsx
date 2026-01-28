import {
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function HelpPage() {
  return (
    <Page>
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                How to use Copié-Collé
              </Text>
              <Text as="p" variant="bodyMd">
                Copié-Collé uses cutting-edge AI to place your product images into beautiful, photorealistic scenes. Here is how to get the best results:
              </Text>
              <List>
                <List.Item>
                  <strong>Select a Product:</strong> Choose one of your Shopify products to get started.
                </List.Item>
                <List.Item>
                  <strong>Pick a clear image:</strong> Use an image where the product is clearly visible and isolated.
                </List.Item>
                <List.Item>
                  <strong>Describe the scene:</strong> Be specific! Instead of "on a table", try "on a rustic wooden coffee table with morning sunlight and soft shadows."
                </List.Item>
                <List.Item>
                  <strong>Use Presets:</strong> If you're not sure, try one of our "Style Presets" to get professional results instantly.
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Need Help?
              </Text>
              <Text as="p" variant="bodyMd">
                If you encounter any issues or have questions, feel free to reach out to our team.
              </Text>
              <List>
                <List.Item>
                  <Link url="https://copiecolle.ai/faq" target="_blank">
                    Read our FAQ
                  </Link>
                </List.Item>
                <List.Item>
                  <Link url="mailto:support@nanobanana.pro">
                    Email Support
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

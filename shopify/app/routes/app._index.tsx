import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { TextField, Select } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  // Check for active subscriptions
  const billingCheck = await billing.check({
    // @ts-ignore
    plans: ["Monthly Subscription"],
    isTest: true,
  });

  // Fetch credits from Supabase
  const apiSecret = process.env.INTERNAL_API_SECRET;
  const apiUrl = process.env.NEXTJS_API_URL || "http://localhost:3000";

  let credits = 10;
  try {
    const response = await fetch(`${apiUrl}/api/custom/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiSecret}`,
        "x-shopify-shop": shop,
      },
      body: JSON.stringify({
        action: "check_credits",
        prompt: "ping",
        title: "ping"
      }),
    });
    const data = await response.json();
    credits = data.remainingCredits !== undefined ? data.remainingCredits : 10;
  } catch (e) {
    console.error("Failed to fetch credits:", e);
  }

  return {
    shop,
    isPro: billingCheck.hasActivePayment,
    plans: billingCheck.appSubscriptions,
    credits
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "subscribe") {
    const plan = formData.get("plan") as string;
    return await billing.require({
      // @ts-ignore
      plans: [plan],
      isTest: true,
      onFailure: async () => billing.request({
        // @ts-ignore
        plan,
        isTest: true,
      }),
    });
  }

  if (actionType === "generate") {
    const prompt = formData.get("prompt") as string;
    const title = formData.get("title") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const aspectRatio = formData.get("aspectRatio") as string;
    const numShots = parseInt(formData.get("numShots") as string || "1");

    const presetPrompt = formData.get("presetPrompt") as string;

    const apiSecret = process.env.INTERNAL_API_SECRET;
    const apiUrl = process.env.NEXTJS_API_URL || "http://localhost:3000";
    const shop = session.shop;

    try {
      const results = [];
      const shotTypes = numShots > 1 ? [
        { type: "Hero", suffix: "" },
        { type: "Close-up", suffix: ", macro shot, extreme close-up on fabric texture and logo details" },
        { type: "Minimalist", suffix: ", product isolated on a clean neutral background, minimalist composition" }
      ] : [{ type: "Single", suffix: "" }];

      for (let i = 0; i < numShots; i++) {
        const shotConfig = shotTypes[i] || shotTypes[0];
        const combinedPrompt = `${prompt}${shotConfig.suffix}. ${presetPrompt}`;

        const apiResponse = await fetch(`${apiUrl}/api/custom/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiSecret}`,
            "x-shopify-shop": shop,
          },
          body: JSON.stringify({
            imageUrl,
            prompt: combinedPrompt,
            title: numShots > 1 ? `${title} (${shotConfig.type})` : title,
            aspectRatio,
            mode: "remix",
            imageSize: "1K",
          }),
        });
        const data = await apiResponse.json();
        if (data.success) {
          results.push(data.product);
        }
      }

      if (results.length === 0) {
        return { result: { success: false, error: "Failed to generate any shots" } };
      }

      return { result: { success: true, products: results } };
    } catch (error: any) {
      return { result: { success: false, error: error.message } };
    }
  }

  if (actionType === "addToMedia") {
    const productId = formData.get("productId") as string;
    const mediaUrl = formData.get("mediaUrl") as string;

    const response = await admin.graphql(
      `#graphql
      mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
        productCreateMedia(media: $media, productId: $productId) {
          media {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          productId,
          media: [
            {
              mediaContentType: "IMAGE",
              originalSource: mediaUrl,
            },
          ],
        },
      },
    );

    const result = await response.json();
    return { mediaResult: result.data.productCreateMedia };
  }

  return { product: null };
};

const STYLE_PRESETS = [
  { id: 'none', label: 'No Preset', prompt: '' },
  { id: 'studio', label: 'Clean Studio', prompt: 'Clean, minimalist professional studio setting, neutral background, high-end commercial photography, soft studio lighting, sharp focus' },
  { id: 'urban', label: 'Urban Lifestyle', prompt: 'Modern city street background, architectural details, lifestyle photography, natural daylight, authentic bokeh' },
  { id: 'cinematic', label: 'Cinematic', prompt: 'Dynamic lighting, dramatic shadows, moody atmosphere, 8k resolution, cinematic color grading, professional lens' },
  { id: 'vintage', label: 'Vintage Vibe', prompt: 'Retro feel, film grain, muted colors, lifestyle setting from the 90s, nostalgic atmosphere' },
];

export default function Index() {
  const { isPro: initialIsPro, credits: initialCredits } = useLoaderData<typeof loader>();
  const generationFetcher = useFetcher<any>();
  const mediaFetcher = useFetcher<any>();
  const shopify = useAppBridge();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numShots, setNumShots] = useState("1");
  const [selectedPreset, setSelectedPreset] = useState("none");

  const selectProduct = async () => {
    const products = await shopify.resourcePicker({
      type: "product",
      multiple: false,
    });

    if (products && products.length > 0) {
      setSelectedProduct(products[0]);
      // Auto-select first image if available
      if (products[0].images?.length > 0) {
        setSelectedImage(products[0].images[0].originalSrc);
      }
    }
  };

  const handleGenerate = () => {
    generationFetcher.submit(
      {
        actionType: "generate",
        prompt,
        title,
        imageUrl: selectedImage || "",
        aspectRatio,
        numShots,
        presetPrompt: STYLE_PRESETS.find(p => p.id === selectedPreset)?.prompt || "",
      },
      { method: "POST" },
    );
  };

  const handleAddToMedia = (imageUrl: string) => {
    if (!imageUrl || !selectedProduct) return;
    mediaFetcher.submit(
      {
        actionType: "addToMedia",
        productId: selectedProduct.id,
        mediaUrl: imageUrl,
      },
      { method: "POST" },
    );
  };

  const isGenerating =
    ["loading", "submitting"].includes(generationFetcher.state);

  const isAddingToMedia =
    ["loading", "submitting"].includes(mediaFetcher.state);

  useEffect(() => {
    if (generationFetcher.data?.result?.success) {
      shopify.toast.show(`Mockups generated!`);
    } else if (generationFetcher.data?.result?.error) {
      shopify.toast.show(generationFetcher.data.result.error, { isError: true });
    }
  }, [generationFetcher.data, shopify]);

  useEffect(() => {
    if (mediaFetcher.data?.mediaResult) {
      if (mediaFetcher.data.mediaResult.userErrors?.length > 0) {
        shopify.toast.show(mediaFetcher.data.mediaResult.userErrors[0].message, { isError: true });
      } else {
        shopify.toast.show("Added to Product Media!");
      }
    }
  }, [mediaFetcher.data, shopify]);

  const generatedImages = generationFetcher.data?.result?.products as any[] || [];

  const isPro = Boolean(generationFetcher.data?.loaderData?.isPro ?? initialIsPro);
  const credits = Number(generationFetcher.data?.loaderData?.credits ?? initialCredits ?? 0);

  return (
    <Page>
      <TitleBar title="Copié-Collé Mockups">
        <button variant="primary" onClick={selectProduct}>
          Select Product
        </button>
        {!isPro && (
          <button onClick={() => {
            generationFetcher.submit(
              { actionType: "subscribe", plan: "Monthly Subscription" },
              { method: "POST" }
            );
          }}>
            Upgrade to Pro
          </button>
        )}
      </TitleBar>
      <BlockStack gap="500">
        {/* @ts-ignore */}
        <Layout>
          {/* @ts-ignore */}
          <Layout.Section>
            {selectedProduct ? (
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      Selected: {selectedProduct.title}
                    </Text>
                    <InlineStack gap="200">
                      {!isPro && (
                        /* @ts-ignore */
                        <Box padding="100" background="bg-surface-info" borderRadius="100">
                          <Text as="span" variant="bodySm">Credits: {credits}</Text>
                        </Box>
                      )}
                      <Button onClick={selectProduct}>Change Product</Button>
                    </InlineStack>
                  </InlineStack>

                  {/* @ts-ignore */}
                  <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Now, choose an image for your mockup.
                    </Text>

                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
                      {selectedProduct.images?.map((img: any) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImage(img.originalSrc)}
                          style={{
                            cursor: 'pointer',
                            border: selectedImage === img.originalSrc ? '3px solid #008060' : '2px solid transparent',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            boxShadow: selectedImage === img.originalSrc ? '0 0 10px rgba(0,128,96,0.3)' : 'none'
                          }}
                        >
                          <img src={img.originalSrc} alt="Product" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </Box>

                  {selectedImage && (
                    <BlockStack gap="400">
                      {/* @ts-ignore */}
                      <Box padding="400" borderStyle="dashed" borderWidth="025" borderColor="border" borderRadius="200">
                        <BlockStack gap="400">
                          <TextField
                            label="Project Name"
                            value={title}
                            onChange={setTitle}
                            autoComplete="off"
                            placeholder="e.g. Summer Campaign Mockup"
                          />
                          <TextField
                            label="Scene Prompt"
                            value={prompt}
                            onChange={setPrompt}
                            multiline={3}
                            autoComplete="off"
                            placeholder="Describe the environment (e.g. 'on a beach with palm trees')"
                            helpText="The AI will place your product into this scene naturally."
                          />
                          <Select
                            label="Aspect Ratio"
                            options={[
                              { label: 'Square (1:1)', value: '1:1' },
                              { label: 'Story (9:16)', value: '9:16' },
                              { label: 'Wide (16:9)', value: '16:9' },
                            ]}
                            onChange={setAspectRatio}
                            value={aspectRatio}
                          />
                          <Select
                            label="Style Preset"
                            options={STYLE_PRESETS.map(p => ({ label: p.label, value: p.id }))}
                            onChange={setSelectedPreset}
                            value={selectedPreset}
                          />
                          <Select
                            label="Number of Variations"
                            options={[
                              { label: '1 Shot', value: '1' },
                              { label: '3 Shots (Campaign Pack)', value: '3' },
                            ]}
                            onChange={setNumShots}
                            value={numShots}
                          />
                          {numShots === "3" && (
                            /* @ts-ignore */
                            <Box paddingBlockStart="200">
                              <Text as="p" variant="bodySm" tone="subdued">
                                Campaign Pack will generate: 1 Hero shot, 1 Close-up, and 1 Minimalist variation.
                              </Text>
                            </Box>
                          )}
                          <Button
                            variant="primary"
                            size="large"
                            onClick={handleGenerate}
                            loading={isGenerating}
                            disabled={!prompt || !title}
                          >
                            {numShots === "3" ? "Generate Campaign Pack" : "Generate Mockup"}
                          </Button>
                        </BlockStack>
                      </Box>
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            ) : (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Welcome to Copié-Collé
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Start by selecting a product from your store to create photorealistic mockups.
                  </Text>
                  <Button variant="primary" size="large" onClick={selectProduct}>
                    Select a Product
                  </Button>
                </BlockStack>
              </Card>
            )}
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Your Variations
                </Text>
                {generatedImages.length > 0 ? (
                  <BlockStack gap="600">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                      {generatedImages.map((product, idx) => (
                        <Card key={product.id || idx}>
                          <BlockStack gap="400">
                            {/* @ts-ignore */}
                            <Box borderRadius="200" overflowX="hidden" overflowY="hidden" borderStyle="solid" borderWidth="025" borderColor="border">
                              <img src={product.base_image_url} alt={`Gen ${idx + 1}`} style={{ width: '100%', display: 'block' }} />
                            </Box>
                            <InlineStack gap="200" align="center">
                              <Button
                                variant="primary"
                                onClick={() => handleAddToMedia(product.base_image_url)}
                                loading={isAddingToMedia && mediaFetcher.formData?.get("mediaUrl") === product.base_image_url}
                              >
                                Add to Shopify Media
                              </Button>
                              <Button url={product.base_image_url} download={`${title.replace(/\s+/g, '_')}_${idx + 1}.png`}>Download PNG</Button>
                            </InlineStack>
                          </BlockStack>
                        </Card>
                      ))}
                    </div>
                  </BlockStack>
                ) : (
                  <InlineStack align="center">
                    {/* @ts-ignore */}
                    <Box padding="600">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Generated mockups will appear here.
                      </Text>
                    </Box>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page >
  );
}

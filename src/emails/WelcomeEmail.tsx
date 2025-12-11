import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

const baseUrl = 'https://copiecolle.ai';

export const WelcomeEmail = () => (
    <Html>
        <Head />
        <Preview>Welcome to Copié-Collé! You have 20 credits.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={logoContainer}>
                    <Img
                        src={`${baseUrl}/logo-v2.png`}
                        width="48"
                        height="48"
                        alt="Copié-Collé"
                    />
                </Section>
                <Heading style={h1}>Welcome to Copié-Collé</Heading>
                <Text style={text}>
                    Thanks for joining our community of creators! We're excited to help you create stunning, photorealistic mockups in seconds.
                </Text>
                <Section style={highlightSection}>
                    <Text style={highlightText}>
                        You have <strong>20 credits</strong> to start creating.
                    </Text>
                </Section>
                <Text style={text}>
                    Use your credits to generate high-quality mockups instantly. No Photoshop required.
                </Text>
                <Section style={btnContainer}>
                    <Button style={button} href={`${baseUrl}/create`}>
                        Start Creating
                    </Button>
                </Section>
                <Text style={footer}>
                    <Link href={baseUrl} style={link}>
                        copiecolle.ai
                    </Link>
                    <br />
                    No Photoshop needed. Just copy, paste, and sell.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

const main = {
    backgroundColor: '#F2F0E9', // Base Cream
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '560px',
};

const logoContainer = {
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const h1 = {
    color: '#1A1A1A', // Ink Black
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 20px',
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '20px',
    textAlign: 'center' as const,
};

const highlightSection = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '10px 20px',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    border: '1px solid #e0dfd8',
};

const highlightText = {
    color: '#2A7F7F', // Deep Teal
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
};

const btnContainer = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const button = {
    backgroundColor: '#2A7F7F', // Deep Teal
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    padding: '12px 30px',
    textAlign: 'center' as const,
    display: 'inline-block',
};

const footer = {
    color: '#898989',
    fontSize: '12px',
    lineHeight: '22px',
    marginTop: '12px',
    textAlign: 'center' as const,
};

const link = {
    color: '#898989',
    textDecoration: 'underline',
};

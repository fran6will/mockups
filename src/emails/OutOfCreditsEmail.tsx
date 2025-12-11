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

export const OutOfCreditsEmail = () => (
    <Html>
        <Head />
        <Preview>You're almost out of credits. Keep creating!</Preview>
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
                <Heading style={h1}>You've almost used all your free credits</Heading>
                <Text style={text}>
                    We hope you're enjoying Copié-Collé! You're nearly out of free credits, but don't let that stop your creativity.
                </Text>

                <Section style={highlightSection}>
                    <Heading style={h2}>Want to keep creating?</Heading>
                    <Text style={text}>
                        Upgrade to Pro and unlock full access to our entire library, faster generation speeds, and more.
                    </Text>
                    <Text style={highlightText}>
                        Try it free for 7 days. cancel anytime.
                    </Text>
                </Section>

                <Section style={btnContainer}>
                    <Button style={button} href={`${baseUrl}/pricing`}>
                        Start 7-Day Free Trial
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

export default OutOfCreditsEmail;

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

const h2 = {
    color: '#1A1A1A',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 12px',
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
    padding: '24px 20px',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    border: '1px solid #e0dfd8',
};

const highlightText = {
    color: '#2A7F7F', // Deep Teal
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '12px',
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

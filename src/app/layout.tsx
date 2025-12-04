// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "./LayoutContent";
import SmoothScroll from "@/components/SmoothScroll";
import OrganizationSchema from "@/components/seo/OrganizationSchema";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

// Site URL - Use environment variable or fallback to localhost for development
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  
  title: {
    default: "CloudPlay XP | High Impact Design for Brands",
    template: "%s | CloudPlay XP"
  },
  
  description: "CloudPlay XP creates high-impact event experiences, 3D animations, brand design, motion graphics, and video production that elevate brands both online and on-site.",
  
  keywords: [
    "3D animation",
    "brand design",
    "motion graphics",
    "video production",
    "event experiences",
    "creative agency",
    "web design studio",
    "CloudPlay XP",
    "high impact design",
    "brand identity",
    "visual design",
    "digital experiences"
  ],
  
  authors: [{ name: "CloudPlay XP" }],
  creator: "CloudPlay XP",
  publisher: "CloudPlay XP",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'CloudPlay XP',
    title: 'CloudPlay XP | High Impact Design for Brands',
    description: 'CloudPlay XP creates high-impact event experiences, 3D animations, brand design, motion graphics, and video production that elevate brands both online and on-site.',
    images: [
      {
        url: '/og-image.png', // TODO: Create this 1200x630 image
        width: 1200,
        height: 630,
        alt: 'CloudPlay XP - High Impact Design for Brands',
        type: 'image/png',
      }
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'CloudPlay XP | High Impact Design for Brands',
    description: 'CloudPlay XP creates high-impact event experiences, 3D animations, brand design, and video production.',
    images: ['/twitter-image.png'], // TODO: Create this 1200x600 image
    creator: '@cloudplayxp', // TODO: Update with actual Twitter handle if available
  },
  
  // Canonical URLs and alternates
  alternates: {
    canonical: '/',
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png', // TODO: Create this if not exists
  },
  
  // Verification tags (add when available)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   bing: 'your-bing-verification-code',
  // },
};

// Viewport configuration - Separated per Next.js 15+ requirements
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D0D0D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${montserrat.variable} bg-[#0D0D0D] text-white`}
      >
        {/* Organization Schema for Google Knowledge Graph */}
        <OrganizationSchema />
        
        {/* SITE-LEVEL BACKGROUND LAYER
            - This element sits behind everything (z-0)
            - It contains the actual visual (image/gradient/fog) to be blurred by backdrop-filter
            - pointer-events:none so it never blocks interaction
         */}
       

        <SmoothScroll>
          <LayoutContent>{children}</LayoutContent>
        </SmoothScroll>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NEXT_PUBLIC_URL, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/config";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(NEXT_PUBLIC_URL),
	title: {
		template: `%s · ${SITE_TITLE}`,
		default: SITE_TITLE,
	},
	description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/me.png",
        alt: SITE_TITLE,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/me.png"],
  },
	alternates: {
		types: {
			"application/rss+xml": "/feed.xml",
		},
	},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Blog Posts"
          href="/feed.xml"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

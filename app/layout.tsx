import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	colorScheme: "dark light",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f4f3f7" },
		{ media: "(prefers-color-scheme: dark)", color: "#1a1929" },
	],
};

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	),
	title: "Better HN — Hacker News, reimagined",
	description:
		"A modern Hacker News reader with a customizable time-decay scoring algorithm. Sort stories by relevance, not just recency.",
	keywords: ["hacker news", "hn", "tech news", "programming", "startup"],
	manifest: "/manifest.json",
	icons: { icon: "/icon.svg" },
	openGraph: {
		title: "Better HN — Hacker News, reimagined",
		description:
			"A modern Hacker News reader with a customizable time-decay scoring algorithm. Sort stories by relevance, not just recency.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Better HN — Hacker News, reimagined",
		description:
			"A modern Hacker News reader with a customizable time-decay scoring algorithm.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
			<body className="antialiased">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
				>
					Skip to content
				</a>
				<NavigationProgress />
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}

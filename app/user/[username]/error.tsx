"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";

export default function UserError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="min-h-dvh bg-background">
			<Header />
			<main id="main-content" className="mx-auto max-w-4xl px-4 py-6">
				<Link
					href="/"
					className="mb-6 -ml-2.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to feed
				</Link>
				<div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
					<AlertCircle className="h-8 w-8 text-destructive/60" />
					<p className="text-base font-medium text-muted-foreground">
						Something went wrong loading this profile.
					</p>
					<button
						type="button"
						onClick={reset}
						className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Try again
					</button>
				</div>
			</main>
		</div>
	);
}

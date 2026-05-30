"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RootError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-center">
			<AlertCircle className="h-8 w-8 text-destructive/60" />
			<p className="text-base font-medium text-muted-foreground">
				Something went wrong.
			</p>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={reset}
					className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					Try again
				</button>
				<Link
					href="/"
					className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					Back to feed
				</Link>
			</div>
		</div>
	);
}

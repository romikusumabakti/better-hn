export default function Loading() {
	return (
		<div className="min-h-dvh bg-background">
			<div className="sticky top-0 z-50 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl" />
			<main className="mx-auto max-w-4xl px-4 py-6">
				<div className="mb-6 h-5 w-24 animate-pulse rounded bg-muted" />

				<div className="mb-6 rounded-xl border border-border bg-card p-5 sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
						<div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-muted" />
						<div className="min-w-0 flex-1 space-y-3">
							<div className="h-7 w-40 animate-pulse rounded bg-muted" />
							<div className="flex flex-wrap gap-4">
								<div className="h-4 w-24 animate-pulse rounded bg-muted" />
								<div className="h-4 w-32 animate-pulse rounded bg-muted" />
								<div className="h-4 w-20 animate-pulse rounded bg-muted" />
							</div>
						</div>
					</div>
				</div>

				<div className="mb-4 h-5 w-36 animate-pulse rounded bg-muted" />
				<div className="rounded-xl border border-border bg-card px-5 sm:px-6">
					<div className="divide-y divide-border">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
							<div key={i} className="py-3.5">
								<div className="mb-2 h-4 w-4/5 animate-pulse rounded bg-muted" />
								<div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-dvh bg-background">
			<div className="sticky top-0 z-50 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl" />
			<main className="mx-auto max-w-4xl px-4 py-6">
				<Skeleton className="mb-6 h-5 w-24 rounded" />

				<div className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-6">
					<Skeleton className="mb-4 h-7 w-3/4 rounded sm:h-8" />
					<div className="mb-4 space-y-2">
						<Skeleton className="h-4 w-full rounded" />
						<Skeleton className="h-4 w-5/6 rounded" />
					</div>
					<div className="flex gap-4">
						<Skeleton className="h-4 w-16 rounded" />
						<Skeleton className="h-4 w-20 rounded" />
						<Skeleton className="h-4 w-14 rounded" />
						<Skeleton className="h-4 w-16 rounded" />
					</div>
				</div>

				<Skeleton className="mb-4 h-5 w-28 rounded" />
				<div className="space-y-5">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
						<div key={i}>
							<div className="mb-2 flex items-center gap-2">
								<Skeleton className="h-3 w-3 rounded" />
								<Skeleton className="h-3 w-20 rounded" />
								<Skeleton className="h-3 w-14 rounded" />
							</div>
							<div className="space-y-1.5 pl-5">
								<Skeleton className="h-3 w-full rounded" />
								<Skeleton className="h-3 w-5/6 rounded" />
								{i % 2 === 0 && <Skeleton className="h-3 w-4/6 rounded" />}
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}

"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  MapPin,
  RadioTower,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ErrorCard,
  SkeletonCard,
  VerificationBadge,
} from "@/components/ui";
import { ApiClientError, usersAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Engineer, EngineerReview, EngineerTier } from "@/types/api";

const avatarBlurDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nODAnIGhlaWdodD0nODAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZyBmaWxsPScjZWRlOWZlJz48cmVjdCB3aWR0aD0nODAnIGhlaWdodD0nODAnIHJ4PSc0MCcvPjwvc3ZnPg==";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function categoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function tierLabel(value: EngineerTier) {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as "Silver" | "Gold" | "Platinum" | "Specialist";
}

function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "EC";
}

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function ProfileHero({ engineer, onHire }: { engineer: Engineer; onHire: () => void }) {
  const profile = engineer.profile;
  const name = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <Card variant="glass" padding="lg" className="overflow-visible">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={name}
              width={80}
              height={80}
              placeholder="blur"
              blurDataURL={avatarBlurDataUrl}
              className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-elv-iris to-elv-purple text-xl font-black text-white shadow-lg">
              {initials(profile.firstName, profile.lastName)}
            </span>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-950">{name || "ELV Engineer"}</h1>
              {engineer.serviceProvider.verificationStatus === "verified" ? (
                <VerificationBadge level="verified" label="Verified engineer" />
              ) : (
                <VerificationBadge level="review" label="Verification in review" />
              )}
              <Badge tier={tierLabel(engineer.serviceProvider.tier)} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {profile.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RadioTower className="h-4 w-4" aria-hidden="true" />
                {engineer.serviceProvider.serviceRadius} km service radius
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                Response time &lt; 2 hours
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          onClick={onHire}
          leftIcon={<BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />}
        >
          Hire This Engineer
        </Button>
      </div>
    </Card>
  );
}

function ReviewsSection({ reviews, rating }: { reviews: EngineerReview[]; rating: number }) {
  const breakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((score) => ({
        score,
        count: reviews.filter((review) => Math.round(review.rating) === score).length,
      })),
    [reviews],
  );
  const maxCount = Math.max(...breakdown.map((item) => item.count), 1);

  return (
    <Card
      variant="glass"
      padding="lg"
      title="Reviews and Reputation"
      description="Verified client feedback where the backend exposes review data."
    >
      <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
        <div className="rounded-lg border border-elv-border bg-white p-4">
          <div className="flex items-center gap-3">
            <p className="text-3xl font-black text-foreground">{rating.toFixed(1)}</p>
            <div>
              <Rating value={rating} />
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{reviews.length} available reviews</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {breakdown.map((item) => (
              <div key={item.score} className="grid grid-cols-[24px_1fr_28px] items-center gap-2 text-xs font-bold">
                <span>{item.score}</span>
                <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full bg-amber-400 ${
                      item.count === 0
                        ? "w-0"
                        : item.count / maxCount <= 0.25
                          ? "w-1/4"
                          : item.count / maxCount <= 0.5
                            ? "w-1/2"
                            : item.count / maxCount <= 0.75
                              ? "w-3/4"
                              : "w-full"
                    }`}
                  />
                </span>
                <span className="text-right text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {reviews.length ? (
            reviews.slice(0, 3).map((review) => (
              <article key={review._id} className="rounded-lg border border-elv-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {review.avatarUrl ? (
                      <Image
                        src={review.avatarUrl}
                        alt={review.customerName}
                        width={40}
                        height={40}
                        placeholder="blur"
                        blurDataURL={avatarBlurDataUrl}
                        className="h-10 w-10 rounded-full border border-elv-border object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-xs font-black text-elv-iris">
                        {review.customerName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-black text-foreground">{review.customerName}</p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
                          new Date(review.createdAt),
                        )}
                      </p>
                    </div>
                  </div>
                  <Rating value={review.rating} />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-elv-border bg-white p-8 text-center">
              <Star className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-foreground">No public review records are available yet.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EngineerProfileContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const engineerId = params.id;

  const engineerResult = useSWR<Engineer>(engineerId ? `/users/engineers/${engineerId}` : null, () =>
    usersAPI.getEngineerById(engineerId),
  );
  const reviewsResult = useSWR<EngineerReview[]>(
    engineerId ? `/users/engineers/${engineerId}/reviews` : null,
    () => usersAPI.getEngineerReviews(engineerId),
    { shouldRetryOnError: false },
  );

  const engineer = engineerResult.data;
  const reviews =
    reviewsResult.error instanceof ApiClientError && reviewsResult.error.status === 404
      ? []
      : reviewsResult.data ?? [];

  const handleHire = () => {
    if (!engineer) return;
    const firstCategory = engineer.serviceProvider.categories[0];

    if (isAuthenticated && user?.role === "customer") {
      router.push(`/dashboard/customer/post-job${firstCategory ? `?category=${encodeURIComponent(firstCategory)}` : ""}`);
      return;
    }

    router.push(`/auth/login?returnUrl=${encodeURIComponent(`/engineers/${engineer._id}`)}`);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.14),transparent_34%),linear-gradient(180deg,#fbfaff_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        {engineerResult.isLoading ? (
          <>
            <SkeletonCard lines={4} />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} lines={2} />
              ))}
            </div>
          </>
        ) : engineerResult.error ? (
          <ErrorCard message={engineerResult.error.message} onRetry={() => engineerResult.mutate()} />
        ) : engineer ? (
          <>
            <ProfileHero engineer={engineer} onHire={handleHire} />

            <section className="grid gap-4 md:grid-cols-4">
              <Card variant="stat" accent="warning" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Rating</p>
                <p className="mt-2 text-2xl font-black text-foreground">{engineer.serviceProvider.rating.toFixed(1)}</p>
                <div className="mt-2">
                  <Rating value={engineer.serviceProvider.rating} />
                </div>
              </Card>
              <Card variant="stat" accent="primary" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Total jobs</p>
                <p className="mt-2 text-2xl font-black text-foreground">{engineer.serviceProvider.totalJobs}</p>
              </Card>
              <Card variant="stat" accent="success" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Completion rate</p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {formatPercent(engineer.serviceProvider.completionRate)}
                </p>
              </Card>
              <Card variant="stat" accent="info" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Response time</p>
                <p className="mt-2 text-2xl font-black text-foreground">&lt; 2 hours</p>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.65fr_0.35fr]">
              <Card
                variant="glass"
                padding="lg"
                title="Service Coverage"
                description="Categories, certifications, and field readiness for managed ELV execution."
              >
                <div className="grid gap-6">
                  <div>
                    <p className="text-xs font-black uppercase text-muted-foreground">Categories served</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {engineer.serviceProvider.categories.map((category) => (
                        <Badge key={category} tone="primary">
                          {categoryLabel(category)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-muted-foreground">Certifications</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {engineer.serviceProvider.certifications.length ? (
                        engineer.serviceProvider.certifications.map((certification) => (
                          <Badge key={certification} tone="success">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            {certification}
                          </Badge>
                        ))
                      ) : (
                        <Badge tone="neutral">No public certifications listed</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="dark-glass" padding="lg" title="Trust Signals" description="Verification and platform execution context.">
                <div className="grid gap-3">
                  {[
                    {
                      label: "Identity verification",
                      value: engineer.serviceProvider.verificationStatus === "verified" ? "Verified" : "In review",
                      icon: ShieldCheck,
                    },
                    {
                      label: "Service radius",
                      value: `${engineer.serviceProvider.serviceRadius} km from ${engineer.profile.city}`,
                      icon: MapPin,
                    },
                    {
                      label: "Tool readiness",
                      value: "Field-ready profile",
                      icon: Wrench,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/10 p-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10 text-white">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-white">{item.label}</p>
                          <p className="mt-1 text-xs font-semibold text-indigo-100/75">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </section>

            <ReviewsSection reviews={reviews} rating={engineer.serviceProvider.rating} />
          </>
        ) : null}
      </div>
    </main>
  );
}

export default function EngineerPublicProfilePage() {
  return <EngineerProfileContent />;
}

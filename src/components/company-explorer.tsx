"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type ProblemRecord = {
  difficulty: "EASY" | "MEDIUM" | "HARD" | string;
  title: string;
  frequency: number | null;
  acceptanceRate: number | null;
  link: string;
  topics: string[];
  solutions?: Array<{
    language: string;
    url: string;
  }>;
};

export type CategoryRecord = {
  name: string;
  slug: string;
  count: number;
  problems: ProblemRecord[];
};

export type CompanyRecord = {
  name: string;
  slug: string;
  totals: {
    categories: number;
    problems: number;
  };
  categories: CategoryRecord[];
};

export type CompaniesDataset = {
  generatedAt: string;
  totalCompanies: number;
  companies: CompanyRecord[];
};

type CompanyExplorerProps = {
  initialData: CompaniesDataset;
};

type DifficultyKey = "EASY" | "MEDIUM" | "HARD";

type SortOption = {
  value: string;
  label: string;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "frequency-desc", label: "Frequency · High → Low" },
  { value: "frequency-asc", label: "Frequency · Low → High" },
  { value: "acceptance-desc", label: "Acceptance · High → Low" },
  { value: "acceptance-asc", label: "Acceptance · Low → High" },
  { value: "title-asc", label: "Title · A → Z" },
  { value: "title-desc", label: "Title · Z → A" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY:
    "border-emerald-400/60 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-500/15 dark:text-emerald-200",
  MEDIUM:
    "border-amber-400/60 bg-amber-500/10 text-amber-600 dark:border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-200",
  HARD:
    "border-rose-400/60 bg-rose-500/10 text-rose-600 dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-200",
};

const DEFAULT_DIFFICULTIES: Record<DifficultyKey, boolean> = {
  EASY: true,
  MEDIUM: true,
  HARD: true,
};

const DIFFICULTY_ORDER: DifficultyKey[] = ["EASY", "MEDIUM", "HARD"];

const DIFFICULTY_FILTER_COLORS: Record<DifficultyKey, string> = {
  EASY:
    "border-emerald-400/70 bg-emerald-100/80 text-emerald-700 shadow-sm dark:border-emerald-400/70 dark:bg-emerald-500/25 dark:text-emerald-100",
  MEDIUM:
    "border-amber-400/70 bg-amber-100/80 text-amber-700 shadow-sm dark:border-amber-400/70 dark:bg-amber-500/25 dark:text-amber-100",
  HARD:
    "border-rose-400/70 bg-rose-100/80 text-rose-700 shadow-sm dark:border-rose-400/70 dark:bg-rose-500/25 dark:text-rose-100",
};

const TOP_COMPANIES = [
  {
    slug: "meta",
    name: "Meta",
    initials: "M",
    gradient: "from-indigo-400 via-purple-500 to-pink-500",
    textClass: "text-white",
    tagline: "Social & VR platforms",
  },
  {
    slug: "amazon",
    name: "Amazon",
    initials: "A",
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    textClass: "text-white",
    tagline: "Retail & AWS cloud",
  },
  {
    slug: "apple",
    name: "Apple",
    initials: "A",
    gradient: "from-slate-200 via-slate-300 to-slate-400",
    textClass: "text-slate-900",
    tagline: "Devices & services",
  },
  {
    slug: "netflix",
    name: "Netflix",
    initials: "N",
    gradient: "from-rose-500 via-red-500 to-rose-600",
    textClass: "text-white",
    tagline: "Streaming & media",
  },
  {
    slug: "google",
    name: "Google",
    initials: "G",
    gradient: "from-sky-400 via-emerald-400 to-amber-400",
    textClass: "text-slate-900",
    tagline: "Search & AI",
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    initials: "MS",
    gradient: "from-blue-500 via-sky-500 to-cyan-400",
    textClass: "text-white",
    tagline: "Productivity & cloud",
  },
] as const;

const emptyResultCopy = "No problems match the current filters. Try adjusting your search or difficulty toggles.";

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "n/a";
  return `${Math.round(value)}%`;
}

function formatAcceptance(value: number | null) {
  if (value === null || Number.isNaN(value)) return "n/a";
  return `${(value * 100).toFixed(1)}%`;
}

export function CompanyExplorer({ initialData }: CompanyExplorerProps) {
  const [companyQuery, setCompanyQuery] = useState("");
  const [problemQuery, setProblemQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0]?.value ?? "frequency-desc");
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | null>(
    initialData.companies[0]?.slug ?? null
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(
    initialData.companies[0]?.categories[0]?.slug ?? null
  );
  const [difficulties, setDifficulties] = useState<Record<DifficultyKey, boolean>>(DEFAULT_DIFFICULTIES);

  const companies = initialData.companies;

  const featuredCompanies = useMemo(() => {
    const companyMap = new Map(companies.map((company) => [company.slug, company]));
    return TOP_COMPANIES.map((entry) => {
      const company = companyMap.get(entry.slug);
      if (!company) {
        return null;
      }
      return {
        ...entry,
        company,
      };
    }).filter(Boolean) as Array<
      (typeof TOP_COMPANIES)[number] & { company: CompanyRecord }
    >;
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = companyQuery.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) => company.name.toLowerCase().includes(query));
  }, [companies, companyQuery]);

  useEffect(() => {
    if (filteredCompanies.length === 0) {
      setSelectedCompanySlug(null);
      return;
    }

    const hasSelection = filteredCompanies.some((company) => company.slug === selectedCompanySlug);
    if (!hasSelection) {
      setSelectedCompanySlug(filteredCompanies[0]?.slug ?? null);
    }
  }, [filteredCompanies, selectedCompanySlug]);

  const selectedCompany = useMemo(() => {
    if (!selectedCompanySlug) return null;
    return companies.find((company) => company.slug === selectedCompanySlug) ?? null;
  }, [companies, selectedCompanySlug]);

  useEffect(() => {
    if (!selectedCompany) {
      setSelectedCategorySlug(null);
      return;
    }

    const hasCategory = selectedCompany.categories.some((category) => category.slug === selectedCategorySlug);
    if (!hasCategory) {
      setSelectedCategorySlug(selectedCompany.categories[0]?.slug ?? null);
    }
  }, [selectedCompany, selectedCategorySlug]);

  const activeCategory = useMemo(() => {
    if (!selectedCompany || !selectedCategorySlug) return null;
    return selectedCompany.categories.find((category) => category.slug === selectedCategorySlug) ?? null;
  }, [selectedCategorySlug, selectedCompany]);

  const activeProblems = useMemo(() => {
    if (!activeCategory) return [];
    const enabledDifficulties = Object.entries(difficulties)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key as DifficultyKey);

    const base = activeCategory.problems.filter((problem) => {
      const difficultyMatch = enabledDifficulties.includes(problem.difficulty as DifficultyKey);
      if (!difficultyMatch) return false;
      if (!problemQuery) return true;
      const haystack = `${problem.title} ${problem.topics.join(" ")}`.toLowerCase();
      return haystack.includes(problemQuery.trim().toLowerCase());
    });

    const [field, direction] = sortOption.split("-");

    const compareStrings = (a: string, b: string) =>
      direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);

    const compareNumbers = (a: number | null, b: number | null) => {
      const valueA = typeof a === "number" ? a : direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      const valueB = typeof b === "number" ? b : direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    };

    return [...base].sort((a, b) => {
      switch (field) {
        case "title":
          return compareStrings(a.title, b.title);
        case "acceptance":
          return compareNumbers(a.acceptanceRate, b.acceptanceRate);
        case "frequency":
        default:
          return compareNumbers(a.frequency, b.frequency);
      }
    });
  }, [activeCategory, difficulties, problemQuery, sortOption]);

  const toggleDifficulty = (difficulty: DifficultyKey) => {
    setDifficulties((prev) => {
      const next = { ...prev, [difficulty]: !prev[difficulty] };
      const enabledCount = Object.values(next).filter(Boolean).length;
      if (enabledCount === 0) {
        return { ...DEFAULT_DIFFICULTIES };
      }
      return next;
    });
  };

  const activeDifficultyLabels = useMemo(
    () =>
      (Object.entries(difficulties)
        .filter(([, value]) => value)
        .map(([key]) => key as DifficultyKey)),
    [difficulties],
  );

  const hasCustomFilters =
    problemQuery.trim().length > 0 ||
    sortOption !== SORT_OPTIONS[0].value ||
    activeDifficultyLabels.length !== Object.keys(DEFAULT_DIFFICULTIES).length;

  const resetFilters = () => {
    setProblemQuery("");
    setSortOption(SORT_OPTIONS[0]?.value ?? "frequency-desc");
    setDifficulties({ ...DEFAULT_DIFFICULTIES });
  };

  const difficultySummary =
    activeDifficultyLabels.length === DIFFICULTY_ORDER.length
      ? "All difficulties"
      : activeDifficultyLabels.join(", ");

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ?? SORT_OPTIONS[0].label;

  const datasetMeta = `Companies: ${initialData.totalCompanies.toLocaleString()} · Generated: ${new Date(
    initialData.generatedAt
  ).toLocaleDateString()}`;

  return (
    <div className="container space-y-4 py-4 sm:py-6">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-card p-4 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm text-muted-foreground sm:items-center">
          <Building2 className="hidden h-5 w-5 text-primary sm:inline" />
          <div>
            <p className="font-semibold text-foreground">{selectedCompany?.name ?? "Select a company"}</p>
            <p>{datasetMeta}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters update instantly. Mobile optimised.</span>
          <span className="sm:hidden">Live filters</span>
        </div>
      </div>
      {featuredCompanies.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Featured companies
              </p>
              <p className="text-xs text-muted-foreground/80">
                Quick links into MAANG-level interview sets.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:flex md:flex-wrap">
            {featuredCompanies.map((entry) => {
              const isActive = entry.slug === selectedCompanySlug;
              return (
                <button
                  key={entry.slug}
                  type="button"
                  onClick={() => setSelectedCompanySlug(entry.slug)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:min-w-[200px]",
                    isActive
                      ? "border-primary/70 bg-primary/10"
                      : "border-border/70 bg-background/60 hover:border-primary/60 hover:bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold shadow-md",
                      entry.gradient,
                      entry.textClass
                    )}
                  >
                    {entry.initials}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {entry.company.totals.problems.toLocaleString()} problems · {entry.tagline}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-full">
          <CardHeader className="gap-4">
            <div>
              <CardTitle className="text-xl">Companies</CardTitle>
              <CardDescription>Search and pick a company to explore its curated question set.</CardDescription>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search companies"
                value={companyQuery}
                onChange={(event) => setCompanyQuery(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] max-h-[60vh] rounded-md border border-border md:h-[620px] md:max-h-none">
              <div className="flex flex-col">
                {filteredCompanies.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No companies found.</p>
                ) : (
                  filteredCompanies.map((company) => {
                    const isActive = company.slug === selectedCompanySlug;
                    return (
                      <button
                        key={company.slug}
                        type="button"
                        className={cn(
                          "flex w-full flex-col items-start gap-1 border-b border-border/80 px-4 py-3 text-left transition-colors last:border-b-0",
                          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedCompanySlug(company.slug)}
                      >
                        <span className="text-sm font-medium">{company.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {company.totals.problems.toLocaleString()} problems · {company.totals.categories} tracks
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {selectedCompany?.name ?? "Choose a company"}
                  </CardTitle>
                  <CardDescription>
                    {selectedCompany?.totals.problems.toLocaleString() ?? 0} problems across
                    {" "}
                    {selectedCompany?.totals.categories ?? 0} categories
                  </CardDescription>
                </div>
              </div>
              {selectedCompany?.categories.length ? (
                <Tabs
                  value={selectedCategorySlug ?? selectedCompany.categories[0]?.slug ?? ""}
                  onValueChange={setSelectedCategorySlug}
                >
                  <TabsList className="w-full flex-wrap justify-start gap-2 overflow-x-auto bg-transparent p-0">
                    {selectedCompany.categories.map((category) => (
                      <TabsTrigger
                        key={category.slug}
                        value={category.slug}
                        className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs md:text-sm"
                      >
                        {category.name} ({category.count})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {selectedCompany.categories.map((category) => (
                    <TabsContent key={category.slug} value={category.slug} />
                  ))}
                </Tabs>
              ) : (
                <p className="text-sm text-muted-foreground">Select a company to view available tracks.</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-3 shadow-sm backdrop-blur">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Problem search
                      </span>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/80" />
                        <Input
                          placeholder="Search by title or topic"
                          className="pl-9 bg-background/60"
                          value={problemQuery}
                          onChange={(event) => setProblemQuery(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Sort
                      </span>
                      <div className="relative">
                        <select
                          className="h-10 w-full rounded-lg border border-border/70 bg-background/80 px-3 text-sm font-medium text-foreground shadow-sm backdrop-blur focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          value={sortOption}
                          onChange={(event) => setSortOption(event.target.value)}
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Difficulty
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DIFFICULTY_ORDER.map((difficulty) => {
                        const isActive = difficulties[difficulty];
                        return (
                          <button
                            key={difficulty}
                            type="button"
                            onClick={() => toggleDifficulty(difficulty)}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isActive
                                ? DIFFICULTY_FILTER_COLORS[difficulty]
                                : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                          >
                            {difficulty}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-dashed border-border/60 bg-card/40 p-3 backdrop-blur">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Filter summary
                    </span>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">Query:</span> {problemQuery.trim().length ? `"${problemQuery.trim()}"` : "None"}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Sort:</span> {sortLabel}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Difficulty:</span> {difficultySummary}
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="self-start border-border/70 bg-background/80" onClick={resetFilters} disabled={!hasCustomFilters}>
                    Reset filters
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground backdrop-blur">
                <span>
                  Showing <span className="font-semibold text-foreground">{activeProblems.length.toLocaleString()}</span> of{" "}
                  <span className="font-semibold text-foreground">{activeCategory?.count.toLocaleString() ?? 0}</span> questions in{" "}
                  <span className="font-semibold text-foreground">{activeCategory?.name ?? "the selected track"}</span>
                </span>
                {hasCustomFilters ? (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Filters active
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground/80">Default filters</span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {activeProblems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  {emptyResultCopy}
                </CardContent>
              </Card>
            ) : (
              activeProblems.map((problem) => (
                <Card
                  key={problem.link}
                  className="h-[150px] transition-all hover:border-primary/50 hover:shadow-lg sm:h-[140px]"
                >
                  <CardContent className="flex h-full flex-col justify-between gap-2 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                          <Link
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            {problem.title}
                          </Link>
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          <span>
                            Frequency: <span className="font-semibold text-foreground">{formatPercent(problem.frequency)}</span>
                          </span>
                          <span>
                            Acceptance: <span className="font-semibold text-foreground">{formatAcceptance(problem.acceptanceRate)}</span>
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "border text-[10px] font-semibold",
                          DIFFICULTY_COLORS[problem.difficulty] ?? "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {problem.difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 overflow-hidden text-[11px]">
                      {problem.topics.length > 0 ? (
                        problem.topics.map((topic) => (
                          <span
                            key={`${problem.title}-${topic}`}
                            className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-muted-foreground"
                          >
                            {topic}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
                          No topics tagged
                        </span>
                      )}
                    </div>
                    {problem.solutions && problem.solutions.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        {problem.solutions.slice(0, 4).map((solution) => (
                          <Link
                            key={`${problem.title}-${solution.language}`}
                            href={solution.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 font-medium text-foreground transition hover:border-primary/60 hover:text-primary"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                            {solution.language}
                          </Link>
                        ))}
                        {problem.solutions.length > 4 && (
                          <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 font-medium text-muted-foreground">
                            +{problem.solutions.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Loader2, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const STORAGE_KEY = "codeatlas-view";
const DEFAULT_PAGE_SIZE = 40;
const DEFAULT_ACCEPTANCE_RANGE = { min: 0, max: 100 } as const;
const DEFAULT_FREQUENCY_RANGE = { min: 0, max: 100 } as const;

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function getProblemKey(problem: ProblemRecord) {
  return problem.link || `${problem.title}-${problem.difficulty}`;
}

export function CompanyExplorer({ initialData }: CompanyExplorerProps) {
  const [companyQuery, setCompanyQuery] = useState("");
  const [problemQuery, setProblemQuery] = useState("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0]?.value ?? "frequency-desc");
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | null>("all");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [acceptanceRange, setAcceptanceRange] = useState<{ min: number; max: number }>({ ...DEFAULT_ACCEPTANCE_RANGE });
  const [frequencyRange, setFrequencyRange] = useState<{ min: number; max: number }>({ ...DEFAULT_FREQUENCY_RANGE });
  const [onlyWithSolutions, setOnlyWithSolutions] = useState(false);
  const [difficulties, setDifficulties] = useState<Record<DifficultyKey, boolean>>(DEFAULT_DIFFICULTIES);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE);
  const [hydrated, setHydrated] = useState(false);

  const allProblemsCompany = useMemo<CompanyRecord>(() => {
    const allProblems = new Map<string, ProblemRecord>();

    initialData.companies.forEach((company) => {
      company.categories.forEach((category) => {
        category.problems.forEach((problem) => {
          const key = getProblemKey(problem);
          if (!key || allProblems.has(key)) {
            return;
          }
          allProblems.set(key, problem);
        });
      });
    });

    const problems = Array.from(allProblems.values()).sort((a, b) => {
      const freqA = typeof a.frequency === "number" ? a.frequency : -Infinity;
      const freqB = typeof b.frequency === "number" ? b.frequency : -Infinity;
      return freqB - freqA;
    });

    return {
      name: "All Companies",
      slug: "all",
      totals: {
        categories: 1,
        problems: problems.length,
      },
      categories: [
        {
          name: "All Questions",
          slug: "all",
          problems,
          count: problems.length,
        },
      ],
    };
  }, [initialData.companies]);

  const companies = useMemo(() => [allProblemsCompany, ...initialData.companies], [allProblemsCompany, initialData.companies]);

  const problemCompanyIndex = useMemo(() => {
    const map = new Map<string, Array<{ slug: string; name: string }>>();

    initialData.companies.forEach((company) => {
      company.categories.forEach((category) => {
        category.problems.forEach((problem) => {
          const key = getProblemKey(problem);
          if (!key) {
            return;
          }
          const existing = map.get(key) ?? [];
          if (!existing.some((entry) => entry.slug === company.slug)) {
            existing.push({ slug: company.slug, name: company.name });
            map.set(key, existing);
          }
        });
      });
    });

    return map;
  }, [initialData.companies]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }

      const saved = JSON.parse(raw) as Partial<{
        selectedCompanySlug: string | null;
        selectedCategorySlug: string | null;
        selectedTopics: string[];
        acceptanceRange: { min: number; max: number };
        frequencyRange: { min: number; max: number };
        onlyWithSolutions: boolean;
        problemQuery: string;
        sortOption: string;
        difficulties: Record<DifficultyKey, boolean>;
      }>;

      if (saved.selectedCompanySlug && companies.some((company) => company.slug === saved.selectedCompanySlug)) {
        setSelectedCompanySlug(saved.selectedCompanySlug);
        if (saved.selectedCategorySlug) {
          setSelectedCategorySlug(saved.selectedCategorySlug);
        }
      }

      if (Array.isArray(saved.selectedTopics)) {
        setSelectedTopics(saved.selectedTopics.filter((topic) => typeof topic === "string"));
      }

      if (saved.acceptanceRange) {
        setAcceptanceRange(() => {
          const minValue = typeof saved.acceptanceRange?.min === "number"
            ? clampNumber(saved.acceptanceRange.min, DEFAULT_ACCEPTANCE_RANGE.min, DEFAULT_ACCEPTANCE_RANGE.max)
            : DEFAULT_ACCEPTANCE_RANGE.min;
          const maxValue = typeof saved.acceptanceRange?.max === "number"
            ? clampNumber(saved.acceptanceRange.max, DEFAULT_ACCEPTANCE_RANGE.min, DEFAULT_ACCEPTANCE_RANGE.max)
            : DEFAULT_ACCEPTANCE_RANGE.max;
          const nextMin = Math.min(minValue, maxValue);
          const nextMax = Math.max(maxValue, nextMin);
          return { min: nextMin, max: nextMax };
        });
      }

      if (saved.frequencyRange) {
        setFrequencyRange(() => {
          const minValue = typeof saved.frequencyRange?.min === "number"
            ? clampNumber(saved.frequencyRange.min, DEFAULT_FREQUENCY_RANGE.min, DEFAULT_FREQUENCY_RANGE.max)
            : DEFAULT_FREQUENCY_RANGE.min;
          const maxValue = typeof saved.frequencyRange?.max === "number"
            ? clampNumber(saved.frequencyRange.max, DEFAULT_FREQUENCY_RANGE.min, DEFAULT_FREQUENCY_RANGE.max)
            : DEFAULT_FREQUENCY_RANGE.max;
          const nextMin = Math.min(minValue, maxValue);
          const nextMax = Math.max(maxValue, nextMin);
          return { min: nextMin, max: nextMax };
        });
      }

      if (typeof saved.onlyWithSolutions === "boolean") {
        setOnlyWithSolutions(saved.onlyWithSolutions);
      }

      if (typeof saved.problemQuery === "string") {
        setProblemQuery(saved.problemQuery);
      }

      if (saved.sortOption && SORT_OPTIONS.some((option) => option.value === saved.sortOption)) {
        setSortOption(saved.sortOption);
      }

      if (saved.difficulties) {
        setDifficulties((prev) => ({ ...prev, ...saved.difficulties }));
      }
    } catch (error) {
      console.warn("Failed to restore cached view state", error);
    } finally {
      setHydrated(true);
    }
  }, [companies]);

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

  const availableTopics = useMemo(() => {
    if (!activeCategory) return [] as string[];
    const topicSet = new Set<string>();
    activeCategory.problems.forEach((problem) => {
      problem.topics.forEach((topic) => {
        if (topic) {
          topicSet.add(topic);
        }
      });
    });
    return Array.from(topicSet).sort((a, b) => a.localeCompare(b));
  }, [activeCategory]);

  useEffect(() => {
    if (!activeCategory) {
      setSelectedTopics((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    setSelectedTopics((prev) => {
      const filtered = prev.filter((topic) => availableTopics.includes(topic));
      if (filtered.length === prev.length) {
        return prev;
      }
      return filtered;
    });
  }, [activeCategory, availableTopics]);

  const activeProblems = useMemo(() => {
    if (!activeCategory) return [];
    const enabledDifficulties = Object.entries(difficulties)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key as DifficultyKey);

    const base = activeCategory.problems.filter((problem) => {
      const difficultyMatch = enabledDifficulties.includes(problem.difficulty as DifficultyKey);
      if (!difficultyMatch) return false;

      const topicMatch =
        selectedTopics.length === 0 || selectedTopics.every((topic) => problem.topics.includes(topic));
      if (!topicMatch) return false;

      const acceptancePercent =
        typeof problem.acceptanceRate === "number" ? problem.acceptanceRate * 100 : null;
      const acceptanceMatch =
        acceptanceRange.min <= 0 && acceptanceRange.max >= 100
          ? true
          : typeof acceptancePercent === "number"
            ? acceptancePercent >= acceptanceRange.min && acceptancePercent <= acceptanceRange.max
            : false;
      if (!acceptanceMatch) return false;

      const frequencyValue = typeof problem.frequency === "number" ? problem.frequency : null;
      const frequencyMatch =
        frequencyRange.min <= 0 && frequencyRange.max >= 100
          ? true
          : typeof frequencyValue === "number"
            ? frequencyValue >= frequencyRange.min && frequencyValue <= frequencyRange.max
            : false;
      if (!frequencyMatch) return false;

      if (onlyWithSolutions && !(problem.solutions && problem.solutions.length > 0)) {
        return false;
      }

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
  }, [acceptanceRange, activeCategory, difficulties, frequencyRange, onlyWithSolutions, problemQuery, selectedTopics, sortOption]);

  const visibleProblems = useMemo(() => activeProblems.slice(0, visibleCount), [activeProblems, visibleCount]);
  const hasMore = visibleCount < activeProblems.length;

  useEffect(() => {
    setVisibleCount(DEFAULT_PAGE_SIZE);
  }, [
    selectedCompanySlug,
    selectedCategorySlug,
    problemQuery,
    sortOption,
    difficulties,
    selectedTopics,
    acceptanceRange,
    frequencyRange,
    onlyWithSolutions,
  ]);

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

  const isDefaultAcceptanceRange =
    acceptanceRange.min === DEFAULT_ACCEPTANCE_RANGE.min && acceptanceRange.max === DEFAULT_ACCEPTANCE_RANGE.max;

  const isDefaultFrequencyRange =
    frequencyRange.min === DEFAULT_FREQUENCY_RANGE.min && frequencyRange.max === DEFAULT_FREQUENCY_RANGE.max;

  const hasCustomFilters =
    problemQuery.trim().length > 0 ||
    sortOption !== SORT_OPTIONS[0].value ||
    selectedTopics.length > 0 ||
    !isDefaultAcceptanceRange ||
    !isDefaultFrequencyRange ||
    onlyWithSolutions ||
    activeDifficultyLabels.length !== Object.keys(DEFAULT_DIFFICULTIES).length;

  const resetFilters = () => {
    setProblemQuery("");
    setSortOption(SORT_OPTIONS[0]?.value ?? "frequency-desc");
    setDifficulties({ ...DEFAULT_DIFFICULTIES });
    setSelectedTopics([]);
    setAcceptanceRange({ ...DEFAULT_ACCEPTANCE_RANGE });
    setFrequencyRange({ ...DEFAULT_FREQUENCY_RANGE });
    setOnlyWithSolutions(false);
    setSelectedCompanySlug("all");
    setSelectedCategorySlug("all");
    setVisibleCount(DEFAULT_PAGE_SIZE);
  };

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    const payload = {
      selectedCompanySlug,
      selectedCategorySlug,
      selectedTopics,
      acceptanceRange,
      frequencyRange,
      onlyWithSolutions,
      problemQuery,
      sortOption,
      difficulties,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to persist view state", error);
    }
  }, [
    hydrated,
    selectedCompanySlug,
    selectedCategorySlug,
    selectedTopics,
    acceptanceRange,
    frequencyRange,
    onlyWithSolutions,
    problemQuery,
    sortOption,
    difficulties,
  ]);

  const difficultySummary =
    activeDifficultyLabels.length === DIFFICULTY_ORDER.length
      ? "All difficulties"
      : activeDifficultyLabels.join(", ");

  const topicSummary =
    selectedTopics.length === 0
      ? "All topics"
      : [...selectedTopics].sort((a, b) => a.localeCompare(b)).join(", ");

  const acceptanceSummary =
    isDefaultAcceptanceRange
      ? "All rates"
      : `${Math.round(acceptanceRange.min)}% – ${Math.round(acceptanceRange.max)}%`;

  const frequencySummary =
    isDefaultFrequencyRange
      ? "All frequencies"
      : `${Math.round(frequencyRange.min)} – ${Math.round(frequencyRange.max)}`;

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ?? SORT_OPTIONS[0].label;

  const allCompaniesMeta = `Companies: ${initialData.totalCompanies.toLocaleString()} · Unique questions: ${allProblemsCompany.totals.problems.toLocaleString()} · Generated: ${new Date(
    initialData.generatedAt
  ).toLocaleDateString()}`;

  const headerSubtitle = selectedCompany?.slug === "all"
    ? allCompaniesMeta
    : `${selectedCompany?.totals.problems.toLocaleString() ?? 0} problems · ${selectedCompany?.totals.categories ?? 0} categories`;

  return (
    <div className="container space-y-4 py-4 sm:py-6">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-card p-4 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm text-muted-foreground sm:items-center">
          <Building2 className="hidden h-5 w-5 text-primary sm:inline" />
          <div>
            <p className="text-base font-semibold text-foreground sm:text-lg">{selectedCompany?.name ?? "All Companies"}</p>
            <p>{headerSubtitle}</p>
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
              <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
                <div className="grid gap-6 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Solutions
                      </span>
                      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm shadow-sm backdrop-blur">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={onlyWithSolutions}
                            onCheckedChange={(checked) => setOnlyWithSolutions(checked === true)}
                          />
                          <span className="text-sm font-medium">Require solutions</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Hide problems without linked community solutions.</p>
                    </div>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Topics
                        </span>
                        <button
                          type="button"
                          className="text-[11px] font-semibold uppercase tracking-wide text-primary disabled:text-muted-foreground"
                          onClick={() => setSelectedTopics([])}
                          disabled={selectedTopics.length === 0}
                        >
                          Clear
                        </button>
                      </div>
                      <ScrollArea className="h-48 rounded-xl border border-border/70 bg-background/40 p-3">
                        <div className="flex flex-col gap-2">
                          {availableTopics.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No topics tagged for this track.</span>
                          ) : (
                            availableTopics.map((topic) => {
                              const isChecked = selectedTopics.includes(topic);
                              return (
                                <label key={topic} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      setSelectedTopics((prev) => {
                                        if (checked === true) {
                                          if (prev.includes(topic)) {
                                            return prev;
                                          }
                                          return [...prev, topic];
                                        }
                                        return prev.filter((item) => item !== topic);
                                      });
                                    }}
                                  />
                                  <span className="truncate">{topic}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Acceptance rate
                        </span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            step={1}
                            placeholder="Min %"
                            value={Math.round(acceptanceRange.min)}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isNaN(value)) return;
                              setAcceptanceRange((prev) => {
                                const nextMin = Math.max(0, Math.min(100, value));
                                const next = { ...prev, min: Math.min(nextMin, prev.max) };
                                return next;
                              });
                            }}
                          />
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            step={1}
                            placeholder="Max %"
                            value={Math.round(acceptanceRange.max)}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isNaN(value)) return;
                              setAcceptanceRange((prev) => {
                                const nextMax = Math.max(0, Math.min(100, value));
                                const next = { ...prev, max: Math.max(nextMax, prev.min) };
                                return next;
                              });
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Enter percentages between 0 and 100.</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Frequency score
                        </span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            step={1}
                            placeholder="Min"
                            value={Math.round(frequencyRange.min)}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isNaN(value)) return;
                              setFrequencyRange((prev) => {
                                const nextMin = Math.max(0, Math.min(100, value));
                                const next = { ...prev, min: Math.min(nextMin, prev.max) };
                                return next;
                              });
                            }}
                          />
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={100}
                            step={1}
                            placeholder="Max"
                            value={Math.round(frequencyRange.max)}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isNaN(value)) return;
                              setFrequencyRange((prev) => {
                                const nextMax = Math.max(0, Math.min(100, value));
                                const next = { ...prev, max: Math.max(nextMax, prev.min) };
                                return next;
                              });
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Scores range from 0 (rare) to 100 (frequent).</p>
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
                <div className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-dashed border-border/60 bg-card/40 p-4 backdrop-blur">
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
                        <span className="font-medium text-foreground">Topics:</span> {topicSummary}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Difficulty:</span> {difficultySummary}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Acceptance:</span> {acceptanceSummary}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Frequency:</span> {frequencySummary}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Solutions:</span> {onlyWithSolutions ? "Only with community solutions" : "All"}
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
              visibleProblems.map((problem) => {
                const frequencyValue = typeof problem.frequency === "number" ? problem.frequency : null;
                const acceptanceValue =
                  typeof problem.acceptanceRate === "number" ? problem.acceptanceRate * 100 : null;
                const problemKey = getProblemKey(problem);
                const relatedCompanies = problemCompanyIndex.get(problemKey) ?? [];
                const sortedCompanies = [...relatedCompanies].sort((a, b) => a.name.localeCompare(b.name));
                const displayCompanies = sortedCompanies.slice(0, 8);
                const remainingCompanies = sortedCompanies.length - displayCompanies.length;

                return (
                  <Card
                    key={problem.link}
                    className="transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <CardContent className="flex flex-col gap-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
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
                          <Badge
                            className={cn(
                              "border text-[10px] font-semibold",
                              DIFFICULTY_COLORS[problem.difficulty] ?? "bg-secondary text-secondary-foreground"
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <ProgressCircle
                            value={frequencyValue}
                            label="Frequency"
                            displayLabel="F"
                            size={48}
                            showPercentText={false}
                          />
                          <ProgressCircle
                            value={acceptanceValue}
                            label="Acceptance"
                            displayLabel="A"
                            size={48}
                            showPercentText={false}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 text-[11px]">
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

                      {displayCompanies.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          {displayCompanies.map((entry) => {
                            const isCurrent = selectedCompany?.slug === entry.slug;
                            return (
                              <button
                                key={`${problemKey}-${entry.slug}`}
                                type="button"
                                onClick={() => setSelectedCompanySlug(entry.slug)}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 transition",
                                  isCurrent
                                    ? "border-primary/60 bg-primary/15 text-primary-foreground shadow"
                                    : "border-border/60 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                )}
                              >
                                {entry.name}
                              </button>
                            );
                          })}
                          {remainingCompanies > 0 && (
                            <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-muted-foreground">
                              +{remainingCompanies}
                            </span>
                          )}
                        </div>
                      )}

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
                );
              })
            )}
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + DEFAULT_PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ACCESS_STORAGE_KEY = "career-guide-access";

const resumeProfiles = [
  {
    title: "Front-end Centric Resume",
    points: [
      "Emphasize JavaScript, React, CSS, and HTML depth",
      "Showcase 2-3 AI/ML projects to highlight versatility",
      "Call out UI/UX craftsmanship and responsive patterns",
    ],
  },
  {
    title: "Back-end Centric Resume",
    points: [
      "Focus on server-side frameworks, databases, and API design",
      "Highlight system architecture, scalability, and reliability wins",
      "Add 1-2 AI integrations to surface modern platform awareness",
    ],
  },
  {
    title: "AI-Focused Resume",
    points: [
      "Lead with machine learning, data science, and AI framework expertise",
      "Demonstrate Python, TensorFlow, and PyTorch fluency",
      "Balance theoretical depth with shipped implementations",
    ],
  },
];

const resumeChecklist = [
  {
    title: "ATS Alignment",
    points: [
      "Stick to a single-column layout with standard headings",
      "Export to PDF with embedded fonts to avoid parsing issues",
      "Keep decorative icons and tables out of core sections",
    ],
  },
  {
    title: "Signal Density",
    points: [
      "Lead each bullet with a measurable impact or scope",
      "Group similar wins together to create scanning patterns",
      "Cap resume at one page unless you have 8+ years of experience",
    ],
  },
  {
    title: "Keyword Coverage",
    points: [
      "Mirror terminology from the job description in skills and experience",
      "Blend framework acronyms with their full names for maximum matches",
      "Refresh bullets quarterly so new accomplishments stay visible",
    ],
  },
];

const resumeQuantStarters = [
  "Increased conversion rate by X% by ...",
  "Reduced infrastructure cost by $X through ...",
  "Accelerated release cadence from X to Y via ...",
  "Cut page load times from Xs to Ys by ...",
  "Improved onboarding satisfaction to X/10 by ...",
  "Mentored X engineers resulting in ...",
];

const dsaResources = [
  {
    name: "Striver's SDE Sheet",
    totalQuestions: "180-190",
    source: "takeUforward",
    focus: "Top coding interview problems, company-aligned",
    difficulty: "Medium to Hard",
    duration: "1-2 months",
    href: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems",
  },
  {
    name: "Striver A2Z DSA Course",
    totalQuestions: "455 modules",
    source: "takeUforward",
    focus: "Structured path from fundamentals to advanced",
    difficulty: "Beginner to Advanced",
    duration: "3-4 months (flexible)",
    href: "https://takeuforward.org/course/a2z-dsa-course",
  },
  {
    name: "Love Babbar's DSA Sheet",
    totalQuestions: "450",
    source: "GeeksforGeeks",
    focus: "Topic-wise DSA coverage across core concepts",
    difficulty: "Easy to Hard",
    duration: "2-3 months",
    href: "https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/",
  },
  {
    name: "Arsh Goyal's DSA Sheet",
    totalQuestions: "280+",
    source: "ProElevate",
    focus: "Internship and placement accelerated prep",
    difficulty: "Medium to Hard",
    duration: "45-50 days",
    href: "https://docs.google.com/spreadsheets/d/1FKgrfV0cDXdBwz2ocydAJXoGnRe5c54Db1F5GTruGNA",
  },
  {
    name: "GitHub Collection: All DSA Sheets",
    totalQuestions: "Multiple collections",
    source: "GitHub",
    focus: "Curated list of popular DSA playlists",
    difficulty: "Varies",
    duration: "Varies",
    href: "https://github.com/sadanandpai/dsa-sheet-by-somesh",
  },
];

const frontendRoutine = [
  {
    title: "Daily Warm-up",
    items: [
      "Solve one LeetCode medium focused on arrays or strings",
      "Rebuild a core polyfill without referencing notes",
      "Review one UI accessibility scenario",
    ],
  },
  {
    title: "Weekly Deep Dive",
    items: [
      "Ship a small demo that exercises an advanced browser API",
      "Practice whiteboarding a system design prompt",
      "Record yourself explaining a polyfill to refine clarity",
    ],
  },
  {
    title: "Mock Loop",
    items: [
      "Schedule a pair programming mock interview",
      "Get feedback on communication pacing and tradeoffs",
      "Document takeaways and convert them into flash cards",
    ],
  },
];

const frontendDeepDives = [
  {
    title: "Rendering Strategy",
    items: [
      "CSR vs SSR vs ISR tradeoffs",
      "React concurrency primitives (useTransition, Suspense)",
      "Critical rendering path optimisation",
    ],
  },
  {
    title: "Performance Tooling",
    items: [
      "Chrome Performance panel workflow",
      "Core Web Vitals instrumentation",
      "Bundle analysis with webpack-bundle-analyzer",
    ],
  },
  {
    title: "Testing Coverage",
    items: [
      "Component tests with React Testing Library",
      "Visual regression workflows",
      "Accessibility linting and Storybook a11y",
    ],
  },
];

const interviewStructure = [
  {
    area: "Front-end DSA",
    focus: "Arrays, Strings, Sliding Window, Two Pointers",
    difficulty: "LeetCode Medium",
    rounds: "2-3 DSA + 1 Front-end specific",
  },
  {
    area: "Front-end Polyfills",
    focus: "Array.map, Array.filter, Array.reduce, Promise.all, Function.bind",
    difficulty: "Implementation focused",
    rounds: "Hands-on coding + verbal deep dive",
  },
  {
    area: "Front-end System Design",
    focus: "LRU Cache, Event Emitter, Design Patterns",
    difficulty: "System design concepts",
    rounds: "1 LLD round",
  },
  {
    area: "Back-end DSA",
    focus: "Trees, Graphs, Topological Sort",
    difficulty: "Medium to Hard",
    rounds: "2 DSA + 1 LLD + 1 HLD",
  },
  {
    area: "Back-end System Design",
    focus: "HLD, LLD, Scalability",
    difficulty: "Architecture design",
    rounds: "System design focused",
  },
  {
    area: "React Native",
    focus: "FlatList, Navigation, Performance optimization",
    difficulty: "Front-end + mobile hybrid",
    rounds: "Similar to front-end with mobile focus",
  },
];

const systemDesignFramework = [
  {
    stage: "Clarify Goals",
    focus: "Define users, workloads, and success metrics before solutioning",
  },
  {
    stage: "Propose Baseline",
    focus: "Sketch a simple v1 and highlight known limitations",
  },
  {
    stage: "Scale and Resilience",
    focus: "Add replication, sharding, caching, and failure domains",
  },
  {
    stage: "Deep Dive",
    focus: "Zoom into data models, consistency, and critical endpoints",
  },
  {
    stage: "Tradeoffs",
    focus: "Summarize constraints, monitoring, and future enhancements",
  },
];

const backendScalingPlaybook = [
  {
    title: "Storage",
    points: [
      "Partition by access patterns and isolate hot shards",
      "Adopt CQRS when read/write workloads diverge",
      "Plan archival tiers to control storage spend",
    ],
  },
  {
    title: "Compute",
    points: [
      "Design idempotent workers for replay safety",
      "Use backpressure queues to guard latency targets",
      "Automate horizontal scaling with predictable metrics",
    ],
  },
  {
    title: "Observability",
    points: [
      "Instrument golden signals (latency, traffic, errors, saturation)",
      "Adopt distributed tracing to uncover cross-service lag",
      "Document runbooks for common failure scenarios",
    ],
  },
];

const companyTimelines = [
  { company: "Large / Stable", timeline: "1-2 months for first touch" },
  { company: "Startups", timeline: "1-2 weeks turnaround" },
  { company: "Government / Traditional", timeline: "3-6 weeks" },
];

const coolingPeriods = [
  { company: "Google", period: "12 months from final interview" },
  { company: "Meta / Facebook", period: "12 months standard" },
  { company: "Amazon", period: "6-24 months (Bar Raiser dependent)" },
  { company: "Microsoft", period: "6 months per team" },
  { company: "Apple", period: "6 months post-onsite" },
  { company: "Netflix", period: "6 months" },
  { company: "Uber / Lyft", period: "6 months from first interview" },
];

const jobPlatforms = [
  {
    platform: "InstaHyre",
    type: "AI-powered tech-specific",
    response: "High for tech roles",
    bestFor: "Curated software roles",
    features: "AI matching, vetted postings",
  },
  {
    platform: "LinkedIn",
    type: "Professional networking",
    response: "5x higher with referrals",
    bestFor: "Warm intros and referrals",
    features: "Networking graph, recruiter visibility",
  },
  {
    platform: "Naukri.com",
    type: "General job portal",
    response: "Moderate",
    bestFor: "Volume outreach",
    features: "Large inventory, diverse roles",
  },
  {
    platform: "Direct Applications",
    type: "Company websites",
    response: "Varies",
    bestFor: "Targeted pipelines",
    features: "First-party recruiter touchpoints",
  },
];

const emailTools = [
  {
    tool: "RocketReach",
    freePlan: "Limited searches",
    paidPlan: "$48/mo Essentials",
    size: "700M+ profiles, 35M+ companies",
    features: "Email + phone finder, Chrome extension",
    accuracy: "~85%",
  },
  {
    tool: "Hunter.io",
    freePlan: "25 searches + 50 verifications/mo",
    paidPlan: "$49/mo Starter",
    size: "Large professional index",
    features: "Domain search, verification, outreach",
    accuracy: "SMTP validated",
  },
];

const automationTools = [
  {
    tool: "Apollo.io",
    purpose: "Sequenced outreach",
    freePlan: "Basic tier with limited credits",
    notes: "Automated multi-step email sequences and templating",
  },
  {
    tool: "Clay",
    purpose: "Lead enrichment",
    freePlan: "Trial",
    notes: "Combine LinkedIn, company data, and filters for targeted lists",
  },
  {
    tool: "Notion",
    purpose: "Pipeline tracking",
    freePlan: "Personal plan",
    notes: "Create CRM-style kanban with reminders and checklists",
  },
];

const contentChannels = [
  {
    channel: "Portfolio Case Study",
    ideas: [
      "Publish deep dives on architecture decisions",
      "Include metrics, diagrams, and follow-up iterations",
    ],
  },
  {
    channel: "Technical Writing",
    ideas: [
      "Share lessons from solving interview-style problems",
      "Teach a niche concept in 500-800 words",
    ],
  },
  {
    channel: "Conference or Meetup Talk",
    ideas: [
      "Turn internal presentations into public talks",
      "Record lightning talks to showcase communication",
    ],
  },
];

const reactNativeTesting = [
  {
    title: "Testing Stack",
    points: [
      "Use Jest with React Native Testing Library for component harnesses",
      "Adopt Detox or Maestro for end-to-end flows",
      "Snapshot critical UI states and guard with visual review",
    ],
  },
  {
    title: "Debugging Toolkit",
    points: [
      "React Native Debugger or Flipper for network and layout introspection",
      "Hermes profiler for JS performance insights",
      "Xcode Instruments and Android Profiler for native bottlenecks",
    ],
  },
  {
    title: "Packaging",
    points: [
      "Automate builds with fastlane",
      "Sign releases and manage provisioning profiles early",
      "Stage builds in TestFlight or Internal App Sharing for feedback",
    ],
  },
];

const reactNativeReleaseChecklist = [
  "Audit third-party libraries for active maintenance",
  "Enable crash reporting with Sentry or Firebase Crashlytics",
  "Configure feature flags to ship safely",
  "Document dev setup and release steps for teammates",
];

const outreachTemplate = `Hi <Name>,\n\nI spotted your post about <role> on <platform>. I have <X years> experience building <relevant products>. Most recently at <company> I <impact statement>.\n\nI would love to share how that maps to the problems your team is solving. Are you open to a quick chat this week?\n\nThanks,\n<Your Name>`;

const interviewTrackerColumns = [
  "Company",
  "Role",
  "Contact",
  "Status",
  "Next Action",
  "Interview Notes",
  "Decision",
];

const weeklyCadence = [
  {
    phase: "Mon-Tue",
    focus: "Heavy DSA reps and system design study",
    outcomes: [
      "Solve 6-8 targeted problems",
      "Summarize two design prompts",
      "Update flash card deck",
    ],
  },
  {
    phase: "Wed",
    focus: "Mock interviews and resume tweaks",
    outcomes: [
      "Run pair interview or record self-review",
      "Ship resume adjustments based on feedback",
      "Send outreach to new leads",
    ],
  },
  {
    phase: "Thu-Fri",
    focus: "Application sprints and project work",
    outcomes: [
      "Submit 10-15 quality applications",
      "Advance side project or portfolio case study",
      "Prep for upcoming onsite/rounds",
    ],
  },
  {
    phase: "Weekend",
    focus: "Retrospective and rest",
    outcomes: [
      "Review what worked and what stalled",
      "Adjust study backlog",
      "Rest to maintain long-term pace",
    ],
  },
];

const metricTracking = [
  {
    metric: "Applications sent per week",
    target: "15",
    tooling: "Notion or Airtable board",
  },
  {
    metric: "DSA problems solved",
    target: "25",
    tooling: "LeetCode progress dashboard",
  },
  {
    metric: "Mock interviews completed",
    target: "2",
    tooling: "Pramp, interviewing.io, peer sessions",
  },
  {
    metric: "Offers or final rounds",
    target: "Track cumulative",
    tooling: "Simple spreadsheet snapshot",
  },
];

const sources = [
  {
    label: "Sakshi Gawande - 12 JavaScript Polyfills",
    href: "https://www.linkedin.com/posts/sakshi-gawande_javascript-interview-questions-12-polyfills-activity-7303040345187999744-iIkh",
  },
  {
    label: "PlainEnglish - Polyfills for Interviews",
    href: "https://javascript.plainenglish.io/javascript-polyfills-for-interviews-f48c947a326",
  },
  {
    label: "DevTools.tech - Array Polyfills",
    href: "https://devtools.tech/blog/top-10-javascript-interview-questions-based-on-array-polyfills---rid---oNzRUjONl4YB5ixIEGrl",
  },
  {
    label: "GreatFrontEnd - Polyfills Focus Areas",
    href: "https://www.greatfrontend.com/interviews/focus-areas/javascript-polyfills",
  },
  {
    label: "PlainEnglish - Essential JavaScript Polyfills (2025)",
    href: "https://javascript.plainenglish.io/essential-javascript-polyfills-every-developer-should-know-in-2025-b096cdd5fd38",
  },
  {
    label: "YouTube - Namaste JavaScript Polyfills",
    href: "https://www.youtube.com/watch?v=Th3rZjfKKhI",
  },
  {
    label: "Tech Interview Handbook - System Design",
    href: "https://www.techinterviewhandbook.org/system-design/",
  },
  {
    label: "Awesome System Design Resources",
    href: "https://github.com/ashishps1/awesome-system-design-resources",
  },
  {
    label: "Reddit - System Design Preparation",
    href: "https://www.reddit.com/r/leetcode/comments/1el083l/the_best_way_to_prepare_for_system_design/",
  },
  {
    label: "Educative - Grokking the System Design Interview",
    href: "https://www.educative.io/courses/grokking-the-system-design-interview",
  },
  {
    label: "Zappyhire - Cooling Period Overview",
    href: "https://zappyhire.com/resources/hr-glossary/cooling-period",
  },
  {
    label: "LinkedIn - Interview Cool-off Overview",
    href: "https://www.linkedin.com/pulse/interview-cool-off-period-does-need-review-mayank-srivastava",
  },
  {
    label: "Reddit - Amazon Cooling Period",
    href: "https://www.reddit.com/r/recruiting/comments/v4u4lr/question_for_amazon_recruiters_regarding_cool/",
  },
  {
    label: "LeetCode Discuss - Cooling Periods",
    href: "https://leetcode.com/discuss/career/771157/cool-down-period-for-all-faangs-number-of-tries-and-different-job-posts",
  },
  {
    label: "Zoho Recruit - Cooling Off Period",
    href: "https://help.zoho.com/portal/en/kb/recruit/customization/cooling-off-period/articles/cooling-off-period",
  },
  {
    label: "interviewing.io - System Design Guide",
    href: "https://interviewing.io/guides/system-design-interview",
  },
  {
    label: "ByteByteGo - System Design Framework",
    href: "https://bytebytego.com/courses/system-design-interview/a-framework-for-system-design-interviews",
  },
  {
    label: "LinkedIn - Cooling Period FAQ",
    href: "https://www.linkedin.com/posts/kdumanoir_question-i-get-a-lot-is-is-there-a-set-activity-7284695444188737537-nZ2o",
  },
  {
    label: "GreatFrontEnd - Top JavaScript Interview Questions",
    href: "https://github.com/greatfrontend/top-javascript-interview-questions",
  },
  {
    label: "Hello Interview - System Design in a Hurry",
    href: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction",
  },
];

export function JobPrepGuide() {
  const [activeTab, setActiveTab] = useState("resume");
  const [hasAccess, setHasAccess] = useState(false);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.sessionStorage.getItem(ACCESS_STORAGE_KEY);
    if (stored === "true") {
      setHasAccess(true);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Enter the access code provided by your admin.");
      return;
    }

    setMessage(null);
    setStatus("idle");

    startTransition(async () => {
      try {
        const response = await fetch("/api/career-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: trimmed }),
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = (await response.json()) as { valid?: boolean };

        if (data.valid) {
          setHasAccess(true);
          setStatus("success");
          setCode("");
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(ACCESS_STORAGE_KEY, "true");
          }
        } else {
          setStatus("error");
          setMessage("That code did not match. Try again or contact the admin.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong. Retry in a moment.");
      }
    });
  };

  return (
    <div className="container">
      <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Job Preparation & Application Guide
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Comprehensive Technical Interview Strategy
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Build focused resumes, sharpen technical depth, and run an intentional application process tailored for front-end, back-end, and AI-heavy roles.
            </p>
          </div>
        </header>

        {!hasAccess ? (
          <div className="mx-auto mt-6 max-w-md">
            <div className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm backdrop-blur">
              <h3 className="text-xl font-semibold text-foreground">Access Required</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the access code provided by your mentor or admin to unlock the full career preparation guide.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="career-access-code"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Access Code
                  </label>
                  <Input
                    id="career-access-code"
                    type="password"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter access code"
                    autoComplete="off"
                    disabled={isPending}
                  />
                </div>
                {message && (
                  <p className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                    {message}
                  </p>
                )}
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? "Verifying..." : "Unlock Guide"}
                </Button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">
                Access persists for this browser session. Close the tab to lock the guide again.
              </p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex min-w-full flex-nowrap gap-2 bg-transparent p-0">
                <TabsTrigger value="resume" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  Resume Strategy
                </TabsTrigger>
                <TabsTrigger value="frontend" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  Front-end Prep
                </TabsTrigger>
                <TabsTrigger value="backend" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  Back-end Prep
                </TabsTrigger>
                <TabsTrigger value="reactnative" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  React Native Track
                </TabsTrigger>
                <TabsTrigger value="applications" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  Application Strategy
                </TabsTrigger>
                <TabsTrigger value="tools" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  Tools & Platforms
                </TabsTrigger>
                <TabsTrigger value="timeline" className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm">
                  Timeline & Metrics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="resume" className="mt-6">
            <section className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Targeted Resume Portfolio</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ship three tailored narratives that let you pivot across company size and product focus without rewriting from scratch.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {resumeProfiles.map((profile) => (
                    <div key={profile.title} className="rounded-xl border border-border bg-background/60 p-4">
                      <h4 className="text-base font-semibold text-foreground">{profile.title}</h4>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {profile.points.map((point) => (
                          <li key={point} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-border p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rationale</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enterprise teams typically optimise for depth in a single discipline, while high-velocity startups prefer adaptable full-stack builders. Maintaining focused resumes lets you accelerate applications without diluting the signal each hiring loop expects.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Resume Quality Checklist</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {resumeChecklist.map((card) => (
                    <div key={card.title} className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="text-base font-semibold text-foreground">{card.title}</p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {card.points.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Quantifiable Bullet Starters</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use these prompts to keep every line outcome-driven. Swap placeholders with your metrics and timeframes.
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  {resumeQuantStarters.map((starter) => (
                    <li key={starter} className="rounded-lg border border-dashed border-border/70 bg-background/50 px-3 py-2">
                      {starter}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="frontend" className="mt-6">
            <section className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground">DSA & Polyfills for Front-end Interviews</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Center your practice on medium-difficulty problem solving, mastering the implementation details that interviewers routinely probe.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <h4 className="text-base font-semibold text-foreground">Priority DSA Topics</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>Arrays & string transforms</li>
                      <li>Sliding window optimisations</li>
                      <li>Two pointers and partitioning strategies</li>
                      <li>Hash maps & set-based lookups</li>
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Target LeetCode mediums for repeatable success across most front-end interviews.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <h4 className="text-base font-semibold text-foreground">Critical Polyfills</h4>
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">Array prototypes</p>
                        <p>map, filter, reduce, forEach, includes, indexOf, find, findIndex</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Promise utilities</p>
                        <p>all, race, resolve, reject</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Function helpers</p>
                        <p>bind, call, apply</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Advanced scenarios</p>
                        <p>Array.flat, Object.create, async/await, requestAnimationFrame, fetch via XHR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground">Essential DSA Resources</h4>
                <div className="overflow-x-auto">
                  <table className="mt-3 w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Resource</th>
                        <th className="px-3 py-2 font-medium">Questions</th>
                        <th className="px-3 py-2 font-medium">Source</th>
                        <th className="px-3 py-2 font-medium">Focus</th>
                        <th className="px-3 py-2 font-medium">Difficulty</th>
                        <th className="px-3 py-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dsaResources.map((resource) => (
                        <tr key={resource.name} className="text-muted-foreground">
                          <td className="px-3 py-3 text-foreground">
                            <a
                              href={resource.href}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-primary hover:underline"
                            >
                              {resource.name}
                            </a>
                          </td>
                          <td className="px-3 py-3">{resource.totalQuestions}</td>
                          <td className="px-3 py-3">{resource.source}</td>
                          <td className="px-3 py-3">{resource.focus}</td>
                          <td className="px-3 py-3">{resource.difficulty}</td>
                          <td className="px-3 py-3">{resource.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground">Low-Level System Design Focus</h4>
                <ul className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                  <li className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">LRU Cache</p>
                    <p className="mt-1 text-sm">Map + doubly-linked list for O(1) access and eviction.</p>
                  </li>
                  <li className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">Event Emitter</p>
                    <p className="mt-1 text-sm">Implement subscribe, emit, once, and off semantics.</p>
                  </li>
                  <li className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">Observer Pattern</p>
                    <p className="mt-1 text-sm">Model reactive streams and dependency propagation.</p>
                  </li>
                  <li className="rounded-xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">Singleton Pattern</p>
                    <p className="mt-1 text-sm">Enforce single-instance lifecycle across modules.</p>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Practice Cadence</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {frontendRoutine.map((card) => (
                    <div key={card.title} className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="text-base font-semibold text-foreground">{card.title}</p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {card.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Deep Dive Topics</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Rotate through advanced themes so your interview stories demonstrate breadth as well as execution detail.
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {frontendDeepDives.map((topic) => (
                    <div key={topic.title} className="space-y-2 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">{topic.title}</p>
                      <ul className="space-y-1">
                        {topic.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="backend" className="mt-6">
            <section className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Advanced Back-end Interview Prep</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deepen algorithmic fundamentals while scaling your system design vocabulary.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <h4 className="text-base font-semibold text-foreground">Core Algorithm Domains</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>Trees: BSTs, AVL rotations, traversal pairs</li>
                      <li>Graphs: DFS/BFS, shortest paths, connectivity</li>
                      <li>Topological ordering and dependency graphs</li>
                      <li>Dynamic programming for optimisation trade-offs</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-background/60 p-4">
                    <h4 className="text-base font-semibold text-foreground">System Design Mastery</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li>Microservices vs monolith trade-offs</li>
                      <li>SQL vs NoSQL decision matrix</li>
                      <li>Caching tiers with Redis or Memcached</li>
                      <li>Load balancing, queues, and event-driven flows</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground">Interview Flow Expectations</h4>
                <div className="overflow-x-auto">
                  <table className="mt-3 w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Area</th>
                        <th className="px-3 py-2 font-medium">Focus</th>
                        <th className="px-3 py-2 font-medium">Difficulty</th>
                        <th className="px-3 py-2 font-medium">Rounds</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {interviewStructure.map((row) => (
                        <tr key={row.area} className="text-muted-foreground">
                          <td className="px-3 py-3 text-foreground">{row.area}</td>
                          <td className="px-3 py-3">{row.focus}</td>
                          <td className="px-3 py-3">{row.difficulty}</td>
                          <td className="px-3 py-3">{row.rounds}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Typical Back-end Loop</h4>
                  <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Two algorithmic rounds tackling medium-high difficulty cases</li>
                    <li>One low-level design session modelling classes and interactions</li>
                    <li>One high-level architecture review focusing on scale and resiliency</li>
                  </ol>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Recommended Resources</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <a href="https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        System Design in a Hurry
                      </a>
                      {" - quick HLD refreshers"}
                    </li>
                    <li>
                      <a href="https://www.educative.io/courses/grokking-the-system-design-interview" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        Grokking the System Design Interview
                      </a>
                      {" - structured design drills"}
                    </li>
                    <li>
                      <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        System Design Primer
                      </a>
                      {" - open-source knowledge base"}
                    </li>
                    <li>
                      <a href="https://www.techinterviewhandbook.org/system-design/" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        Tech Interview Handbook
                      </a>
                      {" - curated pathway"}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">System Design Walkthrough Framework</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Structure your answer so interviewers see intentional tradeoffs and clear prioritisation.
                </p>
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {systemDesignFramework.map((step) => (
                    <li key={step.stage} className="rounded-lg border border-dashed border-border/70 bg-background/50 px-3 py-2">
                      <span className="font-semibold text-foreground">{step.stage}:</span> {step.focus}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Scaling Playbook</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {backendScalingPlaybook.map((section) => (
                    <div key={section.title} className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="text-base font-semibold text-foreground">{section.title}</p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {section.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="reactnative" className="mt-6">
            <section className="space-y-6">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h3 className="text-xl font-semibold text-foreground">React Native Specialisation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Blend front-end craftsmanship with mobile-specific performance considerations.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">FlatList Mastery</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Virtualisation knobs for large datasets</li>
                    <li>Efficient <code>renderItem</code> and <code>keyExtractor</code> patterns</li>
                    <li>Infinite scroll, pagination, and memoisation</li>
                    <li>Memory profiling for sustainable performance</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Navigation Systems</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Stack, Tab, Drawer orchestration via React Navigation</li>
                    <li>Deep links and state persistence</li>
                    <li>Native navigation perf tuning</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Performance Toolkit</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Guard against memory leaks and stale refs</li>
                    <li>Hold 60 FPS via profiling and batching</li>
                    <li>Bundle size trimming and lazy loading</li>
                    <li>Native module integration and bridging</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Testing and Debugging Essentials</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {reactNativeTesting.map((card) => (
                    <div key={card.title} className="rounded-xl border border-border bg-background/60 p-4">
                      <p className="text-base font-semibold text-foreground">{card.title}</p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {card.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Release Readiness Checklist</h4>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  {reactNativeReleaseChecklist.map((item) => (
                    <li key={item} className="rounded-lg border border-dashed border-border/70 bg-background/50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <section className="space-y-8">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h3 className="text-xl font-semibold text-foreground">Strategic Application Process</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Apply while iterating on preparation so real interviews feed back into your learning loop.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Parallel Prep & Apply</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Launch applications as you upskill; waiting for a so-called perfect moment slows feedback and dulls momentum.
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {companyTimelines.map((item) => (
                      <p key={item.company} className="flex items-center justify-between rounded-lg border border-dashed border-border/70 bg-background/50 px-3 py-2">
                        <span className="font-medium text-foreground">{item.company}</span>
                        <span>{item.timeline}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Cooling Period Intel</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Track mandatory waiting windows to avoid wasted outreach.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-muted/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                          <th className="px-2 py-2 font-medium">Company</th>
                          <th className="px-2 py-2 font-medium">Cooling Period</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {coolingPeriods.map((row) => (
                          <tr key={row.company} className="text-muted-foreground">
                            <td className="px-2 py-2 text-foreground">{row.company}</td>
                            <td className="px-2 py-2">{row.period}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-muted-foreground sm:text-sm">
                    <li>Resume rejections usually do not trigger cooling periods.</li>
                    <li>Technical interview outcomes reset the timer.</li>
                    <li>Teams within the same company may operate independent clocks.</li>
                    <li>Exceptional cases occasionally secure waivers; stay in touch with recruiters.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Advanced Application Tactics</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Multi-profile strategy</p>
                    <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Maintain three targeted profiles using unique emails.</li>
                      <li>Position each profile for front-end, back-end, and AI/full-stack roles.</li>
                      <li>Track outreach to avoid overlapping signals.</li>
                    </ol>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Recruiter contact flow</p>
                    <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Identify the hiring manager from the posting.</li>
                      <li>Locate their LinkedIn presence and recent activity.</li>
                      <li>Use email finder workflows to derive a direct contact.</li>
                      <li>Send a concise outreach referencing shared context.</li>
                    </ol>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Referral activation</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Message 30-40 LinkedIn connections each week.</li>
                      <li>Tap alumni networks and community groups.</li>
                      <li>Engage with employee content before requesting referrals.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Personalised Outreach Template</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tailor each variable so recruiters immediately see relevance. Keep it concise and value-forward.
                </p>
                <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-dashed border-border/70 bg-background/50 p-4 text-sm text-muted-foreground">
{outreachTemplate}
                </pre>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Interview Tracker Blueprint</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track every opportunity in a lightweight CRM so follow-ups and preparation steps never slip.
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  {interviewTrackerColumns.map((column) => (
                    <li key={column} className="rounded-lg border border-dashed border-border/70 bg-background/50 px-3 py-2">
                      {column}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <section className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Job Platform Optimisation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Prioritise channels with higher recruiter response velocity while diversifying top-of-funnel opportunities.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Platform</th>
                        <th className="px-3 py-2 font-medium">Type</th>
                        <th className="px-3 py-2 font-medium">Response Rate</th>
                        <th className="px-3 py-2 font-medium">Best For</th>
                        <th className="px-3 py-2 font-medium">Key Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {jobPlatforms.map((row) => (
                        <tr key={row.platform} className="text-muted-foreground">
                          <td className="px-3 py-3 text-foreground">{row.platform}</td>
                          <td className="px-3 py-3">{row.type}</td>
                          <td className="px-3 py-3">{row.response}</td>
                          <td className="px-3 py-3">{row.bestFor}</td>
                          <td className="px-3 py-3">{row.features}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground">Email Discovery Stack</h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Tool</th>
                        <th className="px-3 py-2 font-medium">Free Plan</th>
                        <th className="px-3 py-2 font-medium">Paid Plans</th>
                        <th className="px-3 py-2 font-medium">Database Size</th>
                        <th className="px-3 py-2 font-medium">Key Features</th>
                        <th className="px-3 py-2 font-medium">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {emailTools.map((row) => (
                        <tr key={row.tool} className="text-muted-foreground">
                          <td className="px-3 py-3 text-foreground">{row.tool}</td>
                          <td className="px-3 py-3">{row.freePlan}</td>
                          <td className="px-3 py-3">{row.paidPlan}</td>
                          <td className="px-3 py-3">{row.size}</td>
                          <td className="px-3 py-3">{row.features}</td>
                          <td className="px-3 py-3">{row.accuracy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">Workflow Automation Stack</h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Tool</th>
                        <th className="px-3 py-2 font-medium">Purpose</th>
                        <th className="px-3 py-2 font-medium">Free Plan</th>
                        <th className="px-3 py-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {automationTools.map((row) => (
                        <tr key={row.tool} className="text-muted-foreground">
                          <td className="px-3 py-3 text-foreground">{row.tool}</td>
                          <td className="px-3 py-3">{row.purpose}</td>
                          <td className="px-3 py-3">{row.freePlan}</td>
                          <td className="px-3 py-3">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Brand-Building Channels</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Consistently publish and share work so recruiters discover you even before you apply.
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {contentChannels.map((channel) => (
                    <div key={channel.channel} className="space-y-2 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">{channel.channel}</p>
                      <ul className="space-y-1">
                        {channel.ideas.map((idea) => (
                          <li key={idea}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <section className="space-y-8">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h3 className="text-xl font-semibold text-foreground">3-4 Month Execution Roadmap</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Stagger preparation, live interviews, and offer negotiation to smooth the learning curve.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Month 1 - DSA Foundation</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Finish 150+ Striver SDE Sheet problems.</li>
                    <li>Double down on arrays, strings, and baseline algorithms.</li>
                    <li>Start implementing polyfills to reinforce JavaScript internals.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Month 2 - Specialisation</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Deep dive into role-aligned topics (front-end/back-end).</li>
                    <li>Invest in system design foundations and case studies.</li>
                    <li>Schedule mock interviews to surface gaps.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Month 3 - Live Applications</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Launch active job applications with refined resumes.</li>
                    <li>Use startup interviews as rehearsal loops.</li>
                    <li>Iterate on feedback between rounds.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <h4 className="text-base font-semibold text-foreground">Month 4 - Optimise & Close</h4>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>Target preferred companies with sharpened storytelling.</li>
                    <li>Polish system design narratives and whiteboard flow.</li>
                    <li>Navigate offers and negotiation strategy.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Weekly Execution Cadence</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use a repeatable rhythm so preparation, outreach, and rest all receive focus.
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {weeklyCadence.map((block) => (
                    <div key={block.phase} className="rounded-lg border border-dashed border-border/70 bg-background/50 p-4">
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{block.phase}</p>
                      <p className="mt-1 text-base font-semibold text-foreground">{block.focus}</p>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {block.outcomes.map((outcome) => (
                          <li key={outcome}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <h4 className="text-base font-semibold text-foreground">Continuous Improvement Loop</h4>
                <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Apply broadly across experience levels to gather signal.</li>
                  <li>Interview with a checklist-driven strategy.</li>
                  <li>Analyse feedback, flag weak areas, and set micro-goals.</li>
                  <li>Iterate with targeted study blocks.</li>
                  <li>Refine resumes and storytelling as metrics shift.</li>
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground">Metric Dashboard</h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Metric</th>
                        <th className="px-3 py-2 font-medium">Target</th>
                        <th className="px-3 py-2 font-medium">Tooling</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {metricTracking.map((row) => (
                        <tr key={row.metric} className="text-muted-foreground">
                          <td className="px-3 py-3 text-foreground">{row.metric}</td>
                          <td className="px-3 py-3">{row.target}</td>
                          <td className="px-3 py-3">{row.tooling}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-border p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Success Metrics</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Interview-to-offer conversion rate</li>
                  <li>Technical round pass percentage</li>
                  <li>Salary growth versus current baseline</li>
                  <li>Progression in company tier targets</li>
                </ul>
              </div>
            </section>
          </TabsContent>
        </Tabs>
        )}

        <footer className="mt-8 rounded-xl border border-border bg-background/60 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reference Library</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Deepen specific areas with the curated sources that informed this playbook.
          </p>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </div>
  );
}

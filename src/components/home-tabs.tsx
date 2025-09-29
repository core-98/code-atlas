"use client";

import { useState } from "react";

import { CompanyExplorer, type CompaniesDataset } from "@/components/company-explorer";
import { JobPrepGuide } from "@/components/job-prep-guide";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HomeTabsProps = {
  data: CompaniesDataset;
  refresherMarkdown: string;
};

export function HomeTabs({ data, refresherMarkdown }: HomeTabsProps) {
  const [value, setValue] = useState("companies");

  return (
    <div className="pb-6 pt-4 sm:pb-8 sm:pt-6">
      <Tabs value={value} onValueChange={setValue} className="w-full">
        <TabsList className="container mb-4 flex w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger
            value="companies"
            className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm"
          >
            Companies Explorer
          </TabsTrigger>
          <TabsTrigger
            value="refresher"
            className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm"
          >
            C++ Refresher
          </TabsTrigger>
          <TabsTrigger
            value="job-guide"
            className="rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground md:text-sm"
          >
            Career Prep Guide
          </TabsTrigger>
        </TabsList>
        <TabsContent value="companies" className="mt-0">
          <CompanyExplorer initialData={data} />
        </TabsContent>
        <TabsContent value="refresher" className="mt-0">
          <div className="container">
            <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur sm:p-6">
              <div className="mb-4 flex flex-col gap-1 sm:mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Crash Course Companion
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Modern C++ Refresher
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Quick reference for language and STL essentials. Curated for interview sprint prep.
                </p>
              </div>
              <MarkdownRenderer markdown={refresherMarkdown} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="job-guide" className="mt-0">
          <JobPrepGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}

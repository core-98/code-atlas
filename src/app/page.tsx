import fs from "node:fs/promises";
import path from "node:path";

import { type CompaniesDataset } from "@/components/company-explorer";
import { HomeTabs } from "@/components/home-tabs";

export const revalidate = 86400; // revalidate once per day

async function loadCompanies(): Promise<CompaniesDataset> {
  const filePath = path.join(process.cwd(), "public", "data", "companies.json");
  const fileContent = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContent) as CompaniesDataset;
}

async function loadCppRefresher(): Promise<string> {
  const filePath = path.join(process.cwd(), "c_stl_crash_course.md");
  return fs.readFile(filePath, "utf8");
}

export default async function HomePage() {
  const [data, refresherMarkdown] = await Promise.all([loadCompanies(), loadCppRefresher()]);

  return <HomeTabs data={data} refresherMarkdown={refresherMarkdown} />;
}

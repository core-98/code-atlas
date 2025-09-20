import fs from "node:fs/promises";
import path from "node:path";

import { CompanyExplorer, type CompaniesDataset } from "@/components/company-explorer";

export const revalidate = 86400; // revalidate once per day

async function loadCompanies(): Promise<CompaniesDataset> {
  const filePath = path.join(process.cwd(), "public", "data", "companies.json");
  const fileContent = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileContent) as CompaniesDataset;
}

export default async function HomePage() {
  const data = await loadCompanies();
  return <CompanyExplorer initialData={data} />;
}

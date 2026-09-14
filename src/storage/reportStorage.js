import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function reportPath(city, reportsDir) {
  const date = new Date().toISOString().slice(0, 10);
  const safeCity = city.replace(/\s+/g, '_');
  return path.join(reportsDir, `${safeCity}-${date}.json`);
}

export async function readCachedReport(city, { reportsDir }) {
  try {
    const content = await readFile(reportPath(city, reportsDir), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveReport(city, report, { reportsDir }) {
  await mkdir(reportsDir, { recursive: true });
  await writeFile(reportPath(city, reportsDir), JSON.stringify(report, null, 2));
}
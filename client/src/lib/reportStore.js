const STORAGE_KEY = "risklens.reports.v1";

export function listReports() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveReport(report) {
  const reports = listReports();
  const nextReport = {
    id: report.id || crypto.randomUUID(),
    createdAt: report.createdAt || new Date().toISOString(),
    ...report,
  };
  const next = [nextReport, ...reports.filter((item) => item.id !== nextReport.id)].slice(0, 25);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("risklens:reports-updated"));
  return nextReport;
}

export function clearReports() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("risklens:reports-updated"));
}

export function useReportStoreSnapshot() {
  return listReports();
}

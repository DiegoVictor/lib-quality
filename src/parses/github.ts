export interface RepositoryRequest {
  id: number;
  name: string;
  full_name: string;
  open_issues_count: number;
}

export interface RepositoryResponse {
  id: number;
  name: string;
  full_name: string;
}

export interface RepoOpenedIssuesStats {
  name: string;
  open_issues: number;
  average: number;
  deviation: number;
}

export interface RepoIssuesChartStats {
  labels: string[];
  datasets: { data: number[] }[];
}

export interface RepoIssueCountByDate {
  [key: string]: number;
}

export const responseRepository = ({
  id,
  name,
  full_name,
}: RepositoryRequest): RepositoryResponse => ({
  id,
  name,
  full_name,
});

export const responseRepositoryOpenedStats = (
  name: string,
  open_issues_count: number,
  average: number,
  deviation: number,
): RepoOpenedIssuesStats => ({
  name,
  open_issues: open_issues_count,
  average,
  deviation,
});

export const responseRepositoryIssuesStats = (
  opened: RepoIssueCountByDate,
  closed: RepoIssueCountByDate,
): RepoIssuesChartStats => ({
  labels: Object.keys(opened),
  datasets: [{ data: Object.values(opened) }, { data: Object.values(closed) }],
});

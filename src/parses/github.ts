import randomColor from 'randomcolor';

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

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export interface RepoIssuesChartStats {
  labels: string[];
  datasets: Dataset[];
}

export interface RepoIssueCountByDate {
  [key: string]: number;
}

export interface RepoIssuesChartStatsRequest {
  [key: string]: {
    opened: RepoIssueCountByDate;
    closed: RepoIssueCountByDate;
  };
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
  issuesByDate: RepoIssuesChartStatsRequest,
): RepoIssuesChartStats => {
  const datasets: Dataset[] = [];
  const labels: string[] = [];

  Object.keys(issuesByDate).forEach(repo => {
    if (labels.length === 0) {
      Object.keys(issuesByDate[repo].opened).forEach(date => labels.push(date));
    }

    datasets.push({
      label: `${repo} - Opened Issues`,
      data: Object.values(issuesByDate[repo].opened),
      borderColor: randomColor(),
      backgroundColor: 'transparent',
    });

    datasets.push({
      label: `${repo} - Closed Issues`,
      data: Object.values(issuesByDate[repo].closed),
      borderColor: randomColor(),
      backgroundColor: 'transparent',
    });
  });

  return {
    labels,
    datasets,
  };
};

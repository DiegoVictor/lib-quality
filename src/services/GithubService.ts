import axios, { AxiosResponse } from 'axios';

import {
  RepositoryResponse,
} from '../parses/github';
interface RepoSearchResult {
  items: RepositoryRequest[];
}
const http = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

export const searchRepositoryByName = async (
  q: string,
): Promise<RepositoryResponse[]> => {
  const { data } = await http.get<RepoSearchResult>('/search/repositories', {
    params: { q, order: 'desc' },
  });

  return data.items
    .slice(0, 10)
    .map(repository => responseRepository(repository));
};

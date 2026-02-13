import apiClient from './axios';
import { API_ENDPOINTS } from '../constants';
import type { Party, PaginatedResponse } from '../types';

export interface PartiesParams {
  search?: string;
  state?: string;
  party_type?: string;
  page?: number;
  page_size?: number;
}

export interface PartyFieldOptionsResponse {
  state?: string[];
  party_type?: string[];
}

export const getPartiesPaginated = async (
  page: number = 1,
  pageSize: number = 25,
  params?: Omit<PartiesParams, 'page' | 'page_size'>
): Promise<PaginatedResponse<Party>> => {
  const requestParams: Record<string, unknown> = { page, page_size: pageSize };
  if (params?.search?.trim()) requestParams.search = params.search.trim();
  if (params?.state) requestParams.state = params.state;
  if (params?.party_type) requestParams.party_type = params.party_type;

  const response = await apiClient.get<PaginatedResponse<Party>>(
    API_ENDPOINTS.PARTIES,
    { params: requestParams }
  );
  return response.data;
};

export const getParty = async (id: number): Promise<Party> => {
  const response = await apiClient.get<Party>(
    API_ENDPOINTS.PARTY(id.toString())
  );
  return response.data;
};

export const createParty = async (data: Partial<Party>): Promise<Party> => {
  const response = await apiClient.post<Party>(API_ENDPOINTS.PARTIES, data);
  return response.data;
};

export const updateParty = async (
  id: number,
  data: Partial<Party>
): Promise<Party> => {
  const response = await apiClient.patch<Party>(
    API_ENDPOINTS.PARTY(id.toString()),
    data
  );
  return response.data;
};

export const deleteParty = async (id: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.PARTY(id.toString()));
};

export const getPartyFieldOptions = async (
  fields?: string
): Promise<PartyFieldOptionsResponse> => {
  const response = await apiClient.get<PartyFieldOptionsResponse>(
    API_ENDPOINTS.PARTIES_FIELD_OPTIONS,
    { params: fields ? { fields } : {} }
  );
  return response.data;
};

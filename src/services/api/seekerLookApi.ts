import { axiosClient } from '../../api/axiosClient';
import { LookupOption } from '../../models/lookup';

export const SEEKER_LOOK_ENDPOINTS = {
  ITEM: '/api/lookingfor/product',
  PROFESSION: '/api/professions',
  DO_YOU: '/api/referral-sources',
} as const;


interface LookupApiItemRaw {
  id: number | string;
  title?: string | null;
  name?: string | null;
}

type LookupResponse =
  | LookupApiItemRaw[]
  | {
      success?: boolean;
      data?: LookupApiItemRaw[];
    };

function normalizeLookupResponse(payload: LookupResponse): LookupOption[] {
  const list = Array.isArray(payload) ? payload : payload.data;
  if (!Array.isArray(list)) {
    throw new Error('Invalid lookup response');
  }

  return list
    .map(entry => {
      const title = entry?.title ?? entry?.name;
      return {
        id: entry?.id,
        title,
      };
    })
    .filter(entry => entry.id !== undefined && Boolean(entry.title))
    .map(entry => ({
      id: entry.id,
      title: String(entry.title),
    }));
}

export const seekerLookApi = {
  getItems: async (): Promise<LookupOption[]> => {
    const response = await axiosClient.get<LookupResponse>(SEEKER_LOOK_ENDPOINTS.ITEM);
    return normalizeLookupResponse(response.data);
  },

  getProfessions: async (): Promise<LookupOption[]> => {
    const response = await axiosClient.get<LookupResponse>(SEEKER_LOOK_ENDPOINTS.PROFESSION);
    return normalizeLookupResponse(response.data);
  },

  getDoYouOptions: async (): Promise<LookupOption[]> => {
    const response = await axiosClient.get<LookupResponse>(SEEKER_LOOK_ENDPOINTS.DO_YOU);
    return normalizeLookupResponse(response.data);
  },
};

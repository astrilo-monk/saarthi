import { Member } from ".";

const MEMBER_STORAGE_KEY = 'member-store';

export const getCurrentMember = async (): Promise<Member | null> => {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(MEMBER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored)?.member ?? null;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

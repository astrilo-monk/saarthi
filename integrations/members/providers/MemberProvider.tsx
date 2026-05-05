import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { MemberActions, MemberContext, MemberState } from '.';
import { Member } from '..';

// Local storage key
const MEMBER_STORAGE_KEY = 'member-store';

// Demo member for local auth
const DEMO_MEMBER: Member = {
  loginEmail: 'student@campus.edu',
  loginEmailVerified: true,
  status: 'APPROVED',
  contact: {
    firstName: 'Demo',
    lastName: 'Student',
  },
  profile: {
    nickname: 'DemoStudent',
    title: 'Student',
  },
  _createdDate: new Date(),
  lastLoginDate: new Date(),
};

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<MemberState>(() => {
    let storedMemberData: Member | null = null;
    let isAuthenticated = false;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MEMBER_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          if (parsedData?.member) {
            storedMemberData = parsedData.member;
            isAuthenticated = true;
          }
        }
      } catch (error) {
        console.error('Error loading member state from localStorage:', error);
      }
    }

    return {
      member: storedMemberData,
      isAuthenticated,
      isLoading: false,
      error: null,
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (state.member && state.isAuthenticated) {
          localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify({ member: state.member }));
        } else {
          localStorage.removeItem(MEMBER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving member state to localStorage:', error);
      }
    }
  }, [state]);

  // Update state helper
  const updateState = useCallback((updates: Partial<MemberState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Member actions
  const actions: MemberActions = {
    /**
     * Load current member from localStorage
     */
    loadCurrentMember: useCallback(async () => {
      try {
        if (typeof window === 'undefined') {
          updateState({ isLoading: false, isAuthenticated: false, member: null });
          return;
        }

        const stored = localStorage.getItem(MEMBER_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          if (parsedData?.member) {
            updateState({
              member: parsedData.member,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }

        updateState({
          member: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch (err) {
        updateState({
          error: err instanceof Error ? err.message : 'Failed to load member',
          member: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, [updateState]),

    /**
     * Login - saves demo member to localStorage
     */
    login: useCallback(() => {
      updateState({
        member: DEMO_MEMBER,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    }, [updateState]),

    /**
     * Logout - clears member from localStorage
     */
    logout: useCallback(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(MEMBER_STORAGE_KEY);
        } catch (error) {
          console.error('Error clearing member state from localStorage:', error);
        }
      }

      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),

    /**
     * Clear member state
     */
    clearMember: useCallback(() => {
      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),
  };

  // Context value
  const contextValue = {
    ...state,
    actions,
  };

  return (
    <MemberContext.Provider value={contextValue}>
      {children}
    </MemberContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UniversalStudent, IndependentTeacher, Institution, ParentUser } from '../types';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  userProfile: UniversalStudent | IndependentTeacher | Institution | ParentUser | null;
  login: (email: string, password: string, overrideRole?: string) => Promise<boolean>;
  register: (email: string, fullName: string, countryCode: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  switchStudentContext: (institutionId?: string) => void;
  currentContext: 'independent' | 'institutional' | 'mixed';
  countryCode: string;
  setCountryCode: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UniversalStudent | IndependentTeacher | Institution | ParentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentContext, setCurrentContext] = useState<'independent' | 'institutional' | 'mixed'>('mixed');
  const [countryCode, setCountryCodeState] = useState<string>('uganda');

  const setCountryCode = (code: string) => {
    setCountryCodeState(code);
    localStorage.setItem('maple-auth-country', code);
  };

  useEffect(() => {
    // Check for stored auth state
    const storedUser = localStorage.getItem('maple-auth-user');
    const storedProfile = localStorage.getItem('maple-auth-profile');
    const storedContext = localStorage.getItem('maple-auth-context');
    const storedCountry = localStorage.getItem('maple-auth-country');
    
    if (storedCountry) {
      setCountryCodeState(storedCountry);
    }

    if (storedUser && storedProfile) {
      try {
        setUser(JSON.parse(storedUser));
        setUserProfile(JSON.parse(storedProfile));
        setCurrentContext(storedContext as 'independent' | 'institutional' | 'mixed' || 'mixed');
      } catch (error) {
        localStorage.removeItem('maple-auth-user');
        localStorage.removeItem('maple-auth-profile');
        localStorage.removeItem('maple-auth-context');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, overrideRole?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock Bypass for Frontend-Only Testing
      const legacyRoleMap: Record<string, string> = {
         'student': 'universal_student',
         'teacher': 'independent_teacher',
         'admin': 'platform_admin',
         'institution': 'institution_admin'
      };

      const finalRole = overrideRole ? (legacyRoleMap[overrideRole] || overrideRole) : 'platform_admin';

      const sessionUser = {
         id: email,
         email: email,
         name: email.split('@')[0],
         role: finalRole,
         countryCode: 'uganda'
      };
      
      setUser(sessionUser as any);
      setUserProfile(sessionUser as any);
      setCountryCode('uganda');
      setCurrentContext('mixed');
      
      localStorage.setItem('maple-auth-user', JSON.stringify(sessionUser));
      localStorage.setItem('maple-auth-profile', JSON.stringify(sessionUser));
      localStorage.setItem('maple-auth-context', 'mixed');
      localStorage.setItem('maple-access-token', 'mock_access_token');
      localStorage.setItem('maple-refresh-token', 'mock_refresh_token');
      
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Login authentication error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const registerUser = async (email: string, full_name: string, country_code: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock Bypass for registration
      return await login(email, password, role);
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    setCurrentContext('mixed');
    localStorage.removeItem('maple-auth-user');
    localStorage.removeItem('maple-auth-profile');
    localStorage.removeItem('maple-auth-context');
    localStorage.removeItem('maple-access-token');
    localStorage.removeItem('maple-refresh-token');
  };

  const switchStudentContext = (institutionId?: string) => {
    if (user?.role === 'universal_student') {
      const student = user as UniversalStudent;
      
      if (!institutionId) {
        // Switch to independent context
        setCurrentContext('independent');
      } else {
        // Switch to specific institution context
        const hasInstitution = student.student_statuses.institutional.some(
          inst => inst.institution_id === institutionId
        );
        if (hasInstitution) {
          setCurrentContext('institutional');
        }
      }
      
      localStorage.setItem('maple-auth-context', currentContext);
    }
  };

  const value = {
    user,
    userProfile,
    login,
    register: registerUser,
    logout,
    isLoading,
    switchStudentContext,
    currentContext,
    countryCode,
    setCountryCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

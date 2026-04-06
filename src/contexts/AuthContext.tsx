import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UniversalStudent, IndependentTeacher, Institution, ParentUser } from '../types';
import { apiClient } from '@/lib/apiClient';

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
  onboardStudent: (studentData: any, parentData: any, paymentData: any) => Promise<{success: boolean, redirect_url?: string, error?: string}>;
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

// Helper: synchronously read and fix user from localStorage
function restoreUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem('maple-auth-user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Ensure role always exists
    if (!parsed.role && parsed.user_type) {
      parsed.role = parsed.user_type;
    } else if (!parsed.role) {
      const lowerEmail = (parsed.email || '').toLowerCase();
      if (lowerEmail.includes('teacher') || lowerEmail.includes('nakamya')) parsed.role = 'independent_teacher';
      else if (lowerEmail.includes('admin') || lowerEmail.includes('namaganda')) parsed.role = 'platform_admin';
      else if (lowerEmail.includes('parent')) parsed.role = 'parent';
      else parsed.role = 'universal_student';
    }
    return parsed;
  } catch {
    localStorage.removeItem('maple-auth-user');
    return null;
  }
}

function restoreProfileFromStorage(): any {
  try {
    const raw = localStorage.getItem('maple-auth-profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('maple-auth-profile');
    return null;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Synchronous initialization from localStorage — prevents the null-user race condition on refresh
  const [user, setUser] = useState<User | null>(() => restoreUserFromStorage());
  const [userProfile, setUserProfile] = useState<UniversalStudent | IndependentTeacher | Institution | ParentUser | null>(() => restoreProfileFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<'independent' | 'institutional' | 'mixed'>(() => {
    return (localStorage.getItem('maple-auth-context') as 'independent' | 'institutional' | 'mixed') || 'mixed';
  });
  const [countryCode, setCountryCodeState] = useState<string>(() => {
    return localStorage.getItem('maple-auth-country') || 'uganda';
  });

  const setCountryCode = (code: string) => {
    setCountryCodeState(code);
    localStorage.setItem('maple-auth-country', code);
  };

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

      let inferredRole = overrideRole ? (legacyRoleMap[overrideRole] || overrideRole) : undefined;
      
      if (!inferredRole) {
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes('teacher') || lowerEmail.includes('nakamya')) {
          inferredRole = 'independent_teacher';
        } else if (lowerEmail.includes('student') || lowerEmail.includes('nakato')) {
          inferredRole = 'universal_student';
        } else if (lowerEmail.includes('institution')) {
          inferredRole = 'institution_admin';
        } else if (lowerEmail.includes('admin') || lowerEmail.includes('namaganda')) {
          inferredRole = 'platform_admin';
        } else {
          inferredRole = 'universal_student'; // Safe default
        }
      }

      const finalRole = inferredRole;

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

  const onboardStudent = async (studentData: any, parentData: any, paymentData: any) => {
    setIsLoading(true);
    try {
      // In a real implementation this hits the new /api/accounts/onboard-student/
      // For now, we simulate the success response and log them in
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const email = studentData.email || `${studentData.username}@edify.local`;
      const sessionUser = {
         id: email,
         email: email,
         name: studentData.full_name,
         role: 'universal_student',
         countryCode: studentData.country_code || 'uganda'
      };
      
      setUser(sessionUser as any);
      setUserProfile(sessionUser as any);
      setCurrentContext('mixed');
      localStorage.setItem('maple-auth-user', JSON.stringify(sessionUser));
      
      setIsLoading(false);
      
      return { 
        success: true, 
        // Redirect to standard payment waiting/processing page or dashboard
        redirect_url: `/payment/processing?tracking=mock-${Date.now()}` 
      };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: 'Registration failed' };
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
      
      let newContext: 'independent' | 'institutional' | 'mixed' = currentContext;
      if (!institutionId) {
        newContext = 'independent';
      } else {
        const hasInstitution = student.student_statuses?.institutional?.some(
          inst => inst.institution_id === institutionId
        );
        if (hasInstitution) {
          newContext = 'institutional';
        }
      }
      
      setCurrentContext(newContext);
      localStorage.setItem('maple-auth-context', newContext);
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
    setCountryCode,
    onboardStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

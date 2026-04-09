import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UniversalStudent, IndependentTeacher, Institution, ParentUser } from '../types';
import { loginUser, registerUser as registerUserAPI, storeTokens, clearTokens } from '@/lib/apiClient';

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
      // Send login request to real API
      const response = await loginUser(email, password);
      
      if (response.data) {
        // Successfully logged in - tokens are stored by loginUser function
        // Fetch user profile from backend
        try {
          // The backend returns user info in the token payload
          // For now, create user object from email and role inference
          const lowerEmail = email.toLowerCase();
          let inferredRole = overrideRole;
          
          if (!inferredRole) {
            if (lowerEmail.includes('teacher') || lowerEmail.includes('nakamya')) {
              inferredRole = 'independent_teacher';
            } else if (lowerEmail.includes('admin') || lowerEmail.includes('namaganda')) {
              inferredRole = 'platform_admin';
            } else if (lowerEmail.includes('parent')) {
              inferredRole = 'parent';
            } else {
              inferredRole = 'universal_student';
            }
          }
          
          const sessionUser = {
            id: email,
            email: email,
            name: email.split('@')[0],
            role: inferredRole,
            countryCode: 'uganda'
          };
          
          setUser(sessionUser as any);
          setUserProfile(sessionUser as any);
          setCurrentContext('mixed');
          
          localStorage.setItem('maple-auth-user', JSON.stringify(sessionUser));
          localStorage.setItem('maple-auth-profile', JSON.stringify(sessionUser));
          localStorage.setItem('maple-auth-context', 'mixed');
          
          setIsLoading(false);
          return true;
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setIsLoading(false);
          return false;
        }
      } else {
        // Login failed
        console.error('Login failed:', response.error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login authentication error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const registerUser = async (email: string, full_name: string, country_code: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Map simple role names to backend format if needed
      const roleMap: Record<string, string> = {
        'learner': 'student',
        'student': 'student',
        'teacher': 'teacher',
        'institution': 'institution',
        'admin': 'admin'
      };
      
      const apiRole = roleMap[role.toLowerCase()] || role.toLowerCase();
      
      // Call real registration API
      const response = await registerUserAPI({
        email,
        full_name,
        password,
        country_code: country_code || 'uganda',
        role: apiRole as 'student' | 'teacher' | 'institution' | 'admin'
      });
      
      if (response.data) {
        // Auto-login after successful registration
        return await login(email, password, role);
      } else {
        console.error('Registration failed:', response.error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const onboardStudent = async (studentData: any, parentData: any, paymentData: any) => {
    setIsLoading(true);
    try {
      // First, register the student
      const registrationResponse = await registerUserAPI({
        email: studentData.email || `${studentData.username}@edify.local`,
        full_name: studentData.full_name,
        password: studentData.password || 'DefaultPass123!',
        country_code: studentData.country_code || 'uganda',
        role: 'student'
      });
      
      if (!registrationResponse.data) {
        throw new Error('Student registration failed');
      }
      
      // Auto-login the newly registered student
      const loginResponse = await loginUser(
        studentData.email || `${studentData.username}@edify.local`,
        studentData.password || 'DefaultPass123!'
      );
      
      if (loginResponse.data) {
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
        localStorage.setItem('maple-auth-profile', JSON.stringify(sessionUser));
        localStorage.setItem('maple-auth-context', 'mixed');
        
        setIsLoading(false);
        
        return { 
          success: true, 
          // Redirect to dashboard or payment processing
          redirect_url: '/student-dashboard' 
        };
      } else {
        throw new Error('Auto-login after registration failed');
      }
    } catch (error: any) {
      console.error('Student onboarding error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error?.message || 'Student onboarding failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    setCurrentContext('mixed');
    localStorage.removeItem('maple-auth-user');
    localStorage.removeItem('maple-auth-profile');
    localStorage.removeItem('maple-auth-context');
    // Clear tokens from both naming conventions
    clearTokens();
    localStorage.removeItem('maple-access-token');
    localStorage.removeItem('maple-refresh-token');
    
    // Redirect to login
    window.location.href = '/login';
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

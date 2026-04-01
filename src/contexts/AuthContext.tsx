import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UniversalStudent, IndependentTeacher, Institution } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UniversalStudent | IndependentTeacher | Institution | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  switchStudentContext: (institutionId?: string) => void;
  currentContext: 'independent' | 'institutional' | 'mixed';
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
  const [userProfile, setUserProfile] = useState<UniversalStudent | IndependentTeacher | Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentContext, setCurrentContext] = useState<'independent' | 'institutional' | 'mixed'>('mixed');

  useEffect(() => {
    // Check for stored auth state
    const storedUser = localStorage.getItem('maple-auth-user');
    const storedProfile = localStorage.getItem('maple-auth-profile');
    const storedContext = localStorage.getItem('maple-auth-context');
    
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Load hybrid user data
      const response = await fetch('/data/hybrid-users.json');
      const userData = await response.json();
      
      // Check all user types
      const allUsers = [
        ...userData.platform_administrators,
        ...userData.institution_administrators,
        ...userData.independent_teachers,
        ...userData.universal_students
      ];
      
      const foundUser = allUsers.find((u: User) => u.email === email);
      
      if (foundUser) {
        // For demo purposes, accept any password or check demo accounts
        const demoAccount = Object.values(userData.demo_accounts).find(
          (account: any) => account.email === email
        );
        
        if (demoAccount || password) {
          setUser(foundUser);
          setUserProfile(foundUser as any);
          
          // Set default context based on user type
          if (foundUser.role === 'universal_student') {
            const student = foundUser as UniversalStudent;
            if (student.student_statuses.institutional.length > 0 && student.student_statuses.independent.active) {
              setCurrentContext('mixed');
            } else if (student.student_statuses.institutional.length > 0) {
              setCurrentContext('institutional');
            } else {
              setCurrentContext('independent');
            }
          } else {
            setCurrentContext('mixed');
          }
          
          localStorage.setItem('maple-auth-user', JSON.stringify(foundUser));
          localStorage.setItem('maple-auth-profile', JSON.stringify(foundUser));
          localStorage.setItem('maple-auth-context', currentContext);
          
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
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
    logout,
    isLoading,
    switchStudentContext,
    currentContext
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

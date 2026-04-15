import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumLockState } from './PremiumLockState';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  requiredTier?: 'flex_monthly' | 'termly' | 'yearly';
  featureName: string;
  description: string;
  children: React.ReactNode;
  mockContent?: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  requiredTier = 'termly',
  featureName,
  description,
  children,
  mockContent
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Extract subscription logic perfectly from User
  const plan = (user as any)?.institution?.subscription_plan || 'free';
  const role = user?.role;
  
  // Platform admins see everything. Students and parents might not see the gate directly,
  // but if they navigate to an admin/teacher feature locked at institution level, they see it.
  if (role === 'platform_admin') {
    return <>{children}</>;
  }

  // Hierarchy of tiers logic
  const tiers = {
    'free': 0,
    'setup': 1,
    'flex_monthly': 2,
    'termly': 3,
    'yearly': 4
  };

  const currentTierRank = tiers[plan as keyof typeof tiers] || 0;
  const requiredTierRank = tiers[requiredTier as keyof typeof tiers] || 3;

  if (currentTierRank >= requiredTierRank) {
    return <>{children}</>;
  }

  return (
    <PremiumLockState
      title={`Unlock ${featureName}`}
      description={description}
      actionLabel={role === 'institution_admin' || role === 'headteacher' ? 'Upgrade Institution Plan' : 'Ask Admin to Upgrade'}
      onAction={() => {
        if (role === 'institution_admin' || role === 'headteacher') {
          navigate('/dashboard/institution/finance');
        } else {
           // Provide a soft landing for non-admins
           window.alert("Your institution has not unlocked this feature. Please contact your administrator.");
        }
      }}
      mockContent={mockContent}
    />
  );
};

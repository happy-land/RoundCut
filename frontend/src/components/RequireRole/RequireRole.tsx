import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectAuth } from '../../features/authSlice';
import { UserRole } from '../../utils/types';

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

const RequireRole: FC<RequireRoleProps> = ({ roles, children }) => {
  const { user } = useAppSelector(selectAuth);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;

import React, { useState } from 'react';
import { UserState } from '../../types';

interface UserAvatarProps {
  user: UserState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'sm',
  showBadge = true,
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Derive initial from email or name
  const displayName = user.name || user.email || 'User';
  const initial = (displayName.charAt(0) || 'U').toUpperCase();

  // Primary avatar URL based on email or name
  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email || displayName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;
  const avatarSrc = user.avatarUrl || fallbackUrl;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 sm:w-9 sm:h-9 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-18 h-18 text-2xl',
  };

  const badgeSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  return (
    <div 
      className={`relative inline-flex shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} rounded-full border-2 border-[#ff5722] bg-gradient-to-tr from-[#1b1b26] to-[#252538] flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(255,87,34,0.35)] transition-transform ${className}`}
        title={`${user.name} (${user.email})`}
      >
        {!imgError ? (
          <img
            src={avatarSrc}
            alt={user.email || 'User profile picture'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#ff5722] to-[#ff8a65] flex items-center justify-center text-white font-extrabold select-none">
            {initial}
          </div>
        )}
      </div>

      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 ${badgeSizeClasses[size]} rounded-full bg-emerald-500 ring-2 ring-[#08080a] shadow-sm`}
          title="Online"
        />
      )}
    </div>
  );
};

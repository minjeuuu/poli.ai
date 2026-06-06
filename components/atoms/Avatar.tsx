import { ImageWithFallback } from './ImageWithFallback';

import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', fallback }) => {
    const sizeClass = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-24 h-24 text-xl'
    }[size];

    return (
        <div className={`${sizeClass} rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center overflow-hidden border border-stone-300 dark:border-stone-700`}>
            {src ? (
                <ImageWithFallback src={src} alt={alt || "Avatar"} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-stone-500 dark:text-stone-400">
                    {fallback ? fallback.charAt(0).toUpperCase() : <User className="w-1/2 h-1/2" />}
                </span>
            )}
        </div>
    );
};

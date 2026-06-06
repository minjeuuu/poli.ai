import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, fallbackSrc, className, ...rest }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [errored, setErrored] = useState(false);

    const handleError = () => {
        if (!errored) {
            setErrored(true);
            if (fallbackSrc) {
                setImgSrc(fallbackSrc);
            } else {
                // Use a consistent seed based on alt text to get the same image for the same item
                const seed = (alt || 'placeholder').replace(/\s+/g, '-').toLowerCase();
                setImgSrc(`https://picsum.photos/seed/${seed}/400/400?blur=2`);
            }
        }
    };

    return <img src={imgSrc || `https://picsum.photos/seed/${Math.random()}/400/400?blur=2`} alt={alt} className={className} onError={handleError} referrerPolicy="no-referrer" {...rest} />;
};

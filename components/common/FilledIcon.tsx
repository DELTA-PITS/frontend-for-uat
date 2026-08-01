import { cloneElement, isValidElement } from 'react';

/**
 * Renders a colored background circle around an icon, used as a visual accent.
 * Icon itself is kept small (default 1.125rem) and the background subtle
 * (10% tint by default) so the icon reads as a quiet accent rather than the
 * focal point of the row/card it sits in.
 * @param icon - The icon element to display inside the circle.
 * @param className - Additional CSS class names for custom styling.
 * @returns The filled icon component.
 */
export function FilledIcon({ icon, className }: { icon: React.ReactNode; className?: string }) {
    const sizedIcon =
        isValidElement(icon) && !(icon.props as { style?: React.CSSProperties }).style?.fontSize
            ? cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, {
                style: { fontSize: '1.125rem' },
            })
            : icon;

    const classList = className ? className.trim().split(/\s+/) : [];
    
    const getBaseClass = (c: string) => c.split(':').pop() || '';

    const hasBgColor = classList.some(c => {
        const base = getBaseClass(c);
        if (!base.startsWith('bg-')) return false;
        const suffix = base.slice(3);
        const nonColorSuffixes = [
            'cover', 'contain', 'auto', 'repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'repeat-round', 'repeat-space',
            'left', 'center', 'right', 'top', 'bottom',
            'fixed', 'local', 'scroll',
            'clip-border', 'clip-padding', 'clip-content', 'clip-text',
            'origin-border', 'origin-padding', 'origin-content',
            'blend-normal', 'blend-multiply', 'blend-screen', 'blend-overlay', 'blend-darken', 'blend-lighten',
            'blend-color-dodge', 'blend-color-burn', 'blend-hard-light', 'blend-soft-light', 'blend-difference',
            'blend-exclusion', 'blend-hue', 'blend-saturation', 'blend-color', 'blend-luminosity'
        ];
        return !nonColorSuffixes.includes(suffix);
    });

    const hasTextColor = classList.some(c => {
        const base = getBaseClass(c);
        if (!base.startsWith('text-')) return false;
        const suffix = base.slice(5);
        const nonColorSuffixes = [
            'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl',
            'left', 'center', 'right', 'justify', 'start', 'end', 'wrap', 'nowrap', 'balance', 'pretty', 'truncate',
            'ellipsis', 'clip'
        ];
        return !nonColorSuffixes.includes(suffix);
    });

    const bgClass = hasBgColor ? '' : 'bg-primary/10';
    const textClass = hasTextColor ? '' : 'text-primary';

    const mergedClasses = `inline-flex items-center justify-center rounded-full aspect-square p-1.5 ${bgClass} ${textClass} ${className ?? ''}`
        .trim()
        .replace(/\s+/g, ' ');

    return (
        <span className={mergedClasses}>
            {sizedIcon}
        </span>
    );
}



export function FilledIcon({ icon, className }: { icon: React.ReactNode; className?: string }) {
    return (
        <span className={`flex items-center justify-center rounded-full bg-primary/20 p-2 text-primary ${className ?? ''}`.trim()}>
            {icon}
        </span>
    );
}

        
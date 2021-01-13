export default function Heading({ title, subtitle, className = "" }: { title: string, subtitle: string, className?: string }) {
    return (
        <div className={className}>
            <h2 className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate">
                {title}
            </h2>
            <p className="mb-4 text-lg text-gray-500 dark:text-gray-300">
                {subtitle}
            </p>
        </div>
    )
}
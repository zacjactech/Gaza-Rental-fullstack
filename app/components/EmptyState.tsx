'use client';

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  showReset
}) => {
  const router = useRouter();

  return ( 
    <div 
      className="
        h-[60vh]
        flex 
        flex-col 
        gap-2 
        justify-center 
        items-center 
      "
    >
      <div className="text-2xl font-semibold">
        {title}
      </div>
      <div className="text-neutral-500">
        {subtitle}
      </div>
      <div className="w-48 mt-4">
        {showReset && (
          <button
            onClick={() => router.push('/')}
            className="
              w-full
              bg-rose-500
              text-white
              py-3
              px-4
              rounded-md
              hover:bg-rose-600
              transition
            "
          >
            Remove all filters
          </button>
        )}
      </div>
    </div>
   );
}

export default EmptyState; 
"use client";

import { MapPin } from "lucide-react";

interface MapProps {
  center?: number[];
}

const Map: React.FC<MapProps> = ({ center }) => {
  return (
    <div className="h-[35vh] rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="text-neutral-500">
          Map view is not available.
          {center && (
            <span className="block text-sm mt-1">
              Location: {center[0]}, {center[1]}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Map; 
import { PropertyCard } from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: string;
  images: string[] | null;
  title: string;
  city: string;
  state: string;
  type: string;
  urgency: string | null;
  clothing_types: string[] | null;
}

interface PropertyGridProps {
  properties: Property[];
  isLoading: boolean;
  onPropertyHover?: (propertyId: string) => void;
  onPropertyLeave?: (propertyId: string) => void;
  gridCols: 2 | 3 | 4;
}

export const PropertyGrid = ({
  properties,
  isLoading,
  onPropertyHover,
  onPropertyLeave,
  gridCols,
}: PropertyGridProps) => {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[gridCols];

  if (isLoading) {
    return (
      <div className={`grid ${gridClasses} gap-6`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridClasses} gap-6`}>
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
          onMouseEnter={() => onPropertyHover?.(property.id)}
          onMouseLeave={() => onPropertyLeave?.(property.id)}
        >
          <PropertyCard
            id={property.id}
            images={property.images}
            title={property.title}
            location={`${property.city}, ${property.state}`}
            type={property.type ?? "media"}
            initialIsFavorite={false}
            onFavoriteChange={() => {}}
          />
        </div>
      ))}
    </div>
  );
};

import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { SearchForm } from "../components/SearchForm";
import { SearchResultsHeader } from "../components/SearchResultsHeader";
import { PropertyGrid } from "../components/PropertyGrid";
import { EmptySearchState } from "../components/EmptySearchState";
import { useSearchResults } from "../hooks/useSearchResults";
import { useGeolocation } from "../hooks/useGeolocation";
import { Footer } from "../components/Footer";
import { InteractiveMap } from "../components/InteractiveMap";
import { Button } from "../components/ui/button";
import { Map, List, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { AdvancedFilters } from "../components/AdvancedSearchFilters";
import { ProximityFilter } from "../components/ProximityFilter";
import type { Coordinates } from "../hooks/useGeolocation";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("newest");
  const [showMap, setShowMap] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const autoGps = searchParams.get("autoGps") === "1";

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    clothingType: "all",
    urgency: "all",
    sizes: [],
  });

  // Estado da busca por proximidade (FILTRO PRINCIPAL)
  const [proximityOrigin, setProximityOrigin] = useState<Coordinates | null>(null);
  const [proximityLabel, setProximityLabel] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(20);

  // Auto-solicita GPS quando o usuário vem da home com ?autoGps=1
  const { requestLocation } = useGeolocation();
  const autoGpsTriedRef = useRef(false);
  useEffect(() => {
    if (autoGps && !autoGpsTriedRef.current && !proximityOrigin) {
      autoGpsTriedRef.current = true;
      (async () => {
        const coords = await requestLocation();
        if (coords) {
          setProximityOrigin(coords);
          setProximityLabel("Minha localização atual");
        }
      })();
    }
  }, [autoGps, proximityOrigin, requestLocation]);

  const searchData = {
    location: searchParams.get("location") || undefined,
    clothingType: searchParams.get("clothingType") || advancedFilters.clothingType !== "all" ? advancedFilters.clothingType : undefined,
    urgency: searchParams.get("urgency") || advancedFilters.urgency !== "all" ? advancedFilters.urgency : undefined,
    sizes: advancedFilters.sizes.length > 0 ? advancedFilters.sizes : undefined,
    sortBy,
    page: currentPage,
    pageSize: 20,
    userLat: proximityOrigin?.latitude,
    userLng: proximityOrigin?.longitude,
    radiusKm: proximityOrigin ? radiusKm : undefined,
  };


  const { data, isLoading } = useSearchResults(searchData);
  const properties = data?.properties || [];
  const totalPages = data?.totalPages || 0;
  const resultCount = data?.total || 0;

  const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude) as Array<{
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    images?: string[];
  }>;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    navigate(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
    }
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>{i}</PaginationLink>
        </PaginationItem>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* FILTRO PRINCIPAL: busca por proximidade (KM) */}
        <div className="mb-4">
          <ProximityFilter
            origin={proximityOrigin}
            originLabel={proximityLabel}
            radiusKm={radiusKm}
            onChange={(origin, label, km) => {
              setProximityOrigin(origin);
              setProximityLabel(label);
              setRadiusKm(km);
            }}
          />
        </div>

        {/* Filtros secundários (texto, tipo de roupa, urgência) */}
        <details className="mb-6 group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 select-none">
            <span className="group-open:hidden">+ Mais filtros (cidade, tipo de roupa, urgência)</span>
            <span className="hidden group-open:inline">− Ocultar filtros adicionais</span>
          </summary>
          <div className="mt-3">
            <SearchForm
              defaultLocation={searchData.location}
              defaultClothingType={advancedFilters.clothingType}
              defaultUrgency={advancedFilters.urgency}
            />
          </div>
        </details>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <SearchResultsHeader
            resultCount={resultCount}
            location={searchData.location}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onApplyFilters={() => {}}
          />
          <Button
            variant={showMap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="w-full sm:w-auto flex-shrink-0"
          >
            {showMap ? <List className="h-4 w-4 mr-2" /> : <Map className="h-4 w-4 mr-2" />}
            {showMap ? "Mostrar Lista" : "Mostrar Mapa"}
          </Button>
        </div>

        {showMap && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col p-0 sm:p-4 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-background shadow-sm flex-shrink-0">
              <h2 className="text-xl font-bold">ONGs no Mapa</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMap(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-grow">
              <InteractiveMap
                properties={propertiesWithCoords}
                selectedPropertyId={selectedPropertyId}
                onPropertyClick={(id) => navigate(`/property/${id}`)}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        <div className={showMap ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
          {showMap && (
            <div className="hidden lg:block lg:col-span-1 lg:mb-0 lg:h-[600px] lg:sticky lg:top-8 lg:order-2">
              <InteractiveMap
                properties={propertiesWithCoords}
                selectedPropertyId={selectedPropertyId}
                onPropertyClick={(id) => navigate(`/property/${id}`)}
                className="h-[600px] w-full"
              />
            </div>
          )}

          <div className={showMap ? "col-span-1 lg:order-1" : "col-span-full"}>
            {properties.length > 0 ? (
              <>
                <PropertyGrid
                  properties={properties}
                  isLoading={isLoading}
                  onPropertyHover={showMap ? setSelectedPropertyId : undefined}
                  onPropertyLeave={showMap ? () => setSelectedPropertyId(undefined) : undefined}
                  gridCols={showMap ? 2 : 4}
                />
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                      {renderPaginationItems()}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            ) : !isLoading ? (
              <EmptySearchState />
            ) : (
              <PropertyGrid properties={[]} isLoading={isLoading} gridCols={showMap ? 2 : 4} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateDistanceKm } from "@/lib/distance";

interface SearchParams {
  location?: string;
  clothingType?: string;
  urgency?: string;
  sizes?: string[];
  sortBy?: string;
  page?: number;
  pageSize?: number;
  // Filtro por proximidade
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
}

interface SearchResult {
  properties: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const fetchSearchResults = async (params: SearchParams): Promise<SearchResult> => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const hasProximity =
    typeof params.userLat === "number" &&
    typeof params.userLng === "number" &&
    typeof params.radiusKm === "number";

  let query = supabase.from("properties").select("*", { count: "exact" });

  // Apenas necessidades ativas e não atendidas
  query = query.eq("is_active", true).eq("is_fulfilled", false);

  if (params.location && !hasProximity) {
    query = query.or(
      `city.ilike.%${params.location}%,state.ilike.%${params.location}%,address.ilike.%${params.location}%`
    );
  }

  if (params.clothingType && params.clothingType !== "all") {
    query = query.contains("clothing_types", [params.clothingType]);
  }

  if (params.urgency && params.urgency !== "all") {
    query = query.eq("urgency", params.urgency);
  }

  if (params.sizes && params.sizes.length > 0) {
    query = query.contains("sizes_needed", params.sizes);
  }

  // Quando filtramos por proximidade, precisamos de lat/lng não nulos
  if (hasProximity) {
    query = query.not("latitude", "is", null).not("longitude", "is", null);
  }

  query = query.order("created_at", { ascending: false });

  // Se NÃO há proximidade, paginamos no banco. Se há, buscamos um lote maior e paginamos depois.
  if (!hasProximity) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  } else {
    query = query.limit(1000);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Erro ao buscar necessidades:", error);
    throw error;
  }

  let results: any[] = data || [];

  // Filtro por raio (client-side via Haversine)
  if (hasProximity) {
    results = results
      .map((p: any) => ({
        ...p,
        _distanceKm: calculateDistanceKm(
          params.userLat!,
          params.userLng!,
          Number(p.latitude),
          Number(p.longitude)
        ),
      }))
      .filter((p: any) => p._distanceKm <= (params.radiusKm as number));
  }

  // Ordenação
  if (params.sortBy === "urgency") {
    const urgencyOrder: Record<string, number> = { alta: 0, media: 1, baixa: 2 };
    results = [...results].sort(
      (a, b) =>
        (urgencyOrder[a.urgency || "media"] ?? 1) -
        (urgencyOrder[b.urgency || "media"] ?? 1)
    );
  } else if (hasProximity && params.sortBy !== "newest") {
    // Por padrão, com proximidade ativa, ordenamos por distância
    results = [...results].sort((a, b) => a._distanceKm - b._distanceKm);
  }

  // Paginação client-side quando proximidade está ativa
  let pagedResults = results;
  let total = count || 0;
  if (hasProximity) {
    total = results.length;
    const from = (page - 1) * pageSize;
    pagedResults = results.slice(from, from + pageSize);
  }

  return {
    properties: pagedResults,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const useSearchResults = (searchData: SearchParams) => {
  return useQuery({
    queryKey: ["search-needs", searchData],
    queryFn: () => fetchSearchResults(searchData),
  });
};

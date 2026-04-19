import { useEffect, useRef, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Definições de Tipo (sem alteração)
interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  images?: string[];
}

interface InteractiveMapProps {
  properties: Property[];
  onMapMove?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  selectedPropertyId?: string;
  onPropertyClick?: (propertyId: string) => void;
  className?: string;
}

// Token (Manter ou Mover para variáveis de ambiente)
// Recomenda-se mover este token para uma variável de ambiente (ex: process.env.NEXT_PUBLIC_MAPBOX_TOKEN)
const MAPBOX_TOKEN = import.meta.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  

export const InteractiveMap = ({
  properties,
  onMapMove,
  selectedPropertyId,
  onPropertyClick,
  className = "",
}: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null); // Referência ao objeto Mapbox Map
  const markers = useRef<{ [key: string]: any }>({}); // Referência aos objetos Mapbox Marker
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxLoading, setMapboxLoading] = useState(true);

  // 1. Efeito de Inicialização (Carregar Mapbox, Criar Mapa, Adicionar Listeners)
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      setMapboxLoading(false);
      return;
    }

    const loadMapbox = async () => {
      // Carrega CSS
      if (!document.getElementById("mapbox-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-css";
        link.rel = "stylesheet";
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css";
        document.head.appendChild(link);
      }

      // Carrega JS
      if (!(window as any).mapboxgl) {
        const script = document.createElement("script");
        script.src = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise<void>((resolve) => {
          script.onload = () => {
            resolve();
            setMapboxLoading(false);
          };
          script.onerror = () => {
            console.error("Falha ao carregar Mapbox GL JS.");
            setMapboxLoading(false);
          };
        });
      } else {
        setMapboxLoading(false);
      }

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Cálculo do centro baseado nas propriedades (mantido)
      const validProperties = properties.filter((p) => p.latitude && p.longitude);
      let center: [number, number] = [-46.6333, -23.5505];
      let zoom = 10;

      if (validProperties.length > 0) {
        const avgLat = validProperties.reduce((sum, p) => sum + p.latitude, 0) / validProperties.length;
        const avgLng = validProperties.reduce((sum, p) => sum + p.longitude, 0) / validProperties.length;
        center = [avgLng, avgLat];
        zoom = validProperties.length === 1 ? 14 : 11;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: center,
        zoom: zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      if (onMapMove) {
        map.current.on("moveend", () => {
          const bounds = map.current.getBounds();
          onMapMove({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        });
      }
    };

    loadMapbox();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [properties.length]); // Dependência ajustada para inicializar o mapa uma única vez

  // 2. Efeito de Marcadores (Adicionar/Remover/Atualizar Marcadores)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapboxgl = (window as any).mapboxgl;

    // 1. Remova todos os marcadores existentes
    Object.values(markers.current).forEach((marker: any) => marker.remove());
    markers.current = {};

    // 2. Adiciona novos marcadores
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const el = document.createElement("div");

      // Usa CLASSES CSS para todas as variações de cor e tamanho
      const isSelected = selectedPropertyId === property.id;
      el.className = `property-marker ${isSelected ? "marker-selected" : "marker-default"}`;

      // Remove a maioria dos estilos inline e deixa o Mapbox no controle
      el.style.cssText = `
        /* MANTENHA APENAS o necessário, o CSS externo fará o resto */
        cursor: pointer;
        white-space: nowrap;
      `;
      el.textContent = `📍 ${property.title.substring(0, 20)}`;

      // O listener de click é mantido
      el.addEventListener("click", () => {
        if (onPropertyClick) {
          onPropertyClick(property.id);
        }
      });
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);

      // Adiciona popup (mantido)
      const popupContent = `
        <div style="padding: 8px; max-width: 200px;">
          ${property.images?.[0] ? `<img src="${property.images[0]}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" alt="${property.title}" />` : ""}
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${property.title}</div>
          <div style="color: #2563eb; font-weight: 600;">Precisa de doações</div>
        </div>
      `;
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(popupContent);
      marker.setPopup(popup);

      markers.current[property.id] = marker;
    });
  }, [properties, mapLoaded, selectedPropertyId, onPropertyClick]);

  if (!MAPBOX_TOKEN) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Configure o token do Mapbox para visualizar o mapa</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {(!mapLoaded || mapboxLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full rounded-lg" style={{ minHeight: "500px" }} />
    </div>
  );
};

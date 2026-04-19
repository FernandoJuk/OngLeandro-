import { useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface UseGeolocationReturn {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<Coordinates | null>;
  clearLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = (): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setError("Seu navegador não suporta geolocalização.");
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(newCoords);
          setLoading(false);
          resolve(newCoords);
        },
        (err) => {
          setLoading(false);
          let message = "Não foi possível obter sua localização.";
          if (err.code === err.PERMISSION_DENIED) {
            message =
              "Permissão de localização negada. Habilite-a nas configurações do navegador ou informe seu CEP.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = "Localização indisponível no momento. Tente informar seu CEP.";
          } else if (err.code === err.TIMEOUT) {
            message = "Tempo esgotado ao obter a localização. Tente novamente.";
          }
          setError(message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const clearLocation = () => {
    setCoords(null);
    setError(null);
  };

  return { coords, loading, error, requestLocation, clearLocation };
};

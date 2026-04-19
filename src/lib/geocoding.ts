// Serviço de Geocodificação usando Nominatim (OpenStreetMap - Gratuito)
interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export const geocodeAddress = async (
  street: string,
  number: string,
  city: string,
  state: string,
  country: string = 'Brasil'
): Promise<GeocodingResult | null> => {
  try {
    // Monta a query de endereço
    const addressQuery = `${street}, ${number}, ${city}, ${state}, ${country}`;
    
    // Usa Nominatim (OpenStreetMap) - serviço gratuito
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Locaitemporada/1.0', // Nominatim requer User-Agent
      },
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

// Geocodifica somente a partir do CEP usando ViaCEP + Nominatim
export const geocodeByCep = async (cep: string): Promise<GeocodingResult | null> => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const viaCepData = await viaCepRes.json();
    if (viaCepData.erro) return null;

    const query = `${viaCepData.logradouro || ''}, ${viaCepData.bairro || ''}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'ParaQuemPrecisa/1.0' },
    });
    const data = await res.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar CEP:', error);
    return null;
  }
};

# Configuração do Mapbox

Para habilitar o mapa interativo na página de busca, você precisa configurar sua chave pública do Mapbox.

## Como obter sua chave do Mapbox

1. Acesse: https://account.mapbox.com/access-tokens/
2. Crie uma conta gratuita (se ainda não tiver)
3. Copie seu **Token de Acesso Público** (começa com `pk.`)

## Como configurar

Abra o arquivo `src/components/InteractiveMap.tsx` e substitua o valor de `MAPBOX_TOKEN` pela sua chave:

```typescript
// Linha 27 do arquivo src/components/InteractiveMap.tsx
const MAPBOX_TOKEN = 'SUA_CHAVE_PUBLICA_AQUI';
```

**Exemplo:**
```typescript
const MAPBOX_TOKEN = 'pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJja3l6YWJjZGVmZ2hpMnJwZGVmZ2hpamt6In0.exemplo123';
```

## Nota Importante

- Use apenas a chave **pública** (começa com `pk.`)
- Não use a chave secreta (começa com `sk.`)
- A chave pública é segura para usar no front-end

## Plano Gratuito do Mapbox

O plano gratuito do Mapbox oferece:
- 50.000 carregamentos de mapa por mês
- Suficiente para a maioria dos projetos pequenos e médios

---

Após configurar, o mapa interativo estará disponível na página de resultados de busca!

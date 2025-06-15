/**
 * Módulo de tradução simples (sem worker)
 * 
 * Este módulo serve como fallback quando o worker não está disponível
 * ou quando precisamos de traduções simples e síncronas.
 */

// Chave da API MyMemory
const MYMEMORY_API_KEY = '3b349f2a0863ca90e91c';

// Cache de traduções para evitar chamadas repetidas
const translationCache = new Map<string, string>();

// Função de tradução simples com rate-limiting
export async function translateTextSimple(text: string, targetLang: string = 'pt'): Promise<string> {
  // Verificar no cache primeiro
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey) || text;
  }
  
  try {
    console.log('[Simple] Traduzindo:', text.substring(0, 30) + '...');
    
    // API MyMemory com chave de autenticação
    const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}&key=${MYMEMORY_API_KEY}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Falha na API de tradução: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translation = data.responseData.translatedText;
      // Salvar no cache
      translationCache.set(cacheKey, translation);
      return translation;
    }
    
    // Se não conseguir traduzir, retornar o texto original
    console.warn('[Simple] API retornou resposta, mas sem tradução');
    return text;
  } catch (error) {
    console.error('[Simple] Erro na tradução:', error);
    return text; // Em caso de erro, retorna o texto original
  }
}

// Função para verificar se um texto está em inglês
export function isEnglishTextSimple(text: string): boolean {
  // Esta é uma verificação simples que pode ser melhorada
  // Procura por palavras comuns em inglês
  const commonEnglishWords = ['the', 'and', 'with', 'for', 'in', 'of', 'to', 'a', 'is', 'that', 'be'];
  const lowerText = text.toLowerCase();
  
  // Verifica se pelo menos 2 palavras comuns estão presentes
  const wordCount = commonEnglishWords.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    return regex.test(lowerText);
  }).length;
  
  return wordCount >= 2;
} 
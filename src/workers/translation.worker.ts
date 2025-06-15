/**
 * Worker de Tradução
 * 
 * Este worker executa traduções em segundo plano para não bloquear a thread principal.
 */

import { expose } from 'comlink';

// Chave da API MyMemory
const MYMEMORY_API_KEY = '3b349f2a0863ca90e91c';

// API de tradução simples
async function translateText(text: string, targetLang: string = 'pt'): Promise<string> {
  try {
    console.log('[Worker] Traduzindo:', text.substring(0, 30) + '...');
    
    // API MyMemory com chave de autenticação
    const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}&key=${MYMEMORY_API_KEY}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Falha na API de tradução: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    // Se não conseguir traduzir, retornar o texto original
    console.warn('[Worker] API retornou resposta, mas sem tradução');
    return text;
  } catch (error) {
    console.error('[Worker] Erro na tradução:', error);
    return text; // Em caso de erro, retorna o texto original
  }
}

// Função para verificar se um texto está em inglês
function isEnglishText(text: string): boolean {
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

// Expõe as funções para serem chamadas via Comlink
const exports = {
  translateText,
  isEnglishText,
};

expose(exports); 
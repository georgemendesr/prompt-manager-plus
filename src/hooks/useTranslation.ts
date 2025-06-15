import { useState, useCallback } from 'react';
import { translateText, isEnglishText } from '@/services/translation/translationService';
import { supabase } from '@/integrations/supabase/client';

export const useTranslation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para traduzir um único prompt
  const translatePrompt = useCallback(async (promptId: string, text: string) => {
    if (!text || !isEnglishText(text)) {
      return null; // Não traduzir se não for inglês
    }

    setLoading(true);
    setError(null);

    try {
      const translatedText = await translateText(text);
      
      // Salvar a tradução no banco de dados
      if (translatedText && translatedText !== text) {
        const { error: updateError } = await supabase
          .from('prompts')
          .update({ translated_text: translatedText })
          .eq('id', promptId);
          
        if (updateError) {
          console.error('Erro ao salvar tradução:', updateError);
          throw updateError;
        }
        
        return translatedText;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao traduzir prompt';
      setError(errorMessage);
      console.error('Erro ao traduzir prompt:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para traduzir múltiplos prompts
  const translatePrompts = useCallback(async (prompts: Array<{id: string, text: string}>) => {
    setLoading(true);
    setError(null);
    
    const results: Record<string, string> = {};
    let translated = 0;
    let errors = 0;
    
    try {
      // Traduzir em lotes de 5 para não sobrecarregar a API
      const batchSize = 5;
      for (let i = 0; i < prompts.length; i += batchSize) {
        const batch = prompts.slice(i, i + batchSize);
        
        // Traduzir prompts em paralelo
        await Promise.all(
          batch.map(async (prompt) => {
            try {
              // Verificar se o texto é em inglês
              if (!isEnglishText(prompt.text)) {
                return;
              }
              
              const translatedText = await translateText(prompt.text);
              
              // Só salvar se realmente traduzir
              if (translatedText && translatedText !== prompt.text) {
                results[prompt.id] = translatedText;
                
                // Salvar no banco de dados
                const { error: updateError } = await supabase
                  .from('prompts')
                  .update({ translated_text: translatedText })
                  .eq('id', prompt.id);
                  
                if (updateError) {
                  console.error(`Erro ao salvar tradução para prompt ${prompt.id}:`, updateError);
                  errors++;
                } else {
                  translated++;
                }
              }
            } catch (err) {
              errors++;
              console.error(`Erro ao traduzir prompt ${prompt.id}:`, err);
            }
          })
        );
        
        // Aguardar 1 segundo entre lotes para não sobrecarregar a API
        if (i + batchSize < prompts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return {
        results,
        stats: { translated, errors, total: prompts.length }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao traduzir prompts';
      setError(errorMessage);
      console.error('Erro ao traduzir prompts:', err);
      
      return {
        results,
        stats: { translated, errors, total: prompts.length }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    translatePrompt,
    translatePrompts,
    loading,
    error
  };
}; 
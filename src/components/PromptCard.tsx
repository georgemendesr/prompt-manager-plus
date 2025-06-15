import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Copy, Star, Languages } from "lucide-react";
import { Button } from "./ui/button";
import type { Prompt, MusicStructure, Category } from "@/types/prompt";
import { CommentSection } from "./prompt/CommentSection";
import { PromptText } from "./prompt/PromptText";
import { PromptComments } from "./prompt/PromptComments";
import { incrementCopyCount, addPromptRating, getPromptStats } from "@/services/rating/ratingService";
import { supabase } from "@/integrations/supabase/client";
import { translateText, isEnglishText } from "@/services/translation/translationService";
import { useOptimizedData } from "@/hooks/useOptimizedData";
import { usePromptManager } from "@/hooks/usePromptManager";

// Função de teste para diagnosticar problemas com avaliações
// Execute no console: window.testRating('id-do-prompt')
if (typeof window !== 'undefined') {
  (window as any).testRating = async (promptId: string) => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    console.log('🧪 TESTE DO SISTEMA DE AVALIAÇÃO');
    console.log('Prompt ID:', promptId);
    
    // 1. Verificar prompt
    const { data: prompt, error: e1 } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    console.log('1. Prompt:', prompt, 'Erro:', e1);
    
    // 2. Inserir avaliação
    const { data: rating, error: e2 } = await supabase
      .from('prompt_ratings')
      .insert({ prompt_id: promptId, rating: 5, user_id: null })
      .select();
    console.log('2. Avaliação inserida:', rating, 'Erro:', e2);
    
    // 3. Calcular média
    const { error: e3 } = await supabase
      .rpc('calculate_prompt_rating_average', { prompt_uuid: promptId });
    console.log('3. Cálculo de média - Erro:', e3);
    
    // 4. Verificar atualização
    const { data: updated, error: e4 } = await supabase
      .from('prompts')
      .select('rating_average, rating_count')
      .eq('id', promptId)
      .single();
    console.log('4. Dados atualizados:', updated, 'Erro:', e4);
  };
}

interface PromptCardProps {
  prompt: Prompt;
  onRate: (id: string, increment: boolean) => void;
  onAddComment: (id: string, comment: string) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
  categories?: Category[];
  structures?: MusicStructure[];
  searchTerm?: string;
  onPromptUpdate?: () => void;
  onUpdatePrompt?: (id: string, update: Partial<Prompt>) => void;
  onDeletePrompt?: (id: string) => void;
  onSelectPrompt?: (id: string, selected: boolean) => void;
  isSelected?: boolean;
  showCheckbox?: boolean;
  onMovePrompt?: (promptId: string, categoryId: string) => void;
}

export const PromptCard = ({ 
  prompt, 
  onRate, 
  onAddComment, 
  onSelect,
  selected,
  categories = [],
  structures = [],
  searchTerm = "",
  onPromptUpdate,
  onUpdatePrompt,
  onDeletePrompt,
  onSelectPrompt,
  isSelected = false,
  showCheckbox = false,
  onMovePrompt,
}: PromptCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(Boolean(prompt.translatedText));
  const [translation, setTranslation] = useState<string | null>(prompt.translatedText || null);
  const [stats, setStats] = useState({
    ratingAverage: prompt.ratingAverage || 0,
    ratingCount: prompt.ratingCount || 0,
    copyCount: prompt.copyCount || 0,
  });
  const { setUseOptimized } = usePromptManager();

  // Remover este console.log para evitar muitas renderizações
  // console.log(`Prompt ${prompt.uniqueId}:`, {
  //   ratingAverage: prompt.ratingAverage,
  //   ratingCount: prompt.ratingCount,
  //   copyCount: prompt.copyCount
  // });

  // Sincroniza o estado local apenas quando as props mudam realmente
  useEffect(() => {
    // Verificar se os valores realmente mudaram antes de atualizar o estado
    if (prompt.ratingAverage !== stats.ratingAverage || 
        prompt.ratingCount !== stats.ratingCount || 
        prompt.copyCount !== stats.copyCount) {
      setStats({
        ratingAverage: prompt.ratingAverage || 0,
        ratingCount: prompt.ratingCount || 0,
        copyCount: prompt.copyCount || 0,
      });
    }
  }, [prompt.ratingAverage, prompt.ratingCount, prompt.copyCount]);

  // Debug: verificar quando props mudam
  useEffect(() => {
    console.log(`[CARD] Prompt ${prompt.uniqueId} atualizado:`, {
      ratingAverage: prompt.ratingAverage,
      ratingCount: prompt.ratingCount,
      copyCount: prompt.copyCount
    });
  }, [prompt.id, prompt.uniqueId, prompt.ratingAverage, prompt.ratingCount, prompt.copyCount]);

  // Verificar e atualizar a tradução quando o prompt muda
  useEffect(() => {
    if (prompt.translatedText && prompt.translatedText !== translation) {
      console.log('[TRANSLATE] Atualizando tradução do estado com o valor do prompt');
      setTranslation(prompt.translatedText);
      setShowTranslation(true);
    }
  }, [prompt.translatedText, translation]);

  // Se já tiver tradução armazenada no prompt, usar
  useEffect(() => {
    if (prompt.translatedText) {
      console.log('[TRANSLATE] Usando tradução armazenada no prompt');
      setTranslation(prompt.translatedText);
      setShowTranslation(true);
    }
  }, [prompt.id, prompt.text, prompt.translatedText]);

  const handleCopyText = async (text: string) => {
    try {
      // Atualizar UI imediatamente (otimista)
      const oldStats = { ...stats };
      const newCopyCount = (stats.copyCount || 0) + 1;
      
      setStats(s => ({
        ...s,
        copyCount: newCopyCount,
      }));
      
      // Copiar para a área de transferência
      await navigator.clipboard.writeText(text);
      toast.success("Prompt copiado!");

      console.log(`[COPY] Incrementando contador para prompt ${prompt.id}`);
      
      // Usar a função do serviço
      const { error } = await incrementCopyCount(prompt.id);
      
      if (error) {
        console.error('[COPY] Erro ao registrar cópia:', error);
        // Reverter mudança otimista em caso de erro
        setStats(oldStats);
        throw error;
      }
      
      console.log(`[COPY] Salvo id ${prompt.id} total ${newCopyCount}`);
      
      // Notificar o sistema sobre a atualização para reordenação
      window.dispatchEvent(new CustomEvent('promptsUpdated', { 
        detail: { id: prompt.id, type: 'copy' }
      }));
    } catch (error) {
      console.error('[COPY] Erro ao copiar:', error);
      toast.error("Erro ao copiar o texto do prompt.");
    }
  };

  const handleStarClick = async (rating: number, e: React.MouseEvent) => {
    // Prevenir comportamento padrão que causa recarregamento
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Aplicar atualização otimista imediatamente para feedback visual
    const oldStats = { ...stats };
    
    // Calcular novo valor otimista para mostrar ao usuário
    const newCount = (stats.ratingCount || 0) + 1;
    const newAverage = ((stats.ratingAverage || 0) * (stats.ratingCount || 0) + rating) / newCount;
    
    // Atualizar UI imediatamente (otimista)
    setStats({
      ...stats,
      ratingAverage: Number(newAverage.toFixed(2)),
      ratingCount: newCount
    });

    try {
      console.log(`[STAR] Salvando avaliação ${rating} para prompt ${prompt.id}`);
      
      // Usar a função RPC via ratingService
      const { data, error } = await addPromptRating(prompt.id, rating);
      
      if (error) {
        console.error('[STAR] Erro ao salvar avaliação:', error);
        // Reverter para os valores antigos em caso de erro
        setStats(oldStats);
        throw error;
      }
      
      // Se temos dados atualizados do servidor, usar eles
      if (data) {
        console.log(`[STAR] Salvo id ${prompt.id} avg ${data.rating_average.toFixed(1)} count ${data.rating_count}`);
        // Atualizar com os valores reais do servidor
        setStats(s => ({
          ...s,
          ratingAverage: data.rating_average,
          ratingCount: data.rating_count
        }));
      }
      
      // Chamar o callback onRate passando o ID do prompt e o tipo de avaliação
      onRate(prompt.id, true);
      
      // Dispara um evento global para notificar que os prompts devem ser atualizados
      window.dispatchEvent(new CustomEvent('promptsUpdated', { 
        detail: { id: prompt.id, type: 'rating' } 
      }));

      toast.success(`Avaliação de ${rating} estrela${rating > 1 ? 's' : ''} adicionada!`);
    } catch (error) {
      console.error('[STAR] Erro ao salvar avaliação:', error);
      // Reverter para os valores antigos em caso de erro
      setStats(oldStats);
      toast.error('Não foi possível salvar a avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async () => {
    if (!translation) {
      setIsTranslating(true);
      
      // Desativar modo otimizado para evitar recarregamentos durante tradução
      setUseOptimized(false);
      console.log('[TRANSLATE] Modo otimizado desativado para estabilizar traduções');
      
      try {
        // Log para diagnóstico
        console.log(`[TRANSLATE] Iniciando tradução do prompt ${prompt.id}: "${prompt.text.substring(0, 30)}..."`);
        
        const translatedText = await translateText(prompt.text);
        
        if (translatedText && translatedText !== prompt.text) {
          console.log(`[TRANSLATE] Tradução bem-sucedida: "${translatedText.substring(0, 30)}..."`);
          setTranslation(translatedText);
          setShowTranslation(true);
          
          // Salvar a tradução no banco de dados
          try {
            console.log('[TRANSLATE] Salvando tradução no banco de dados:', prompt.id);
            
            // Apenas para diagnóstico
            console.log('[TRANSLATE] Estado atual do prompt:', {
              id: prompt.id,
              text: prompt.text.substring(0, 30) + '...',
              translatedText: translatedText.substring(0, 30) + '...'
            });
            
            // Atualizar no Supabase
            const { error } = await supabase
              .from('prompts')
              .update({ 
                translated_text: translatedText 
              } as any) // Usando 'as any' para evitar o erro de tipo
              .eq('id', prompt.id);
              
            if (error) {
              console.error('[TRANSLATE] Erro ao salvar tradução no banco:', error);
            } else {
              console.log('[TRANSLATE] Tradução salva com sucesso no banco de dados');
              // Atualizar também o estado local do prompt para manter a tradução
              if (onUpdatePrompt) {
                // Precisamos passar translatedText na forma esperada pelo componente pai
                onUpdatePrompt(prompt.id, { translatedText });
                console.log('[TRANSLATE] Estado local do prompt atualizado com tradução');
              }
            }
          } catch (dbError) {
            console.error('[TRANSLATE] Exceção ao salvar tradução no banco:', dbError);
          }
        } else {
          console.log('[TRANSLATE] Nenhuma tradução diferente obtida');
          toast("Não foi possível traduzir este texto ou ele já está no idioma desejado.");
        }
      } catch (error) {
        console.error('[TRANSLATE] Erro na tradução:', error);
        toast("Erro ao traduzir o texto.");
      } finally {
        setIsTranslating(false);
      }
    } else {
      // Alternar entre mostrar/ocultar a tradução
      setShowTranslation(!showTranslation);
    }
  };

  const filterComments = (comments: string[]) => {
    return comments.filter(comment => {
      const lowerComment = comment.toLowerCase();
      const systemTags = [
        'male voice',
        'female voice',
        'busca',
        'selecionar todos',
        '[color:',
        'voice:male',
        'voice:female',
        'português',
        'brasil'
      ];
      return !systemTags.some(tag => 
        lowerComment.includes(tag.toLowerCase())
      );
    });
  };

  const commentTags = filterComments(
    prompt.comments.filter(comment => comment.startsWith('#'))
  ).map(tag => tag.replace(/^#/, '').trim());

  const hashtags = Array.from(
    new Set([...(prompt.tags || []), ...commentTags])
  ).map(t => `#${t}`);

  const regularComments = filterComments(
    prompt.comments.filter(comment => !comment.startsWith('#'))
  );

  // Determinar destaque visual para Top 10
  const getCardClasses = () => {
    const baseClasses = "relative p-3 transition-all duration-200";
    const avgRating = stats.ratingAverage || 0;
    
    // Top 3 - Destaque dourado
    if (avgRating >= 4.5) {
      return `${baseClasses} bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border border-amber-300 shadow-lg`;
    }
    // Top 4-10 - Destaque azul
    if (avgRating >= 4.0) {
      return `${baseClasses} bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border border-blue-300 shadow-md`;
    }
    // Top 11-20 - Destaque verde suave
    if (avgRating >= 3.5) {
      return `${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border border-green-200 shadow-sm`;
    }
    // Padrão
    return `${baseClasses} bg-white border border-gray-200 hover:shadow-sm`;
  };

  const renderStars = () => {
    const rating = stats.ratingAverage || 0;
    const displayRating = hoveredStar || rating;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const isHalfFilled = i === Math.ceil(displayRating) && displayRating % 1 !== 0;
      
      stars.push(
        <button
          key={i}
          className={`transition-all duration-150 ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          onMouseEnter={() => !isSubmitting && setHoveredStar(i)}
          onMouseLeave={() => !isSubmitting && setHoveredStar(0)}
          onClick={(e) => handleStarClick(i, e)}
          disabled={isSubmitting}
        >
          <Star
            className={`h-4 w-4 ${
              isFilled || (hoveredStar >= i)
                ? 'fill-yellow-400 text-yellow-400' 
                : isHalfFilled
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <Card className={getCardClasses()}>
      <div className="flex flex-col space-y-1.5 min-h-[100px]">
        {/* Primeira linha: Botão copiar, ID e estatísticas */}
        <div className="flex flex-wrap items-center gap-1 md:flex-nowrap">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap w-full md:w-auto">
            {/* Botão de copiar antes do ID */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-blue-50 flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopyText(prompt.text);
              }}
              title="Copiar texto"
            >
              <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            
            {/* ID completo mas com tamanho reduzido */}
            <div className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 flex-shrink-0">
              {prompt.uniqueId || prompt.id.substring(0, 8)}
            </div>
            
            <div className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 ml-1">
              <span className="inline-flex items-center gap-0.5">
                <span className="hidden sm:inline">📄</span> {stats.copyCount || 0}
              </span>
              <span className="mx-1">·</span>
              <span className="inline-flex items-center gap-0.5">
                <span className="hidden sm:inline">⭐</span> {(stats.ratingAverage || 0).toFixed(1)}
                <span className="text-gray-400">({stats.ratingCount || 0})</span>
              </span>
            </div>
          
            {/* Botão de tradução e estrelas movidos para a mesma linha em mobile */}
            <div className="flex items-center gap-1 ml-auto md:hidden mt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-5 w-5" 
                onClick={handleTranslate}
                disabled={isTranslating}
              >
                <Languages className={`h-3.5 w-3.5 ${isTranslating ? 'animate-spin' : ''} ${showTranslation ? 'text-green-500' : 'text-gray-500'}`} />
              </Button>
              {renderStars()}
            </div>
          </div>
          
          {/* Versão desktop das estrelas - escondida em mobile */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 w-6" 
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              <Languages className={`h-4 w-4 ${isTranslating ? 'animate-spin' : ''} ${showTranslation ? 'text-green-500' : 'text-gray-500'}`} />
            </Button>
            {renderStars()}
          </div>
        </div>

        {/* Texto do Prompt - Mais compacto */}
        <div className="py-1 flex-grow">
          <p className="text-sm leading-tight text-gray-800 break-words line-clamp-3 hover:line-clamp-none transition-all duration-200">
            {searchTerm ? (
              <>
                {prompt.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => {
                  if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    return <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>;
                  }
                  return part;
                })}
              </>
            ) : (
              prompt.text
            )}
          </p>
        </div>
        
        {/* Exibir a tradução se disponível e solicitada */}
        {showTranslation && translation && (
          <div className="mt-1 p-2 bg-green-50 border border-green-100 rounded-md">
            <p className="text-sm text-green-800">{translation}</p>
          </div>
        )}

        {/* Linha de tags e comentários juntos - mais compactos em mobile */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1 max-w-full md:max-w-[75%]">
            {/* Hashtags - mais compactas */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center mr-1 sm:mr-2">
                {hashtags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {hashtags.length > 2 && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                    +{hashtags.length - 2}
                  </span>
                )}
              </div>
            )}
            
            {/* Comentários na mesma linha - mais compactos */}
            {regularComments.length > 0 && (
              <div className="text-xs text-gray-600 italic flex-grow overflow-hidden text-ellipsis whitespace-nowrap max-w-full md:max-w-[65%] hover:whitespace-normal hover:text-clip transition-all duration-200">
                {regularComments[0].length > 40 ? 
                  regularComments[0].substring(0, 40) + '...' : 
                  regularComments[0]}
                {regularComments.length > 1 && ` (+${regularComments.length - 1})`}
              </div>
            )}
          </div>
          
          {/* Ações à direita - mais compactas */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto mt-1 md:mt-0">
            <CommentSection
              comments={[]}
              hashtags={[]}
              onAddComment={(comment) => {
                onAddComment(prompt.id, comment);
                toast.success("Comentário adicionado!");
              }}
              onColorSelect={(color) => {
                onAddComment(prompt.id, `[color:${color}]`);
              }}
              onHashtagAdd={(hashtag) => {
                onAddComment(prompt.id, hashtag);
                toast.success("Hashtag adicionada!");
              }}
              onStructureAdd={(structureName) => {
                onAddComment(prompt.id, `[${structureName}]`);
                toast.success("Estrutura adicionada!");
              }}
              onEditPrompt={(newText) => {
                onUpdatePrompt?.(prompt.id, { text: newText });
              }}
              onDeletePrompt={() => {
                onDeletePrompt?.(prompt.id);
              }}
              promptText={prompt.text}
              structures={structures}
            />
            
            <div className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center flex-shrink-0">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(prompt.id, checked as boolean)}
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-2 border-gray-400 cursor-pointer data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

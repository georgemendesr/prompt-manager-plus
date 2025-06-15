import { useEffect } from 'react';
import { usePromptManager } from '@/hooks/usePromptManager';

export default function PromptsPage() {
  const { invalidateData, loadCategories } = usePromptManager();
  
  // Adicionar listener global para atualizações de prompts
  useEffect(() => {
    const handlePromptsUpdated = (event: Event) => {
      console.log('🔄 [EVENT] promptsUpdated recebido na página de prompts');
      
      // Carregar categorias em vez de apenas invalidar o cache
      loadCategories();
    };
    
    // Registrar listener
    window.addEventListener('promptsUpdated', handlePromptsUpdated);
    
    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('promptsUpdated', handlePromptsUpdated);
    };
  }, [loadCategories]);
  
  return null; // Este componente apenas configura o listener global
} 
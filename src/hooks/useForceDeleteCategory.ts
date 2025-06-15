
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useForceDeleteCategory = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const forceDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (isDeleting) {
      toast.error("Exclusão já em andamento. Aguarde...");
      return false;
    }

    setIsDeleting(true);
    const operationId = `delete-${Date.now()}`;
    
    try {
      console.log(`🚀 [${operationId}] INICIANDO EXCLUSÃO FORÇADA: ${categoryName} (${categoryId})`);
      
      // 1. Verificar se a categoria existe
      const { data: categoryExists, error: checkError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', categoryId)
        .maybeSingle();
      
      if (checkError) {
        console.error(`❌ [${operationId}] Erro ao verificar categoria:`, checkError);
        throw new Error(`Erro ao verificar categoria: ${checkError.message}`);
      }
      
      if (!categoryExists) {
        console.log(`✅ [${operationId}] Categoria não encontrada - pode já ter sido excluída`);
        toast.success("Categoria já foi excluída!");
        return true;
      }
      
      console.log(`📍 [${operationId}] Categoria encontrada: ${categoryExists.name}`);
      
      // 2. Buscar subcategorias
      const { data: subcategoriesData, error: subcatError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('parent_id', categoryId);
      
      if (subcatError) {
        console.error(`❌ [${operationId}] Erro ao buscar subcategorias:`, subcatError);
      }
      
      const subcategories = subcategoriesData || [];
      console.log(`📋 [${operationId}] Encontradas ${subcategories.length} subcategorias`);
      
      // 3. Coletar todos os IDs de categorias para processar
      const allCategoryIds = [categoryId, ...subcategories.map(sub => sub.id)];
      console.log(`🎯 [${operationId}] Processando ${allCategoryIds.length} categorias`);
      
      // 4. Para cada categoria, excluir prompts e comentários
      for (const catId of allCategoryIds) {
        try {
          // Buscar prompts da categoria
          const { data: prompts, error: promptsError } = await supabase
            .from('prompts')
            .select('id')
            .eq('category_id', catId);
          
          if (promptsError) {
            console.error(`❌ [${operationId}] Erro ao buscar prompts para categoria ${catId}:`, promptsError);
            continue;
          }
          
          const promptIds = prompts?.map(p => p.id) || [];
          console.log(`📊 [${operationId}] Encontrados ${promptIds.length} prompts na categoria ${catId}`);
          
          // Excluir comentários dos prompts
          if (promptIds.length > 0) {
            const { error: commentsDeleteError } = await supabase
              .from('comments')
              .delete()
              .in('prompt_id', promptIds);
            
            if (commentsDeleteError) {
              console.error(`❌ [${operationId}] Erro ao excluir comentários:`, commentsDeleteError);
            } else {
              console.log(`✅ [${operationId}] Comentários excluídos para categoria ${catId}`);
            }
          }
          
          // Excluir prompts
          const { error: promptsDeleteError } = await supabase
            .from('prompts')
            .delete()
            .eq('category_id', catId);
          
          if (promptsDeleteError) {
            console.error(`❌ [${operationId}] Erro ao excluir prompts:`, promptsDeleteError);
          } else {
            console.log(`✅ [${operationId}] Prompts excluídos para categoria ${catId}`);
          }
          
        } catch (categoryProcessError) {
          console.error(`❌ [${operationId}] Erro ao processar categoria ${catId}:`, categoryProcessError);
        }
      }
      
      // 5. Excluir subcategorias primeiro (do mais profundo para o mais raso)
      for (const subcategory of subcategories) {
        try {
          const { error: subcatDeleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', subcategory.id);
          
          if (subcatDeleteError) {
            console.error(`❌ [${operationId}] Erro ao excluir subcategoria ${subcategory.id}:`, subcatDeleteError);
          } else {
            console.log(`✅ [${operationId}] Subcategoria excluída: ${subcategory.name}`);
          }
        } catch (subcatError) {
          console.error(`❌ [${operationId}] Erro crítico ao excluir subcategoria:`, subcatError);
        }
      }
      
      // 6. Finalmente, excluir a categoria principal
      const { error: mainDeleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (mainDeleteError) {
        console.error(`❌ [${operationId}] Erro ao excluir categoria principal:`, mainDeleteError);
        throw new Error(`Falha na exclusão: ${mainDeleteError.message}`);
      }
      
      // 7. Verificação final
      const { data: finalCheck } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .maybeSingle();
      
      if (finalCheck) {
        console.error(`❌ [${operationId}] FALHA: Categoria ainda existe após exclusão!`);
        throw new Error('Categoria ainda existe após tentativa de exclusão');
      }
      
      console.log(`✅ [${operationId}] SUCESSO! Categoria '${categoryName}' foi completamente excluída`);
      toast.success(`Categoria '${categoryName}' excluída com sucesso!`);
      return true;
      
    } catch (error) {
      console.error(`❌ [${operationId}] ERRO FINAL:`, error);
      
      if (error instanceof Error) {
        toast.error(`Erro ao excluir categoria: ${error.message}`);
      } else {
        toast.error("Erro desconhecido ao excluir categoria");
      }
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    forceDeleteCategory,
    isDeleting
  };
};

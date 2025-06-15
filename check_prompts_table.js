// Script para verificar a estrutura da tabela prompts
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase (use as mesmas do create_tables.js)
const SUPABASE_URL = 'https://nescglrcustycshemauu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lc2NnbHJjdXN0eWNzaGVtYXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NTE4MjIsImV4cCI6MjA1NTQyNzgyMn0.NoL0_YlJQ09lnOHFV0cYcy_g6XXkfvnqq6jl-TsR-Rc';

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para verificar a estrutura da tabela prompts
async function checkPromptsTable() {
  try {
    console.log('Verificando estrutura da tabela prompts...');
    
    // Buscar um prompt para verificar a estrutura
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao buscar dados da tabela prompts:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('A tabela prompts está vazia ou não existe');
      return;
    }
    
    // Exibir a estrutura da tabela
    console.log('Estrutura da tabela prompts:');
    console.log('Colunas:', Object.keys(data[0]));
    
    // Exibir tipos de dados para cada coluna
    console.log('\nTipos de dados:');
    for (const [key, value] of Object.entries(data[0])) {
      console.log(`${key}: ${value === null ? 'null' : typeof value} ${value === null ? '' : `(exemplo: ${JSON.stringify(value)})`}`);
    }
    
    // Verificar especificamente a coluna tags
    if ('tags' in data[0]) {
      console.log('\nDetalhes da coluna tags:');
      console.log(`Valor: ${JSON.stringify(data[0].tags)}`);
      console.log(`Tipo: ${Array.isArray(data[0].tags) ? 'array' : typeof data[0].tags}`);
    }
    
    // Tentar inserir um prompt de teste
    const testPrompt = {
      text: 'Prompt de teste para verificação de estrutura',
      tags: ['teste', 'verificação'],
      category_id: data[0].category_id, // Usar a mesma categoria do prompt existente
      rating: 0
    };
    
    console.log('\nTentando inserir prompt de teste:', testPrompt);
    
    const { data: insertData, error: insertError } = await supabase
      .from('prompts')
      .insert([testPrompt])
      .select();
    
    if (insertError) {
      console.error('Erro ao inserir prompt de teste:', insertError);
    } else {
      console.log('Prompt de teste inserido com sucesso:', insertData);
      
      // Limpar o prompt de teste
      const { error: deleteError } = await supabase
        .from('prompts')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('Erro ao excluir prompt de teste:', deleteError);
      } else {
        console.log('Prompt de teste excluído com sucesso');
      }
    }
  } catch (err) {
    console.error('Erro ao verificar tabela prompts:', err);
  }
}

// Executar o script
checkPromptsTable()
  .then(() => {
    console.log('Verificação concluída');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro ao executar script:', error);
    process.exit(1);
  }); 
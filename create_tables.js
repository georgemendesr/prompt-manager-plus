// Importar o cliente do Supabase
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://nescglrcustycshemauu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lc2NnbHJjdXN0eWNzaGVtYXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NTE4MjIsImV4cCI6MjA1NTQyNzgyMn0.NoL0_YlJQ09lnOHFV0cYcy_g6XXkfvnqq6jl-TsR-Rc';

// Criar o cliente
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Verificar estrutura da tabela
async function verificarEstrutura() {
  try {
    // Obter informações sobre a tabela categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar estrutura da tabela:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log('Estrutura da tabela categories:', Object.keys(data[0]));
      return Object.keys(data[0]);
    } else {
      console.log('Tabela categories está vazia');
      return [];
    }
  } catch (err) {
    console.error('Exceção ao verificar estrutura:', err);
    return null;
  }
}

// Verificar se tabelas existem
async function verificarTabelas() {
  try {
    console.log('Verificando tabelas de categorias...');
    
    // Text Categories
    const { data: textData, error: textError } = await supabase
      .from('text_categories')
      .select('*')
      .limit(1);
    
    if (textError && textError.code === '42P01') {
      console.log('❌ Tabela text_categories não existe');
    } else if (textError) {
      console.error('Erro ao verificar text_categories:', textError);
    } else {
      console.log('✅ Tabela text_categories existe');
    }
    
    // Image Categories
    const { data: imageData, error: imageError } = await supabase
      .from('image_categories')
      .select('*')
      .limit(1);
    
    if (imageError && imageError.code === '42P01') {
      console.log('❌ Tabela image_categories não existe');
    } else if (imageError) {
      console.error('Erro ao verificar image_categories:', imageError);
    } else {
      console.log('✅ Tabela image_categories existe');
    }
    
    // Music Categories
    const { data: musicData, error: musicError } = await supabase
      .from('music_categories')
      .select('*')
      .limit(1);
    
    if (musicError && musicError.code === '42P01') {
      console.log('❌ Tabela music_categories não existe');
    } else if (musicError) {
      console.error('Erro ao verificar music_categories:', musicError);
    } else {
      console.log('✅ Tabela music_categories existe');
    }
  } catch (err) {
    console.error('Exceção ao verificar tabelas:', err);
  }
}

// Criar categoria legada
async function criarCategoria(nome) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: nome,
        parent_id: null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar categoria:', error);
      return null;
    }
    
    console.log(`Categoria '${nome}' criada com sucesso:`, data);
    return data;
  } catch (err) {
    console.error('Exceção ao criar categoria:', err);
    return null;
  }
}

// Criar categoria de texto
async function criarCategoriaTexto(nome, parentId = null) {
  try {
    const { data, error } = await supabase
      .from('text_categories')
      .insert({
        name: nome,
        parent_id: parentId
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Erro ao criar categoria de texto '${nome}':`, error);
      return null;
    }
    
    console.log(`Categoria de texto '${nome}' criada com sucesso:`, data);
    return data;
  } catch (err) {
    console.error('Exceção ao criar categoria de texto:', err);
    return null;
  }
}

// Listar categorias de texto
async function listarCategoriasTexto() {
  try {
    const { data, error } = await supabase
      .from('text_categories')
      .select('*');
    
    if (error) {
      console.error('Erro ao listar categorias de texto:', error);
      return;
    }
    
    console.log('Categorias de texto encontradas:', data?.length || 0);
    if (data && data.length > 0) {
      for (const cat of data) {
        console.log(`- ${cat.id}: ${cat.name} (Parent: ${cat.parent_id || 'None'})`);
      }
    }
  } catch (err) {
    console.error('Exceção ao listar categorias de texto:', err);
  }
}

// Instruções SQL para criar tabelas
function mostrarInstrucoesSQL() {
  const sql = `
-- Text categories
create table if not exists public.text_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references text_categories(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS for text_categories
alter table public.text_categories enable row level security;
create policy "anon read" on public.text_categories
  for select using (true);
create policy "anon insert" on public.text_categories
  for insert with check (true);
create policy "anon update" on public.text_categories
  for update using (true);
create policy "anon delete" on public.text_categories
  for delete using (true);

-- Image categories
create table if not exists public.image_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references image_categories(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS for image_categories
alter table public.image_categories enable row level security;
create policy "anon read" on public.image_categories
  for select using (true);
create policy "anon insert" on public.image_categories
  for insert with check (true);
create policy "anon update" on public.image_categories
  for update using (true);
create policy "anon delete" on public.image_categories
  for delete using (true);

-- Music categories
create table if not exists public.music_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references music_categories(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS for music_categories
alter table public.music_categories enable row level security;
create policy "anon read" on public.music_categories
  for select using (true);
create policy "anon insert" on public.music_categories
  for insert with check (true);
create policy "anon update" on public.music_categories
  for update using (true);
create policy "anon delete" on public.music_categories
  for delete using (true);
`;

  console.log('\n=== INSTRUÇÕES SQL PARA CRIAR TABELAS ===');
  console.log(sql);
  console.log('=== FIM DAS INSTRUÇÕES SQL ===\n');
}

// Criar tabela de prompts de imagem com camadas e tipos
async function createImagePromptsTable() {
  console.log('Criando tabela image_prompts...');
  
  try {
    // Verificar se a tabela já existe
    const { error: checkError } = await supabase
      .from('image_prompts')
      .select('*', { count: 'exact', head: true });
    
    if (!checkError) {
      console.log('Tabela image_prompts já existe');
      return true;
    }
    
    // Se a tabela não existe, usar o cliente REST para executar SQL direto
    const apiUrl = supabase.supabaseUrl + '/rest/v1/rpc/execute_sql';
    const apiKey = supabase.supabaseKey;
    
    const sql = `
      create table if not exists public.image_prompts (
        id uuid primary key default gen_random_uuid(),
        category_id uuid references image_categories(id) on delete set null,
        title text,
        type text not null check (type in ('photo','video','design')),
        blocks jsonb not null default '[]'::jsonb,
        ai_hint text,
        created_at timestamptz default now()
      );
      
      alter table public.image_prompts enable row level security;
      
      create policy "public_read" on public.image_prompts
        for select using (true);
      
      create policy "service_insert" on public.image_prompts
        for insert with check (auth.role() = 'service_role');
    `;
    
    // Fazer requisição HTTP para executar o SQL
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        sql: sql
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao criar tabela: ${response.statusText}`);
    }
    
    console.log('Tabela image_prompts criada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela image_prompts:', error);
    return false;
  }
}

// Função principal
async function main() {
  // Verificar estrutura da tabela legada
  const colunas = await verificarEstrutura();
  console.log('Colunas disponíveis (tabela legada):', colunas);
  
  // Verificar se novas tabelas existem
  await verificarTabelas();
  
  // Mostrar instruções SQL para criar tabelas
  mostrarInstrucoesSQL();
  
  // Tentar criar categorias de texto iniciais
  try {
    console.log('\nTentando criar categorias de texto iniciais...');
    
    // Verificar se já existem categorias
    const { data: existingCategories, error: fetchError } = await supabase
      .from('text_categories')
      .select('name');
      
    if (fetchError) {
      console.error('Erro ao verificar categorias existentes:', fetchError);
    } else {
      const existingNames = existingCategories.map(cat => cat.name.toLowerCase());
      console.log('Categorias existentes:', existingNames);
      
      // Só criar categorias que não existem
      const categoriesToCreate = ['ChatGPT', 'Claude', 'Gemini', 'Experts', 'Texto', 'LLM', 'Super Prompts'];
      
      for (const categoryName of categoriesToCreate) {
        if (!existingNames.includes(categoryName.toLowerCase())) {
          await criarCategoriaTexto(categoryName);
        } else {
          console.log(`Categoria '${categoryName}' já existe, pulando...`);
        }
      }
    }
  } catch (err) {
    console.error('Erro ao criar categorias iniciais:', err);
  }
  
  // Listar categorias de texto
  await listarCategoriasTexto();
  
  // Adicionar esta linha
  await createImagePromptsTable();
  
  console.log('\nProcesso concluído!');
}

// Executar o script
main(); 
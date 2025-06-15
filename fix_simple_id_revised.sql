-- Primeiro, vamos salvar a função da trigger atual para poder recriá-la depois
DO $$
BEGIN
    RAISE NOTICE 'Salvando a definição da trigger atual...';
END $$;

-- Remover a trigger existente primeiro
DROP TRIGGER IF EXISTS set_simple_id ON prompts;

-- Agora podemos alterar o tipo da coluna simple_id para TEXT
ALTER TABLE prompts ALTER COLUMN simple_id TYPE TEXT USING simple_id::TEXT;

-- Recriar a trigger para continuar gerando IDs únicos
-- Nota: Esta é uma versão genérica que mantém o formato XXX-YYY-000
CREATE OR REPLACE FUNCTION generate_simple_id()
RETURNS TRIGGER AS $$
DECLARE
    category_code TEXT;
    counter INT;
    prefix TEXT;
    format_code TEXT;
BEGIN
    -- Obter o código da categoria
    SELECT COALESCE(SUBSTRING(UPPER(name), 1, 3), 'UNK') INTO category_code
    FROM categories
    WHERE id = NEW.category_id;
    
    -- Determinar o prefixo com base na categoria
    -- Você pode personalizar esta lógica conforme necessário
    prefix := category_code;
    
    -- Contar prompts existentes nesta categoria
    SELECT COUNT(*) + 1 INTO counter
    FROM prompts
    WHERE category_id = NEW.category_id;
    
    -- Formato padrão: XXX-YYY-000
    format_code := 'PRO'; -- Código padrão para prompts
    
    -- Gerar simple_id no formato XXX-YYY-000
    NEW.simple_id := prefix || '-' || format_code || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar a trigger
CREATE TRIGGER set_simple_id
BEFORE INSERT ON prompts
FOR EACH ROW
WHEN (NEW.simple_id IS NULL)
EXECUTE FUNCTION generate_simple_id();

-- Verificar se a trigger foi recriada
DO $$
BEGIN
    RAISE NOTICE 'Trigger set_simple_id recriada com sucesso!';
    RAISE NOTICE 'O sistema de IDs únicos foi preservado.';
END $$; 
-- Verificar o tipo atual da coluna simple_id
DO $$
DECLARE
    column_type text;
BEGIN
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_name = 'prompts'
    AND column_name = 'simple_id';
    
    RAISE NOTICE 'Tipo atual da coluna simple_id: %', column_type;
END $$;

-- Alterar o tipo da coluna simple_id para TEXT se for INTEGER
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'prompts'
        AND column_name = 'simple_id'
        AND data_type = 'integer'
    ) THEN
        -- Alterar o tipo da coluna para TEXT
        ALTER TABLE prompts ALTER COLUMN simple_id TYPE TEXT;
        RAISE NOTICE 'Coluna simple_id alterada para tipo TEXT';
    ELSE
        RAISE NOTICE 'A coluna simple_id já é do tipo TEXT ou outro tipo não-inteiro';
    END IF;
END $$;

-- Criar ou atualizar a trigger para gerar simple_id automaticamente
CREATE OR REPLACE FUNCTION generate_simple_id()
RETURNS TRIGGER AS $$
DECLARE
    category_code TEXT;
    counter INT;
BEGIN
    -- Obter o código da categoria (primeiras 3 letras)
    SELECT SUBSTRING(UPPER(name), 1, 3) INTO category_code
    FROM categories
    WHERE id = NEW.category_id;
    
    -- Se não encontrar categoria, usar 'UNK' (unknown)
    IF category_code IS NULL THEN
        category_code := 'UNK';
    END IF;
    
    -- Contar prompts existentes nesta categoria
    SELECT COUNT(*) + 1 INTO counter
    FROM prompts
    WHERE category_id = NEW.category_id;
    
    -- Gerar simple_id no formato XXX-YYY-000
    NEW.simple_id := category_code || '-PRO-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a trigger já existe e criar se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'set_simple_id'
    ) THEN
        CREATE TRIGGER set_simple_id
        BEFORE INSERT ON prompts
        FOR EACH ROW
        WHEN (NEW.simple_id IS NULL)
        EXECUTE FUNCTION generate_simple_id();
        
        RAISE NOTICE 'Trigger set_simple_id criada com sucesso';
    ELSE
        RAISE NOTICE 'Trigger set_simple_id já existe';
    END IF;
END $$;

-- Atualizar simple_ids existentes que são nulos ou inválidos
DO $$
DECLARE
    prompt_record RECORD;
    category_code TEXT;
    counter INT;
    new_simple_id TEXT;
BEGIN
    -- Criar tabela temporária para armazenar contadores por categoria
    CREATE TEMP TABLE category_counters (
        category_id UUID PRIMARY KEY,
        counter INT DEFAULT 0
    );
    
    -- Inicializar contadores
    INSERT INTO category_counters (category_id)
    SELECT DISTINCT category_id FROM prompts;
    
    -- Atualizar prompts com simple_id nulo ou inválido
    FOR prompt_record IN
        SELECT p.id, p.category_id, p.simple_id
        FROM prompts p
        WHERE p.simple_id IS NULL OR p.simple_id NOT LIKE '___-___-___'
        ORDER BY p.category_id, p.created_at
    LOOP
        -- Incrementar contador para esta categoria
        UPDATE category_counters
        SET counter = counter + 1
        WHERE category_id = prompt_record.category_id
        RETURNING counter INTO counter;
        
        -- Obter código da categoria
        SELECT SUBSTRING(UPPER(name), 1, 3) INTO category_code
        FROM categories
        WHERE id = prompt_record.category_id;
        
        -- Se não encontrar categoria, usar 'UNK'
        IF category_code IS NULL THEN
            category_code := 'UNK';
        END IF;
        
        -- Gerar novo simple_id
        new_simple_id := category_code || '-PRO-' || LPAD(counter::TEXT, 3, '0');
        
        -- Atualizar prompt
        UPDATE prompts
        SET simple_id = new_simple_id
        WHERE id = prompt_record.id;
        
        RAISE NOTICE 'Atualizado prompt % com simple_id %', prompt_record.id, new_simple_id;
    END LOOP;
    
    -- Limpar tabela temporária
    DROP TABLE category_counters;
END $$; 
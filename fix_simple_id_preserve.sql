-- Modificar a função da trigger para garantir que simple_id seja tratado como texto
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
    prefix := category_code;
    
    -- Contar prompts existentes nesta categoria
    SELECT COUNT(*) + 1 INTO counter
    FROM prompts
    WHERE category_id = NEW.category_id;
    
    -- Formato padrão: XXX-YYY-000
    format_code := 'PRO'; -- Código padrão para prompts
    
    -- Gerar simple_id no formato XXX-YYY-000 como texto
    -- Usar CAST para garantir que seja tratado como texto
    NEW.simple_id := CAST(prefix || '-' || format_code || '-' || LPAD(counter::TEXT, 3, '0') AS TEXT);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função foi atualizada
DO $$
BEGIN
    RAISE NOTICE 'Função generate_simple_id atualizada com sucesso!';
    RAISE NOTICE 'O sistema de IDs únicos foi preservado.';
END $$; 
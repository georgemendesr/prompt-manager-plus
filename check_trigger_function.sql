-- Verificar a definição da função atual
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'generate_simple_id';

-- Verificar a trigger existente
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgname = 'set_simple_id';

-- Verificar a estrutura da tabela prompts
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'prompts'
ORDER BY 
    ordinal_position; 
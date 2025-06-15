-- Alterar o tipo da coluna simple_id para TEXT
ALTER TABLE prompts ALTER COLUMN simple_id TYPE TEXT USING simple_id::TEXT;

-- Remover qualquer trigger existente que possa estar causando o problema
DROP TRIGGER IF EXISTS set_simple_id ON prompts;

-- Verificar se há alguma constraint que possa estar causando o problema
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'prompts'::regclass
        AND conname LIKE '%simple_id%'
    LOOP
        EXECUTE 'ALTER TABLE prompts DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Removida constraint: %', constraint_name;
    END LOOP;
END $$; 
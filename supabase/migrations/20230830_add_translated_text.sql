-- Adiciona coluna translated_text à tabela prompts
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS translated_text TEXT DEFAULT NULL;

-- Comentário na coluna para documentação
COMMENT ON COLUMN prompts.translated_text IS 'Texto traduzido do prompt para exibição na interface'; 
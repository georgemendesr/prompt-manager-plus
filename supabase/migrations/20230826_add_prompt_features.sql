-- Adiciona coluna para armazenar texto traduzido
ALTER TABLE prompts
ADD COLUMN translated_text TEXT DEFAULT NULL;

-- Adiciona coluna para número de cópias
ALTER TABLE prompts
ADD COLUMN copy_count INTEGER DEFAULT 0;

-- Adiciona colunas para o sistema de avaliação por estrelas
ALTER TABLE prompts
ADD COLUMN rating_average DECIMAL(3,1) DEFAULT 0,
ADD COLUMN rating_count INTEGER DEFAULT 0; 
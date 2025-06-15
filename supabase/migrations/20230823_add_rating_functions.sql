-- Função para adicionar avaliação e atualizar média em uma única transação
CREATE OR REPLACE FUNCTION add_rating(p_id UUID, p_rating INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rating_average DECIMAL;
  v_rating_count INTEGER;
  v_result JSONB;
BEGIN
  -- Inserir nova avaliação
  INSERT INTO prompt_ratings (prompt_id, rating, user_id)
  VALUES (p_id, p_rating, NULL);
  
  -- Recalcular média e contagem
  SELECT 
    COALESCE(AVG(rating), 0) as avg_rating,
    COUNT(*) as total_ratings
  INTO
    v_rating_average,
    v_rating_count
  FROM prompt_ratings
  WHERE prompt_id = p_id;
  
  -- Atualizar o prompt com a nova média e contagem
  UPDATE prompts
  SET 
    rating_average = v_rating_average,
    rating_count = v_rating_count
  WHERE id = p_id;
  
  -- Montar resultado
  v_result := jsonb_build_object(
    'rating_average', v_rating_average,
    'rating_count', v_rating_count
  );
  
  RETURN v_result;
END;
$$;

-- Função para incrementar contador de cópias
CREATE OR REPLACE FUNCTION increment_copy_count(prompt_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE prompts
  SET copy_count = COALESCE(copy_count, 0) + 1
  WHERE id = prompt_uuid;
END;
$$;

-- Verificar permissões
GRANT EXECUTE ON FUNCTION add_rating(UUID, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_copy_count(UUID) TO authenticated, anon; 
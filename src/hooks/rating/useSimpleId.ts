
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleId = (categoryName: string, subcategoryName?: string) => {
  const [simpleId, setSimpleId] = useState<string>('');

  useEffect(() => {
    const generateSimpleId = async () => {
      try {
        // Gerar as 3 letras da categoria
        const catPrefix = categoryName
          .replace(/[^a-zA-Z\s]/g, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .slice(0, 3)
          .join('')
          .padEnd(3, 'X');

        // Gerar as 3 letras da subcategoria (se existir)
        const subPrefix = subcategoryName
          ? subcategoryName
              .replace(/[^a-zA-Z\s]/g, '')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase())
              .slice(0, 3)
              .join('')
              .padEnd(3, 'X')
          : 'GEN';

        // Buscar o próximo número sequencial do banco
        const { data, error } = await supabase
          .from('prompts')
          .select('simple_id')
          .like('simple_id', `${catPrefix}-${subPrefix}-%`)
          .order('simple_id', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Erro ao buscar último ID:', error);
          // Fallback para número aleatório se houver erro
          const sequentialNumber = Math.floor(Math.random() * 999) + 1;
          const paddedNumber = sequentialNumber.toString().padStart(3, '0');
          setSimpleId(`${catPrefix}-${subPrefix}-${paddedNumber}`);
          return;
        }

        let nextNumber = 1;
        if (data && data.length > 0) {
          const lastId = data[0].simple_id;
          const lastNumberMatch = lastId?.match(/-(\d{3})$/);
          if (lastNumberMatch) {
            nextNumber = parseInt(lastNumberMatch[1]) + 1;
          }
        }

        const paddedNumber = nextNumber.toString().padStart(3, '0');
        const generatedId = `${catPrefix}-${subPrefix}-${paddedNumber}`;
        setSimpleId(generatedId);
      } catch (error) {
        console.error('Erro ao gerar Simple ID:', error);
        // Fallback para ID único baseado em timestamp
        const timestamp = Date.now().toString().slice(-3);
        setSimpleId(`ERR-GEN-${timestamp}`);
      }
    };

    if (categoryName) {
      generateSimpleId();
    }
  }, [categoryName, subcategoryName]);

  return simpleId;
};

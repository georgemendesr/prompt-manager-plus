
import { useState, useEffect } from 'react';

export const useSimpleId = (categoryName: string, subcategoryName?: string) => {
  const [simpleId, setSimpleId] = useState<string>('');

  useEffect(() => {
    const generateSimpleId = () => {
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

      // Gerar número sequencial (por enquanto aleatório, depois será baseado na contagem do BD)
      const sequentialNumber = Math.floor(Math.random() * 999) + 1;
      const paddedNumber = sequentialNumber.toString().padStart(3, '0');

      const generatedId = `${catPrefix}-${subPrefix}-${paddedNumber}`;
      setSimpleId(generatedId);
    };

    if (categoryName) {
      generateSimpleId();
    }
  }, [categoryName, subcategoryName]);

  return simpleId;
};

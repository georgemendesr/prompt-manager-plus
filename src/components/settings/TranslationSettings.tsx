import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// Chave local storage para salvar a API key
const DEEPL_API_KEY_STORAGE = 'deepl_api_key';

export const TranslationSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Carregar a chave salva ao iniciar
  useEffect(() => {
    // Usar a chave DeepL fornecida se não houver uma salva
    let savedKey = localStorage.getItem(DEEPL_API_KEY_STORAGE) || '';
    
    // Se não houver uma chave salva, usar a chave padrão
    if (!savedKey) {
      savedKey = '7646b747-9db1-4f55-9f92-05642e43be77:fx';
      localStorage.setItem(DEEPL_API_KEY_STORAGE, savedKey);
      console.log('[CONFIG] Chave DeepL padrão aplicada automaticamente');
    }
    
    setApiKey(savedKey);
    setSaved(Boolean(savedKey));
    
    // Registrar uma mensagem no console para debug
    console.log(`[CONFIG] Chave DeepL carregada: ${savedKey ? 'sim' : 'não'} (${savedKey ? savedKey.substring(0, 5) + '...' : 'vazia'})`);
  }, []);

  const handleSaveApiKey = () => {
    try {
      // Salvar no localStorage
      localStorage.setItem(DEEPL_API_KEY_STORAGE, apiKey.trim());
      setSaved(true);
      console.log(`[CONFIG] Chave DeepL salva: ${apiKey.trim().substring(0, 5)}...`);
      toast.success('Chave DeepL API salva com sucesso!');
      
      // Recarregar a página para aplicar a nova chave
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar chave API:', error);
      toast.error('Erro ao salvar a chave API');
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem(DEEPL_API_KEY_STORAGE);
    setApiKey('');
    setSaved(false);
    console.log('[CONFIG] Chave DeepL removida');
    toast.success('Chave DeepL API removida');
    
    // Recarregar a página para aplicar a mudança
    window.location.reload();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Configuração da API de Tradução</h3>
        <p className="text-sm text-gray-500">
          Para obter traduções de alta qualidade, configure sua chave DeepL API Free.
          <a
            href="https://www.deepl.com/pro-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 ml-1"
          >
            Obtenha sua chave gratuita aqui
          </a>
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700 text-sm">
          Sem uma chave DeepL API, o sistema usará o serviço MyMemory com qualidade inferior ou tradução local simplificada.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="apiKey">Chave DeepL API</Label>
        <Input
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Cole sua chave DeepL API aqui"
          className="font-mono"
          type="password"
        />
        <p className="text-xs text-gray-500">
          Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
        </p>
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleSaveApiKey} disabled={!apiKey}>
          {saved ? 'Atualizar Chave' : 'Salvar Chave'}
        </Button>
        {saved && (
          <Button variant="outline" onClick={handleClearApiKey}>
            Remover Chave
          </Button>
        )}
      </div>

      {saved && (
        <div className="bg-green-50 p-3 rounded-md border border-green-200">
          <p className="font-medium text-green-800 mb-1">
            ✓ DeepL API configurada e pronta para uso
          </p>
          <p className="text-xs text-green-700">
            Chave: {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 5)}
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-md text-sm">
        <p className="font-medium mb-1">Benefícios da DeepL API:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Traduções de qualidade superior</li>
          <li>500.000 caracteres gratuitos por mês</li>
          <li>Suporte a múltiplos idiomas</li>
          <li>Preservação da formatação do texto</li>
        </ul>
      </div>
    </Card>
  );
}; 
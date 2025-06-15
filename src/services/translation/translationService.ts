/**
 * Serviço de tradução automática com suporte a MyMemory API e fallback local
 */

// Cache para armazenar traduções já realizadas
const translationCache = new Map<string, string>();

// Chave de API DeepL - obtém do localStorage
const DEEPL_API_KEY_STORAGE = 'deepl_api_key';
// Chave da API MyMemory - valor fixo para limitar requisições
const MYMEMORY_API_KEY = '3b349f2a0863ca90e91c';
// Chave para o cache de traduções no localStorage
const TRANSLATION_CACHE_STORAGE = 'translation_cache_v1';

// Carregar cache do localStorage
function loadTranslationCache() {
  try {
    const cachedData = localStorage.getItem(TRANSLATION_CACHE_STORAGE);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      Object.entries(parsedData).forEach(([key, value]) => {
        translationCache.set(key, value as string);
      });
      console.log(`[CACHE] Carregado cache de traduções com ${translationCache.size} entradas`);
      
      // Mostrar as primeiras 5 entradas para diagnóstico
      let count = 0;
      translationCache.forEach((value, key) => {
        if (count < 5) {
          console.log(`[CACHE] Amostra #${count+1}: "${key.substring(0, 30)}..." => "${value.substring(0, 30)}..."`);
          count++;
        }
      });
    } else {
      console.log('[CACHE] Nenhum cache de traduções encontrado no localStorage');
    }
  } catch (error) {
    console.error('[CACHE] Erro ao carregar cache de traduções:', error);
  }
}

// Salvar cache no localStorage
function saveTranslationCache() {
  try {
    const cacheObject: Record<string, string> = {};
    translationCache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    localStorage.setItem(TRANSLATION_CACHE_STORAGE, JSON.stringify(cacheObject));
    console.log(`[CACHE] Cache de traduções salvo com ${translationCache.size} entradas`);
  } catch (error) {
    console.error('[CACHE] Erro ao salvar cache de traduções:', error);
  }
}

// Inicializar cache na primeira execução
if (typeof window !== 'undefined') {
  loadTranslationCache();
}

// Função para adicionar ao cache
function addToTranslationCache(text: string, targetLang: string, translation: string) {
  const cacheKey = `${text}_${targetLang}`;
  translationCache.set(cacheKey, translation);
  console.log(`[CACHE] Adicionando tradução ao cache: "${text.substring(0, 30)}..." => "${translation.substring(0, 30)}..."`);
  
  // Salvar no localStorage imediatamente
  saveTranslationCache();
  
  return translation;
}

// Função para obter do cache
function getFromTranslationCache(text: string, targetLang: string): string | null {
  const cacheKey = `${text}_${targetLang}`;
  const cached = translationCache.get(cacheKey);
  
  if (cached) {
    console.log(`[CACHE] ✅ Usando tradução em cache para: "${text.substring(0, 30)}..."`);
    return cached;
  }
  
  console.log(`[CACHE] ❌ Nenhuma tradução em cache para: "${text.substring(0, 30)}..."`);
  return null;
}

// Função para obter a chave DeepL API do localStorage
function getDeeplApiKey(): string {
  if (typeof window !== 'undefined') {
    const key = localStorage.getItem(DEEPL_API_KEY_STORAGE) || '';
    const isValidKey = Boolean(key && key.trim() !== '' && key.includes('-') && key.length > 30);
    console.log(`[DEEPL] Chave API ${isValidKey ? 'encontrada' : 'não encontrada'} (${isValidKey ? key.substring(0, 5) + '...' : 'vazia ou inválida'})`);
    return isValidKey ? key : '';
  }
  console.log('[DEEPL] Window não disponível, não é possível acessar localStorage');
  return '';
}

// Limite de frequência para APIs de tradução - reduzido para uma requisição a cada 3 segundos
const rateLimiter = {
  queue: [] as { text: string, targetLang: string, resolve: (value: string) => void, reject: (error: Error) => void }[],
  lastRequestTime: 0,
  minTimeBetweenRequests: 3000, // 3 segundos entre requisições (para evitar 429)
  isProcessing: false,
  consecutiveErrors: 0,
  maxConsecutiveErrors: 3,
  
  // Adiciona uma solicitação à fila
  enqueue(text: string, targetLang: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Verificar no cache primeiro
      const cachedTranslation = getFromTranslationCache(text, targetLang);
      if (cachedTranslation) {
        return resolve(cachedTranslation);
      }
      
      this.queue.push({ text, targetLang, resolve, reject });
      
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  },
  
  // Processa a fila de solicitações
  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    // Verificar se estamos em modo de espera por muitos erros
    if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
      console.log(`[RATE LIMITER] Muitos erros consecutivos (${this.consecutiveErrors}), pausando por 30 segundos`);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Pausa de 30 segundos
      this.consecutiveErrors = 0; // Reset do contador
    }
    
    // Verificar o tempo desde a última requisição
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastRequestTime + this.minTimeBetweenRequests - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    const request = this.queue.shift();
    if (!request) {
      this.processQueue();
      return;
    }
    
    try {
      // Verificar no cache novamente (pode ter sido adicionado enquanto esperava)
      const cachedTranslation = getFromTranslationCache(request.text, request.targetLang);
      if (cachedTranslation) {
        request.resolve(cachedTranslation);
        this.processQueue();
        return;
      }
      
      // Tentar traduzir
      const result = await doTranslateRequest(request.text, request.targetLang);
      
      // Resetar o contador de erros em caso de sucesso
      this.consecutiveErrors = 0;
      
      request.resolve(result);
    } catch (error) {
      console.error('[RATE LIMITER] Erro na tradução:', error);
      
      // Incrementar contador de erros
      this.consecutiveErrors++;
      
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        // Erro de limite de taxa - tentar novamente mais tarde
        console.log(`[RATE LIMITER] Erro 429 detectado, recolocando na fila`);
        this.queue.unshift(request); // Coloca de volta no início da fila
        
        // Aumentar temporariamente o tempo entre requisições
        this.minTimeBetweenRequests = Math.min(30000, this.minTimeBetweenRequests * 2);
        console.log(`[RATE LIMITER] Aumentando tempo entre requisições para ${this.minTimeBetweenRequests / 1000}s`);
        
        // Esperar um tempo maior antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else if (error.message === 'UNTRANSLATED') {
        // Texto não traduzido - retornar o próprio texto
        request.reject(new Error('Texto não pôde ser traduzido - idêntico ao original'));
      } else {
        // Outros erros - retornar o texto original e rejeitar
        request.reject(error);
      }
    } finally {
    this.lastRequestTime = Date.now();
    
      // Continuar processando a fila após um tempo
    setTimeout(() => this.processQueue(), this.minTimeBetweenRequests);
    }
  }
};

// Função para traduzir com a DeepL API (desativada conforme solicitado)
async function translateWithDeepL(text: string, targetLang: string): Promise<string> {
  // Implementação mantida apenas como referência, mas pulamos direto para MyMemory
  return Promise.reject(new Error('DeepL API not used in this implementation'));
}

// Função para traduzir com a MyMemory API
async function translateWithMyMemory(text: string, targetLang: string): Promise<string> {
  console.log(`[MYMEMORY] Traduzindo: ${text.substring(0, 30)}...`);
  
  try {
    // Usar a API com a chave de autenticação
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}&key=${MYMEMORY_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Verificar resposta e extrair tradução
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      let result = data.responseData.translatedText;
      
      // Se recebemos uma tradução, salvamos no cache mesmo que seja idêntica
      console.log(`[MYMEMORY] Tradução recebida: ${result.substring(0, 30)}...`);
      
      // Adicionar ao cache independentemente se é igual ou não
      addToTranslationCache(text, targetLang, result);
      
      return result;
    }
    
    // Verificar limites de uso
    if (data.responseStatus === 429 || (data.responseData && data.responseData.limit)) {
      console.error('[MYMEMORY] Limite de API atingido:', data);
      throw new Error('429 Too Many Requests');
    }
    
    throw new Error(`MyMemory API returned error: ${data.responseStatus}`);
  } catch (error) {
    console.error('[MYMEMORY] Erro ao traduzir:', error);
    
    // Para qualquer erro da API, tentar tradução local
    console.log('[MYMEMORY] Usando tradução local simplificada como fallback');
    const localTranslation = simpleTranslate(text);
    
    // Salvar tradução local no cache também
    addToTranslationCache(text, targetLang, localTranslation);
    
    return localTranslation;
  }
}

// Implementação de fallback de tradução quando as APIs não funcionam
function simpleTranslate(text: string): string {
  // Substitui algumas palavras em inglês por português
  const translations: Record<string, string> = {
    'the': 'o',
    'a': 'um',
    'is': 'é',
    'and': 'e',
    'or': 'ou',
    'with': 'com',
    'in': 'em',
    'to': 'para',
    'of': 'de',
    'by': 'por',
    'for': 'para',
    'on': 'em',
    'at': 'em',
    'as': 'como',
    'an': 'um',
    'not': 'não',
    'this': 'isto',
    'that': 'aquilo',
    'these': 'estes',
    'those': 'aqueles',
    'from': 'de',
    'then': 'então',
    'if': 'se',
    'but': 'mas',
    'because': 'porque',
    'you': 'você',
    'I': 'eu',
    'we': 'nós',
    'they': 'eles',
    'he': 'ele',
    'she': 'ela',
    'it': 'isto',
    'your': 'seu',
    'my': 'meu',
    'our': 'nosso',
    'their': 'deles',
    'his': 'dele',
    'her': 'dela',
    'its': 'seu',
    'what': 'o que',
    'who': 'quem',
    'where': 'onde',
    'when': 'quando',
    'why': 'por que',
    'how': 'como',
    'all': 'todos',
    'some': 'alguns',
    'any': 'qualquer',
    'no': 'não',
    'yes': 'sim',
    'can': 'pode',
    'will': 'vai',
    'just': 'apenas',
    'more': 'mais',
    'most': 'maioria',
    'other': 'outro',
    'another': 'outro',
    'new': 'novo',
    'old': 'velho',
    'good': 'bom',
    'bad': 'ruim',
    'high': 'alto',
    'low': 'baixo',
    'big': 'grande',
    'small': 'pequeno',
    'here': 'aqui',
    'there': 'lá',
    'now': 'agora',
    'later': 'depois',
    'never': 'nunca',
    'always': 'sempre',
    'sometimes': 'às vezes',
    'often': 'frequentemente',
    'use': 'usar',
    'make': 'fazer',
    'see': 'ver',
    'go': 'ir',
    'get': 'obter',
    'do': 'fazer',
    'say': 'dizer',
    'tell': 'contar',
    'know': 'saber',
    'think': 'pensar',
    'find': 'encontrar',
    'need': 'precisar',
    'want': 'querer',
    'try': 'tentar',
    'feel': 'sentir',
    'become': 'tornar-se',
    'leave': 'sair',
    'put': 'colocar',
    'mean': 'significar',
    'keep': 'manter',
    'let': 'deixar',
    'begin': 'começar',
    'seem': 'parecer',
    'help': 'ajudar',
    'talk': 'falar',
    'turn': 'virar',
    'start': 'iniciar',
    'show': 'mostrar',
    'hear': 'ouvir',
    'play': 'jogar',
    'run': 'correr',
    'move': 'mover',
    'like': 'gostar',
    'live': 'viver',
    'believe': 'acreditar',
    'hold': 'segurar',
    'bring': 'trazer',
    'happen': 'acontecer',
    'write': 'escrever',
    'provide': 'fornecer',
    'sit': 'sentar',
    'stand': 'ficar de pé',
    'lose': 'perder',
    'pay': 'pagar',
    'meet': 'encontrar',
    'include': 'incluir',
    'continue': 'continuar',
    'set': 'definir',
    'learn': 'aprender',
    'change': 'mudar',
    'lead': 'liderar',
    'understand': 'entender',
    'watch': 'assistir',
    'follow': 'seguir',
    'stop': 'parar',
    'create': 'criar',
    'speak': 'falar',
    'read': 'ler',
    'allow': 'permitir',
    'add': 'adicionar',
    'spend': 'gastar',
    'grow': 'crescer',
    'open': 'abrir',
    'walk': 'andar',
    'win': 'ganhar',
    'offer': 'oferecer',
    'remember': 'lembrar',
    'love': 'amar',
    'consider': 'considerar',
    'appear': 'aparecer',
    'buy': 'comprar',
    'wait': 'esperar',
    'serve': 'servir',
    'die': 'morrer',
    'send': 'enviar',
    'expect': 'esperar',
    'build': 'construir',
    'stay': 'ficar',
    'fall': 'cair',
    'cut': 'cortar',
    'reach': 'alcançar',
    'kill': 'matar',
    'remain': 'permanecer',
    
    // Termos musicais
    'reggae': 'reggae',
    'rhythm': 'ritmo',
    'guitar': 'guitarra',
    'horn': 'trompa',
    'vocal': 'vocal',
    'jazz': 'jazz',
    'organ': 'órgão',
    'textures': 'texturas',
    'smooth': 'suave',
    'dialogue': 'diálogo',
    'improvised': 'improvisado',
    'voice': 'voz',
    'motifs': 'motivos',
    'chill': 'relaxante',
    'lounge': 'lounge',
    'style': 'estilo',
    'soft': 'suave',
    'laid-back': 'descontraído',
    'mellow': 'melodioso',
    'playful': 'divertido',
    'scat': 'scat',
    'phrasing': 'fraseado',
    'cascading': 'em cascata',
    'offbeats': 'contratempos',
    
    // Termos de gêneros musicais
    'rock': 'rock',
    'pop': 'pop',
    'blues': 'blues',
    'electronic': 'eletrônica',
    'classical': 'clássica',
    'folk': 'folk',
    'country': 'country',
    'rap': 'rap',
    'hip-hop': 'hip-hop',
    'soul': 'soul',
    'funk': 'funk',
    'disco': 'disco',
    'ambient': 'ambiente',
    'techno': 'techno',
    'house': 'house',
    'r&b': 'r&b',
    'punk': 'punk',
    'metal': 'metal',
    'alternative': 'alternativo',
    'indie': 'indie',
    'ska': 'ska',
    'dub': 'dub',
    'dubstep': 'dubstep',
    'trap': 'trap',
    'samba': 'samba',
    'bossa': 'bossa',
    'nova': 'nova',
    'salsa': 'salsa',
    
    // Instrumentos
    'bass': 'baixo',
    'drums': 'bateria',
    'piano': 'piano',
    'keyboard': 'teclado',
    'synthesizer': 'sintetizador',
    'synth': 'sintetizador',
    'violin': 'violino',
    'cello': 'violoncelo',
    'trumpet': 'trompete',
    'saxophone': 'saxofone',
    'sax': 'sax',
    'flute': 'flauta',
    'clarinet': 'clarinete',
    'percussion': 'percussão',
    'strings': 'cordas',
    'brass': 'metais',
    'woodwinds': 'madeiras',
    'banjo': 'banjo',
    'harmonica': 'gaita',
    'harp': 'harpa',
    'mandolin': 'bandolim',
    'accordion': 'acordeão',
    'turntable': 'toca-discos',
    'sampler': 'sampler',
    'drum_machine': 'caixa de ritmos',
    
    // Elementos musicais
    'beat': 'batida',
    'groove': 'groove',
    'melody': 'melodia',
    'harmony': 'harmonia',
    'chord': 'acorde',
    'progression': 'progressão',
    'scale': 'escala',
    'key': 'tonalidade',
    'tempo': 'andamento',
    'time_signature': 'compasso',
    'lyrics': 'letra',
    'verse': 'verso',
    'chorus': 'refrão',
    'hook': 'gancho',
    'bridge': 'ponte',
    'intro': 'introdução',
    'outro': 'finalização',
    'solo': 'solo',
    'riff': 'riff',
    'lick': 'lick',
    'bassline': 'linha de baixo',
    'backbeat': 'contratempo',
    'offbeat': 'contratempo',
    'breakdown': 'quebra',
    'drop': 'queda',
    'buildup': 'construção',
    'climax': 'clímax',
    'loop': 'loop',
    'sample': 'amostra',
    'remix': 'remix',
    'mashup': 'mashup',
    
    // Adjetivos musicais
    'upbeat': 'animado',
    'uplifting': 'edificante',
    'energetic': 'energético',
    'relaxed': 'relaxado',
    'groovy': 'envolvente',
    'funky': 'funky',
    'jazzy': 'jazzístico',
    'bluesy': 'melancólico',
    'soulful': 'expressivo',
    'psychedelic': 'psicodélico',
    'dreamy': 'sonhador',
    'atmospheric': 'atmosférico',
    'ethereal': 'etéreo',
    'haunting': 'marcante',
    'powerful': 'poderoso',
    'driving': 'intenso',
    'catchy': 'pegajoso',
    'vibrant': 'vibrante',
    'lively': 'animado',
    'dynamic': 'dinâmico',
    'hypnotic': 'hipnótico',
    'melodic': 'melódico',
    'harmonic': 'harmônico',
    'rhythmic': 'rítmico',
    'acoustic': 'acústico',
    'electric': 'elétrico',
    'digital': 'digital',
    'analog': 'analógico',
    'distorted': 'distorcido',
    'clean': 'limpo',
    
    // Técnicas e estilos vocais
    'vocals': 'vocais',
    'singing': 'canto',
    'singer': 'cantor',
    'backing': 'apoio',
    'backing_vocals': 'vocais de apoio',
    'harmony_vocals': 'vocais harmônicos',
    'falsetto': 'falsete',
    'vibrato': 'vibrato',
    'growl': 'gutural',
    'scream': 'grito',
    'whisper': 'sussurro',
    'spoken_word': 'palavra falada',
    'adlib': 'improviso',
    'melisma': 'melisma',
    
    // Termos técnicos de produção
    'production': 'produção',
    'mix': 'mixagem',
    'mixing': 'mixagem',
    'mastering': 'masterização',
    'recording': 'gravação',
    'producer': 'produtor',
    'arrangement': 'arranjo',
    'composition': 'composição',
    'eq': 'equalização',
    'equalization': 'equalização',
    'compression': 'compressão',
    'reverb': 'reverberação',
    'delay': 'delay',
    'echo': 'eco',
    'filter': 'filtro',
    'effects': 'efeitos',
    'fx': 'efeitos',
    'processing': 'processamento',
    'automation': 'automação',
    'panning': 'panorâmica',
    'stereo': 'estéreo',
    'mono': 'mono',
    'level': 'nível',
    'volume': 'volume',
    'gain': 'ganho',
    'frequency': 'frequência',
    'spectrum': 'espectro',
    'dynamic_range': 'faixa dinâmica',
    
    // Termos estruturais e descritivos
    'texture': 'textura',
    'layer': 'camada',
    'layers': 'camadas',
    'section': 'seção',
    'part': 'parte',
    'segment': 'segmento',
    'phrase': 'frase',
    'motif': 'motivo',
    'theme': 'tema',
    'variation': 'variação',
    'pattern': 'padrão',
    'sequence': 'sequência',
    'structure': 'estrutura',
    'form': 'forma',
    'bar': 'compasso',
    'measure': 'compasso',
    'note': 'nota',
    'pitch': 'altura',
    'duration': 'duração',
    'timbre': 'timbre',
    'tone': 'tom',
    'sound': 'som',
    'noise': 'ruído',
    'ambience': 'ambiente',
    'atmosphere': 'atmosfera',
    'vibe': 'vibração',
    'mood': 'humor',
    'genre': 'gênero',
    'influence': 'influência',
    'feel_sensation': 'sensação',
    
    // Termos específicos do reggae
    'skank': 'skank',
    'rockers': 'rockers',
    'roots': 'roots',
    'steppers': 'steppers',
    'dancehall': 'dancehall',
    'riddim': 'riddim',
    'one_drop': 'one drop',
    'nyabinghi': 'nyabinghi',
    'toasting': 'toasting',
    'chant': 'canto',
    'rastafari': 'rastafari',
    
    // Termos específicos do jazz
    'swing': 'swing',
    'bebop': 'bebop',
    'fusion': 'fusion',
    'modal': 'modal',
    'free_jazz': 'free jazz',
    'improvisation': 'improvisação',
    'improv': 'improvisação',
    'comping': 'acompanhamento',
    'walking_bass': 'walking bass',
    'trading_fours': 'trading fours',
    'call_and_response': 'chamada e resposta',
    'scat_singing': 'canto scat',
    'cool': 'cool',
    'hot': 'hot',
    'bop': 'bop',
    'big_band': 'big band',
    'combo': 'combo',
    'standards': 'standards',
    'charts': 'partituras',
    'changes': 'mudanças',
    'vamp': 'vamp',
    
    // Termos específicos da música eletrônica
    'build_up': 'construção',
    'break': 'quebra',
    'four_on_the_floor': 'four on the floor',
    'kick': 'bumbo',
    'snare': 'caixa',
    'hi_hat': 'chimbal',
    'clap': 'palma',
    'bpm': 'bpm',
    'lfo': 'lfo',
    'sidechain': 'sidechain',
    'wobble': 'wobble',
    'glitch': 'glitch',
    'acid': 'acid',
    'trance': 'trance',
    'edm': 'edm',
    'idm': 'idm',
    'dj': 'dj',
    'mix_set': 'mix',
    'set_list': 'set',
    'playlist': 'playlist',
    'track': 'faixa',
    
    // Elementos expressivos
    'crescendo': 'crescendo',
    'decrescendo': 'decrescendo',
    'diminuendo': 'diminuendo',
    'forte': 'forte',
    'piano_dynamic': 'piano',
    'accent': 'acento',
    'staccato': 'staccato',
    'legato': 'legato',
    'articulation': 'articulação',
    'dynamics': 'dinâmica',
    'expression': 'expressão',
    'feeling': 'sentimento',
    'emotion': 'emoção',
    'intensity': 'intensidade',
    'attack': 'ataque',
    'decay': 'decaimento',
    'sustain': 'sustentação',
    'release': 'liberação',
    
    // Termos de música eletrônica
    'sequencer': 'sequenciador',
    'arpeggiator': 'arpejador',
    'oscillator': 'oscilador',
    'waveform': 'forma de onda',
    'sine': 'senoidal',
    'square': 'quadrada',
    'saw': 'dente de serra',
    'triangle_wave': 'triangular',
    'modulation': 'modulação',
    'envelope': 'envelope',
    'parameter': 'parâmetro',
    'preset': 'predefinição',
    'patch': 'patch',
    
    // Termos específicos de guitarra/baixo
    'power_chord': 'power chord',
    'chord_progression': 'progressão de acordes',
    'strumming': 'palhetada',
    'picking': 'picking',
    'fingerpicking': 'dedilhado',
    'slide': 'slide',
    'bend': 'bend',
    'hammer_on': 'hammer-on',
    'pull_off': 'pull-off',
    'tapping': 'tapping',
    'whammy': 'alavanca',
    'wah': 'wah',
    'distortion': 'distorção',
    'overdrive': 'overdrive',
    'fuzz': 'fuzz',
    'amp': 'amplificador',
    'cabinet': 'gabinete',
    'fretboard': 'braço',
    'fret': 'traste',
    'string': 'corda',
    'pickup': 'captador',
    
    // Termos específicos de forró
    'forró': 'forró',
    'xote': 'xote',
    'orquestral': 'orquestral',
    'zabumba': 'zabumba',
    'accordion_lines': 'linhas de acordeão',
    'accordion_melodies': 'melodias de acordeão',
    'accordion_phrases': 'frases de acordeão',
    'accordion_arpeggios': 'arpejos de acordeão',
    'accordion_riffs': 'riffs de acordeão',
    'zabumba_beat': 'batida de zabumba',
    'zabumba_rhythm': 'ritmo de zabumba',
    'triangle_instrument': 'triângulo',
    'sanfona': 'sanfona',
    'rabeca': 'rabeca',
    'viola_caipira': 'viola caipira',
    'pífano': 'pífano',
    'pandeiro': 'pandeiro',
    'tambor_de_mão': 'tambor de mão',
    'pé_de_serra': 'pé-de-serra',
    'sertão': 'sertão',
    'fiddle': 'rabeca',
    'hand_harmonica': 'gaita de mão',
    'poetic_lyrics': 'letras poéticas',
    'improvisational': 'improvisacional',
    'heartfelt': 'sincero',
    'nostalgic': 'nostálgico',
    'romantic': 'romântico',
    'festa_junina': 'festa junina',
    'forró_emotivo': 'forró emotivo',
    'forró_de_homenagem': 'forró de homenagem',
    'forró_nordestino': 'forró nordestino',
    'forró_cerimonial': 'forró cerimonial',
    'forró_poético': 'forró poético',
    'forró_raiz': 'forró raiz',
    'forró_lento': 'forró lento',
    'forró_acústico': 'forró acústico',
    'forró_espiritual': 'forró espiritual',
    'forró_de_memória': 'forró de memória',
    'forró_litúrgico': 'forró litúrgico',
    'forró_de_lembrança': 'forró de lembrança',
    'forró_introspectivo': 'forró introspectivo',
    'forró_para_despedida': 'forró para despedida',
    'forró_ancestral': 'forró ancestral',
    'forró_de_eternidade': 'forró de eternidade',
    
    // Expressões qualificativas para música brasileira
    'saudade': 'saudade',
    'emotive': 'emotivo',
    'serene': 'sereno',
    'rustic': 'rústico',
    'cinematic': 'cinematográfico',
    'litúrgico': 'litúrgico',
    'warm': 'caloroso',
    'string_ensemble': 'conjunto de cordas',
    'inspiring': 'inspirador',
    'vocal_harmonies': 'harmonias vocais',
    'string_crescendos': 'crescendos de cordas',
    'steady': 'constante',
    'introspective': 'introspectivo',
    'reflective': 'reflexivo',
    'inspiring_tone': 'tom inspirador',
    'string_swells': 'ondulações de cordas',
    'gentle': 'suave',
    'uplifting_lyrics': 'letras edificantes',
    'soothing': 'calmante',
    'orchestral_strings': 'cordas orquestrais',
    'pulsing': 'pulsante',
    'heartfelt_vocal_delivery': 'entrega vocal sincera',
    'nostalgic_atmosphere': 'atmosfera nostálgica',
    'violin_swells': 'ondulações de violino',
    'emotive_accordion_melodies': 'melodias emotivas de acordeão',
    'lush_string_harmonies': 'ricas harmonias de cordas',
    'expressive': 'expressivo',
    'improvisations': 'improvisações',
    'crescendos': 'crescendos',
    'arpeggios': 'arpejos',
    'harmonies': 'harmonias',
    'ad_libs': 'improvisos',
    'storytelling': 'narrativa',
    'interludes': 'interlúdios',
    'freeform': 'livre',
    'call_and_response_vocal': 'chamada e resposta',
    'percussive': 'percussivo',
    'brushed': 'escovado',
    'fingerstyle': 'dedilhado',
    'arpeggiated': 'arpejado',
  };

  // Dividir texto em palavras e traduzir cada uma
  const words = text.split(' ');
  const translated = words.map(word => {
    // Preservar pontuação
    const punctuation = word.match(/[.,!?;:]$/);
    const cleanWord = punctuation ? word.slice(0, -1) : word;
    
    // Verificar se a palavra está no dicionário
    const translation = translations[cleanWord.toLowerCase()];
    
    // Reconstruir palavra com pontuação
    return (translation || cleanWord) + (punctuation ? punctuation[0] : '');
  });
  
  return translated.join(' ');
}

// Função principal para fazer a tradução usando a API mais apropriada
async function doTranslateRequest(text: string, targetLang: string): Promise<string> {
  try {
    // Tentar com MyMemory API
    return await translateWithMyMemory(text, targetLang);
  } catch (error) {
    console.log('[TRANSLATE] Todas as APIs falharam, usando tradução local simplificada');
    const localTranslation = simpleTranslate(text);
    
    // Salvar no cache
    addToTranslationCache(text, targetLang, localTranslation);
    
    return localTranslation;
  }
}

// Função exportada para tradução - usa o controle de taxa
export const translateText = (text: string, targetLang: string = 'pt'): Promise<string> => {
  console.log(`[TRANSLATE] Traduzindo texto (${text.length} caracteres): "${text.substring(0, 30)}..."`);
  
  // Verificar no cache primeiro (verificação rápida antes de enfileirar)
  const cachedTranslation = getFromTranslationCache(text, targetLang);
  if (cachedTranslation) {
    return Promise.resolve(cachedTranslation);
  }
  
  return rateLimiter.enqueue(text, targetLang);
};

// Função simples para detectar se o texto parece estar em inglês
export const isEnglishText = (text: string): boolean => {
  // Lista de palavras comuns em inglês para detecção
  const commonEnglishWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would', 'there', 'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when', 'make', 'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'should'];
  
  // Lista de palavras comuns em português para contra-verificação
  const commonPortugueseWords = ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram'];
  
  // Dividir o texto em palavras e converter para minúsculas
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 1);
  
  if (words.length === 0) {
    return false;
  }
  
  // Contar ocorrências
  let englishCount = 0;
  let portugueseCount = 0;
  
  for (const word of words) {
    // Remover pontuação para comparação
    const cleanWord = word.replace(/[.,!?;:()]/g, '');
    if (cleanWord.length < 2) continue;
    
    if (commonEnglishWords.includes(cleanWord)) {
      englishCount++;
    }
    
    if (commonPortugueseWords.includes(cleanWord)) {
      portugueseCount++;
    }
  }
  
  // Calcular porcentagens
  const englishPercentage = (englishCount / words.length) * 100;
  const portuguesePercentage = (portugueseCount / words.length) * 100;
  
  // Logar para diagnóstico
  console.log(`[isEnglishText] Palavras: ${words.length}, Inglês: ${englishCount} (${englishPercentage.toFixed(1)}%), Português: ${portugueseCount} (${portuguesePercentage.toFixed(1)}%), Resultado: ${englishPercentage > portuguesePercentage}`);
  
  // Considerar inglês se tiver mais palavras em inglês que em português
  return englishPercentage > portuguesePercentage;
}; 
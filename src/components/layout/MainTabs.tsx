import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MainTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar qual tab está ativa com base na URL atual
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/agents')) return 'agents';
    if (path.startsWith('/prompts')) return 'music';
    if (path.startsWith('/text')) return 'text';
    if (path.startsWith('/image')) return 'image';
    if (path.startsWith('/workspace')) return 'workspace';
    if (path.startsWith('/links')) return 'links';
    if (path.startsWith('/lyrics')) return 'lyrics';
    return 'music'; // Default
  };
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'agents':
        navigate('/agents');
        break;
      case 'music':
        navigate('/prompts');
        break;
      case 'text':
        navigate('/text');
        break;
      case 'image':
        navigate('/image');
        break;
      case 'workspace':
        navigate('/workspace');
        break;
      case 'links':
        navigate('/links');
        break;
      case 'lyrics':
        navigate('/lyrics');
        break;
      default:
        navigate('/prompts');
    }
  };
  
  return (
    <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
      <TabsList className="bg-white/60 backdrop-blur-sm mb-4 sm:mb-6 w-full flex">
        <TabsTrigger value="agents" className="flex-1 text-sm font-medium uppercase">Agentes</TabsTrigger>
        <TabsTrigger value="music" className="flex-1 text-sm font-medium uppercase">Música</TabsTrigger>
        <TabsTrigger value="text" className="flex-1 text-sm font-medium uppercase">Texto</TabsTrigger>
        <TabsTrigger value="image" className="flex-1 text-sm font-medium uppercase">Imagem</TabsTrigger>
        <TabsTrigger value="workspace" className="flex-1 text-sm font-medium uppercase">Workspace</TabsTrigger>
        <TabsTrigger value="links" className="flex-1 text-sm font-medium uppercase">Links</TabsTrigger>
        <TabsTrigger value="lyrics" className="flex-1 text-sm font-medium uppercase">Letras</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}; 
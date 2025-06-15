import { Button } from "@/components/ui/button";

interface Agent {
  id: string;
  name: string;
  slug: string;
}

interface AgentsSubmenuProps {
  assistants: Agent[];
  selectedAssistant: Agent | null;
  onSelectAssistant: (assistant: Agent) => void;
}

export const AgentsSubmenu = ({ 
  assistants, 
  selectedAssistant, 
  onSelectAssistant 
}: AgentsSubmenuProps) => {
  console.log("AgentsSubmenu render:", { 
    assistants: assistants.map(a => a.id), 
    selectedId: selectedAssistant?.id 
  });
  
  const handleSelectAssistant = (assistant: Agent) => {
    console.log("AgentsSubmenu.handleSelectAssistant:", assistant);
    onSelectAssistant(assistant);
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-2 overflow-x-auto">
      <div className="flex space-x-2 min-w-max">
        {assistants.map((assistant) => (
          <Button
            key={assistant.id}
            variant={selectedAssistant?.id === assistant.id ? "default" : "ghost"}
            className={`text-base font-semibold px-4 py-2 ${
              selectedAssistant?.id === assistant.id ? 'bg-violet-600 text-white' : ''
            }`}
            onClick={() => handleSelectAssistant(assistant)}
          >
            {assistant.name}
          </Button>
        ))}
      </div>
    </div>
  );
}; 
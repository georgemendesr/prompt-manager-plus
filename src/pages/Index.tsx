
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
              alt="R10 Comunicação Criativa" 
              className="h-16 w-auto"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              R10 Comunicação Criativa
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
        </div>
      </div>
    </div>
  );
};

export default Index;

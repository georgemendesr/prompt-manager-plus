
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
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Transformando ideias em comunicação impactante
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Somos especialistas em criar soluções criativas que conectam sua marca ao seu público-alvo.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Marketing Digital</h3>
              <p className="text-gray-600">
                Estratégias personalizadas para aumentar sua presença online
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Design Gráfico</h3>
              <p className="text-gray-600">
                Identidade visual que destaca sua marca no mercado
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Gestão de Mídias</h3>
              <p className="text-gray-600">
                Gerenciamento completo das suas redes sociais
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Entre em contato
            </h3>
            <p className="text-lg text-gray-600">
              Vamos criar juntos a melhor estratégia para sua marca!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

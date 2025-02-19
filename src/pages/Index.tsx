
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/lovable-uploads/9cb1402d-bcb0-479f-874d-9eba6445170d.png')`,
          filter: "brightness(0.3)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
          {/* Logo Container */}
          <div className="mb-12">
            <img 
              src="/lovable-uploads/96b8ea8f-5502-4611-b6ef-97206a354361.png" 
              alt="R10 Comunicação Criativa" 
              className="w-96 h-auto mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/150x60?text=R10";
              }}
            />
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center space-y-8 glass-dark rounded-2xl p-12 backdrop-blur-md">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              R10 Comunicação Criativa
            </h1>
            <p className="text-4xl font-medium text-white">
              Você sente. Você vê.
            </p>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 space-y-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Estratégia Digital
                  </h3>
                </div>
                <p className="text-base text-gray-100 pl-11">
                  Desenvolvimento de projetos digitais, redes sociais e campanhas eleitorais
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 space-y-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Comunicação Pública
                  </h3>
                </div>
                <p className="text-base text-gray-100 pl-11">
                  Gestão e desenvolvimento de projetos de comunicação institucional
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 space-y-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Marketing Político
                  </h3>
                </div>
                <p className="text-base text-gray-100 pl-11">
                  Planejamento de marketing político e desenvolvimento de campanhas eleitorais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

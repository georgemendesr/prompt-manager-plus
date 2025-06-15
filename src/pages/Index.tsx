
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0D0D0D]">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black/50 to-black/80 z-10" />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/lovable-uploads/9cb1402d-bcb0-479f-874d-9eba6445170d.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-20">
        <div className="container mx-auto px-4 min-h-screen">
          {/* Header Section */}
          <header className="pt-8">
            <img 
              src="/lovable-uploads/96b8ea8f-5502-4611-b6ef-97206a354361.png" 
              alt="R10 Comunicação Criativa" 
              className="w-64 md:w-72 h-auto mx-auto transform hover:scale-105 transition-transform duration-300"
            />
          </header>

          {/* Hero Section */}
          <main className="mt-16 md:mt-24">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  R10 Comunicação Criativa
                </span>
              </h1>
              
              <p className="text-3xl md:text-5xl font-light text-white/90 mt-6">
                Você sente. Você vê.
              </p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-16">
                {/* Estratégia Digital */}
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Estratégia Digital
                      </h3>
                    </div>
                    <p className="text-base text-gray-300/90 pl-11 leading-relaxed">
                      Desenvolvimento de projetos digitais, redes sociais e campanhas eleitorais
                    </p>
                  </div>
                </div>

                {/* Comunicação Pública */}
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Comunicação Pública
                      </h3>
                    </div>
                    <p className="text-base text-gray-300/90 pl-11 leading-relaxed">
                      Gestão e desenvolvimento de projetos de comunicação institucional
                    </p>
                  </div>
                </div>

                {/* Marketing Político */}
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">
                        Marketing Político
                      </h3>
                    </div>
                    <p className="text-base text-gray-300/90 pl-11 leading-relaxed">
                      Planejamento de marketing político e desenvolvimento de campanhas eleitorais
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;

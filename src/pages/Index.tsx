
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/lovable-uploads/9cb1402d-bcb0-479f-874d-9eba6445170d.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px) brightness(0.7)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/96b8ea8f-5502-4611-b6ef-97206a354361.png" 
                alt="R10 Comunicação Criativa" 
                className="h-24 w-auto"
              />
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center space-y-8 glass rounded-2xl p-8 backdrop-blur-md">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              R10 Comunicação Criativa
            </h1>
            <p className="text-xl text-white">
              Agência de publicidade
            </p>
            <p className="text-3xl font-medium text-white">
              Você sente. Você vê.
            </p>
            
            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Especialistas em:
                  </h3>
                </div>
                <p className="text-gray-100 pl-9">
                  Comunicação Pública / Marketing Político
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Experiência Comprovada
                  </h3>
                </div>
                <ul className="text-gray-100 space-y-2 pl-9">
                  <li>+ 100 marcas atendidas</li>
                  <li>Diversas campanhas eleitorais de sucesso</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

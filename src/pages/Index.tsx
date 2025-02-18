
const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-pink-900/70 mix-blend-multiply" />
        <img 
          src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
          alt="Background" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
        {/* Logo and Content Container */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
            <img 
              src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
              alt="R10 Comunicação Criativa" 
              className="w-64 h-auto mx-auto"
            />
          </div>

          {/* Hero Text */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              Você sente. Você vê.
            </h1>
            
            <div className="grid md:grid-cols-2 gap-6 text-white">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl mb-4 block">🎯</span>
                <h3 className="text-xl font-semibold mb-2">Comunicação Pública</h3>
                <p className="text-gray-200">
                  Especialistas em Marketing Político
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300">
                <span className="text-3xl mb-4 block">💫</span>
                <h3 className="text-xl font-semibold mb-2">Experiência</h3>
                <p className="text-gray-200">
                  +100 marcas atendidas
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 md:col-span-2">
                <span className="text-3xl mb-4 block">🏆</span>
                <h3 className="text-xl font-semibold mb-2">Resultados</h3>
                <p className="text-gray-200">
                  Diversas campanhas eleitorais de sucesso
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


const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-pink-900/60 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=2000&q=80" 
          alt="Background" 
          className="w-full h-full object-cover object-center filter blur-[2px] scale-105"
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
              className="w-64 h-auto mx-auto drop-shadow-xl"
            />
          </div>

          {/* Hero Text */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg font-display">
              Você sente. Você vê.
            </h1>
            
            <div className="grid md:grid-cols-2 gap-6 text-white">
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-xl">
                <span className="text-3xl mb-4 block">🎯</span>
                <h3 className="text-xl font-semibold mb-2 font-display">Comunicação Pública</h3>
                <p className="text-gray-100">
                  Especialistas em Marketing Político
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-xl">
                <span className="text-3xl mb-4 block">💫</span>
                <h3 className="text-xl font-semibold mb-2 font-display">Experiência</h3>
                <p className="text-gray-100">
                  +100 marcas atendidas
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-xl md:col-span-2">
                <span className="text-3xl mb-4 block">🏆</span>
                <h3 className="text-xl font-semibold mb-2 font-display">Resultados</h3>
                <p className="text-gray-100">
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

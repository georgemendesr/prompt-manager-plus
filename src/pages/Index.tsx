
const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center items-center lg:items-start">
        {/* Logo */}
        <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
          <img 
            src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
            alt="R10 Comunicação Criativa" 
            className="w-64 h-auto"
          />
        </div>

        {/* Hero Text */}
        <div className="text-center lg:text-left max-w-3xl space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Você sente. Você vê.
          </h1>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <p className="text-xl text-gray-300">
                Especialistas em Comunicação Pública / Marketing Político
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg">💫</span>
              </div>
              <p className="text-xl text-gray-300">
                +100 marcas atendidas
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <p className="text-xl text-gray-300">
                Diversas campanhas eleitorais de sucesso
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 animate-fade-in delay-300">
          <a 
            href="/auth" 
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 inline-block"
          >
            Acessar Plataforma
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;


const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100" />
      
      {/* Animated Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-soft-purple opacity-20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-soft-blue opacity-20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Logo Container with Animation */}
      <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
        <img 
          src="/lovable-uploads/1aa9cab2-6b56-4f6c-a517-d69a832d9040.png" 
          alt="R10 Comunicação Criativa" 
          className="w-64 h-auto animate-fade-in"
        />
      </div>
    </div>
  );
};

export default Index;

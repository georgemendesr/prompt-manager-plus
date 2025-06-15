import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranslationSettings } from "@/components/settings/TranslationSettings";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-4 relative min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho da página */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/prompts" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {user?.email}
          </div>
        </header>

        {/* Conteúdo principal com abas */}
        <Tabs defaultValue="translation" className="w-full">
          <TabsList className="bg-white/60 backdrop-blur-sm mb-6 w-full flex">
            <TabsTrigger value="translation" className="flex-1">Tradução</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Aparência</TabsTrigger>
            <TabsTrigger value="account" className="flex-1">Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="translation" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configurações de Tradução</h2>
            <TranslationSettings />
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aparência</h2>
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
              Configurações de aparência em breve
            </div>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configurações da Conta</h2>
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
              Configurações da conta em breve
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
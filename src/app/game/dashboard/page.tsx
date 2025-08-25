import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlbumsPage from './AlbumsPage';
import StatsPage from './StatsPage';
import { Album, BarChart2 } from "lucide-react";


const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <Tabs defaultValue="albums" className="w-full max-w-7xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="albums">
            <Album className="inline-block mr-2 w-5 h-5" />
            Albums
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart2 className="inline-block mr-2 w-5 h-5" />
            Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="albums" className="mt-6">
          <AlbumsPage />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <StatsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
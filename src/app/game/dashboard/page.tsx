'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@supabase/supabase-js';
import { getPhotosFromUser } from '../actions';
import { Photo } from '@/types/type';
import { supabase } from '@/lib/supabase';
import AlbumsPage from './AlbumsPage';
import StatsPage from './StatsPage';
import { Album, BarChart2 } from "lucide-react";

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error);
          setError('Failed to get user session');
          return;
        }

        if (user) {
          setUser(user);
          // Fetch photos for this user
          const result = await getPhotosFromUser(user.id) as { success: boolean; photos: Photo[]; message?: string };
          if (result.success) {
            setPhotos(result.photos);
          } else {
            setError(result.message ?? 'An unknown error occurred');
          }
        } else {
          setError('No user session found');
        }
      } catch (err) {
        console.error('Error in getUser:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p>Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

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
          <AlbumsPage user={user} photos={photos} />
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          {/* <StatsPage user={user} photos={photos} /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
'use client'
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Photo } from '@/types/type';
import { Skeleton } from '@/components/ui/skeleton';

interface AlbumsPageProps {
  user: User;
  photos: Photo[];
}

const AlbumsPage: React.FC<AlbumsPageProps> = ({ user, photos }) => {
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  // Initialize loading states for all photos when photos prop changes
  useEffect(() => {
    const initialLoadingStates: { [key: number]: boolean } = {};
    photos.forEach((photo) => {
      if (photo.image) {
        initialLoadingStates[photo.id] = true;
      }
    });
    setImageLoadingStates(initialLoadingStates);
    // Reset image errors when photos change
    setImageErrors({});
  }, [photos]);

  const handleImageLoad = (photoId: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [photoId]: false
    }));
  };

  const handleImageError = (photoId: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [photoId]: false
    }));
    setImageErrors(prev => ({
      ...prev,
      [photoId]: true
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Albums</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user.email}! You have {photos.length} photos.
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-xl font-semibold mb-2">No photos found</h3>
            <p>Upload your first photo to get started!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                {!photo.image ? (
                  // No image URL available
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
                    <Skeleton className="h-12 w-12 rounded-full mb-3" />
                    <Skeleton className="h-3 w-20 rounded-full mb-2" />
                    <Skeleton className="h-2 w-16 rounded-full" />
                    <div className="mt-2 text-xs text-gray-400">No image</div>
                  </div>
                ) : imageErrors[photo.id] ? (
                  // Image failed to load
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
                    <Skeleton className="h-12 w-12 rounded-full mb-3" />
                    <Skeleton className="h-3 w-24 rounded-full mb-2" />
                    <Skeleton className="h-2 w-16 rounded-full" />
                    <div className="mt-2 text-xs text-gray-400">Failed to load</div>
                  </div>
                ) : (
                  <>
                    {/* Show skeleton while image is loading */}
                    {imageLoadingStates[photo.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="flex flex-col items-center space-y-3">
                          <Skeleton className="h-full w-full absolute inset-0" />
                          <div className="relative z-10">
                            <Skeleton className="h-8 w-8 rounded-full mb-2" />
                            <Skeleton className="h-2 w-16 rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <img
                      src={photo.image}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(photo.id)}
                      onError={() => handleImageError(photo.id)}
                      style={{
                        display: imageLoadingStates[photo.id] ? 'none' : 'block'
                      }}
                    />
                  </>
                )}
              </div>
              <div className="p-4">
                {photo.created_at ? (
                  <p className="text-xs text-gray-400">
                    {new Date(photo.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                ) : (
                  <Skeleton className="h-3 w-24 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsPage;
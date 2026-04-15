import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import ResourceCard from '../components/academic/ResourceCard';
import ResourceFilter from '../components/academic/ResourceFilter';
import VideoPlayer from '../components/academic/VideoPlayer';
import { Button } from '../components/ui/button';

interface Resource {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  vimeo_video_id?: string;
  external_url?: string;
  visibility: string;
  file_path?: string;
  subject?: number;
  class_level?: number;
  topic?: number;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Resource[];
}

export const ResourceDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subject: '',
    priceRange: [0, 500] as [number, number],
    sortBy: 'newest',
  });

  const [selectedVideo, setSelectedVideo] = useState<{ id: number; title: string; vimeoId: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    fetchResources();
  }, [filters, page]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', '12');
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.sortBy) {
        params.append('ordering', 
          filters.sortBy === 'newest' ? '-created_at' :
          filters.sortBy === 'popular' ? '-rating' :
          filters.sortBy === 'rating' ? '-rating' :
          filters.sortBy === 'price-low' ? 'price' :
          filters.sortBy === 'price-high' ? '-price' :
          '-created_at'
        );
      }

      const url = `${API_ENDPOINTS.RESOURCES}?${params.toString()}`;
      const response = await apiClient.get<PaginatedResponse>(url);

      if (response.data) {
        setResources(response.data.results);
        setPageCount(Math.ceil(response.data.count / 12));
      } else {
        throw new Error('Failed to fetch resources');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
      console.error('Error fetching resources:', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResourceClick = (resource: Resource) => {
    if (resource.vimeo_video_id) {
      setSelectedVideo({
        id: resource.id,
        title: resource.title,
        vimeoId: resource.vimeo_video_id,
      });
    } else if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    }
  };

  const handleDownload = (resource: Resource) => {
    if (resource.vimeo_video_id) {
      handleResourceClick(resource);
    } else if (resource.file_path) {
      const link = document.createElement('a');
      link.href = `http://localhost:8000${resource.file_path}`;
      link.download = resource.title;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
              <p className="text-gray-600 mt-1">Discover educational resources</p>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResourceFilter
          onFilterChange={handleFilterChange}
          categories={['Video', 'Notes', 'Textbook', 'Workbook', 'Assignment', 'Other']}
        />

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
            <p className="text-gray-600 mt-4">Loading resources...</p>
          </div>
        )}

        {!loading && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                title={resource.title}
                description={resource.description}
                author={resource.author}
                category={resource.category}
                price={resource.price}
                rating={resource.rating}
                fileType={
                  resource.vimeo_video_id ? 'video' : 'document'
                }
                vimeoVideoId={resource.vimeo_video_id}
                externalUrl={resource.external_url}
                visibility={resource.visibility}
                onClick={() => handleResourceClick(resource)}
                onDownload={() => handleDownload(resource)}
              />
            ))}
          </div>
        )}

        {!loading && resources.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No resources found</p>
          </div>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayer
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          vimeoVideoId={selectedVideo.vimeoId}
          title={selectedVideo.title}
        />
      )}

    </div>
  );
};

export default ResourceDiscoveryPage;

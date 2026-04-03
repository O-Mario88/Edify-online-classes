import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, BookOpen, Clock, Activity, FileText, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResourceViewer } from '../components/academic/ResourceViewer';

// Mock data spanning across our educational themes but looking like rich books
const MOCK_RESOURCES = [
  {
    id: 'res-1',
    title: "The Psychology of Money",
    authorName: "Morgan Housel",
    subject: "Business",
    category: "Business",
    coverURL: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80",
    rating: 4.8,
    pages: 320,
    ratingsCount: 643,
    reviewsCount: 110,
    description: "Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people.",
    format: "pdf"
  },
  {
    id: 'res-2',
    title: "How Innovation Works",
    authorName: "Matt Ridley",
    subject: "Science",
    category: "Science",
    coverURL: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    rating: 4.5,
    pages: 280,
    ratingsCount: 450,
    reviewsCount: 85,
    description: "Innovation is the main event of the modern age, the reason we experience both dramatic improvements in our living standards and unsettling changes in our society.",
    format: "pdf"
  },
  {
    id: 'res-3',
    title: "Company of One",
    authorName: "Paul Jarvis",
    subject: "Business",
    category: "Business",
    coverURL: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400&q=80",
    rating: 4.9,
    pages: 250,
    ratingsCount: 890,
    reviewsCount: 154,
    description: "Company of One offers a refreshingly original business strategy that's focused on a commitment to being better instead of bigger. Why? Because staying small provides one with the freedom to pursue more meaningful pleasures in life.",
    format: "pdf"
  },
  {
    id: 'res-4',
    title: "Stupore E Tremori",
    authorName: "Amelie Nothomb",
    subject: "Literature",
    category: "Drama",
    coverURL: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
    rating: 4.2,
    pages: 156,
    ratingsCount: 320,
    reviewsCount: 45,
    description: "Observing the strict hierarchy of a Japanese company, a young Belgian woman goes through a series of demotions.",
    format: "pdf"
  },
  {
    id: 'res-5',
    title: "The Bees",
    authorName: "Laline Paull",
    subject: "Biology",
    category: "Sci-Fi",
    coverURL: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80",
    rating: 4.6,
    pages: 340,
    ratingsCount: 1200,
    reviewsCount: 300,
    description: "Born into the lowest class of her society, Flora 717 is a sanitation worker whose labor is ignored. But she is special.",
    format: "video"
  },
  {
    id: 'res-6',
    title: "Real Help",
    authorName: "Ayodeji Awosika",
    subject: "Psychology",
    category: "Education",
    coverURL: "https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=400&q=80",
    rating: 4.7,
    pages: 210,
    ratingsCount: 560,
    reviewsCount: 90,
    description: "An honest guide to self-improvement.",
    format: "pdf"
  },
  {
    id: 'res-7',
    title: "The Fact of a Body",
    authorName: "Alexandria Marzano",
    subject: "Law",
    category: "History",
    coverURL: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=400&q=80",
    rating: 4.8,
    pages: 336,
    ratingsCount: 880,
    reviewsCount: 120,
    description: "A gripping true crime story and a deeply personal memoir.",
    format: "pdf"
  },
  {
    id: 'res-8',
    title: "The Room",
    authorName: "Jonas Karlsson",
    subject: "Literature",
    category: "Sci-Fi",
    coverURL: "https://images.unsplash.com/photo-1629080756775-b9f0dc2f2055?w=400&q=80",
    rating: 4.3,
    pages: 190,
    ratingsCount: 210,
    reviewsCount: 34,
    description: "A modern fable about a man who discovers a secret room in his office.",
    format: "pdf"
  }
];

const CATEGORIES = ["All", "Sci-Fi", "Fantasy", "Drama", "Business", "Education", "Geography", "History"];

export function AcademicLibraryPage() {
  const { user } = useAuth();
  const [activeResource, setActiveResource] = useState<any>(MOCK_RESOURCES[2]); // Default focus on 'Company of One'
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Filter for the bottom grid
  const filteredResources = MOCK_RESOURCES.filter(res => {
    if (activeCategory !== "All" && res.category !== activeCategory) return false;
    if (searchQuery && !res.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-full w-full">
      
      {/* Left Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
        
        {/* Search Header */}
        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            className="pl-12 bg-slate-100 border-none rounded-full h-12 text-slate-700 shadow-sm"
            placeholder="Search your favourite books"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Recommended Horizontal Scroll */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recommended</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
              See All <span className="ml-1 tracking-tighter">&gt;</span>
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {MOCK_RESOURCES.slice(0, 4).map((book) => (
              <div 
                key={book.id} 
                className="min-w-[160px] max-w-[160px] snap-start cursor-pointer group"
                onClick={() => setActiveResource(book)}
              >
                <div className="relative rounded-lg overflow-hidden shadow-sm border border-slate-200 aspect-[2/3] mb-3 transition-transform group-hover:scale-105 group-hover:shadow-md bg-white p-2">
                   <img src={book.coverURL} alt={book.title} className="w-full h-full object-cover rounded shadow-inner" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm truncate">{book.title}</h3>
                <p className="text-xs text-slate-500 truncate">{book.authorName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-4">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredResources.map((book) => (
              <div 
                key={book.id} 
                className="cursor-pointer group flex flex-col"
                onClick={() => setActiveResource(book)}
              >
                <div className={`relative rounded-lg overflow-hidden shadow-sm border border-slate-200 aspect-[2/3] mb-3 transition-transform group-hover:scale-105 group-hover:shadow-md bg-white p-2 ${activeResource.id === book.id ? 'ring-2 ring-blue-500' : ''}`}>
                   <img src={book.coverURL} alt={book.title} className="w-full h-full object-cover rounded shadow-inner" />
                   
                   {/* Mini floating rating overlay */}
                   <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center gap-1">
                     <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                     <span className="text-[10px] text-white font-bold">{book.rating}</span>
                   </div>
                </div>
                <h3 className="font-bold text-slate-900 text-sm truncate">{book.title}</h3>
                <p className="text-xs text-slate-500 truncate">{book.authorName}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar - Active Book Details */}
      <div className="w-full md:w-80 lg:w-96 bg-[#0E1B38] text-white p-8 flex flex-col items-center flex-shrink-0 relative">
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-900/40 to-transparent"></div>
        
        <div className="w-48 h-72 border-4 border-[#0E1B38] rounded-md overflow-hidden bg-white mt-10 shadow-2xl z-10 p-2 relative">
           {/* Simulate a 3D book shadow inside the right panel */}
           <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/20 to-transparent z-20 mix-blend-multiply pointer-events-none"></div>
           <img src={activeResource.coverURL} alt={activeResource.title} className="w-full h-full object-cover shadow-sm bg-white" />
        </div>

        <div className="mt-8 text-center z-10 w-full">
          <h2 className="text-2xl font-bold font-serif whitespace-normal leading-tight">{activeResource.title}</h2>
          <p className="text-blue-300 text-sm mt-2">{activeResource.authorName}</p>
          
          <div className="flex justify-center items-center gap-1 mt-4">
            {[1,2,3,4,5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= Math.floor(activeResource.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
              />
            ))}
            <span className="ml-2 text-sm font-semibold">{activeResource.rating}</span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-700/50 mt-8 mb-8 border-t border-b border-slate-700/50 py-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{activeResource.pages}</span>
              <span className="text-xs text-slate-400">Pages</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{activeResource.ratingsCount}</span>
              <span className="text-xs text-slate-400">Ratings</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{activeResource.reviewsCount}</span>
              <span className="text-xs text-slate-400">Reviews</span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed text-left opacity-90">
            {activeResource.description}
          </p>

          <Button 
            className="w-full mt-10 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 shadow-lg shadow-blue-900/50"
            onClick={() => setIsViewerOpen(true)}
          >
            Read Now <BookOpen className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {isViewerOpen && (
        <ResourceViewer
          resource={activeResource}
          studentId={user?.id || 'anonymous'}
          onClose={(snapshot) => {
             console.log("Recorded view:", snapshot);
             setIsViewerOpen(false);
          }}
        />
      )}

      {/* Inline styles for hide-scrollbar (alternatively use global css) */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
}

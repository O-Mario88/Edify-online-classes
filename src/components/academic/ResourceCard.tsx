import React from 'react';
import { PlayCircle, Download, ExternalLink, Star } from 'lucide-react';

interface ResourceCardProps {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  fileType: string;
  vimeoVideoId?: string;
  externalUrl?: string;
  visibility: string;
  onClick: () => void;
  onDownload: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  author,
  category,
  price,
  rating,
  fileType,
  onClick,
  onDownload
}) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
            {category}
          </span>
          {price > 0 ? (
            <span className="text-sm font-bold text-gray-900">UGX {price.toFixed(0)}</span>
          ) : (
            <span className="text-sm font-bold text-emerald-800">Free</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-800 cursor-pointer" onClick={onClick}>
          {title}
        </h3>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-700 mb-4">
          <span>By {author}</span>
          <span className="flex items-center">
            <Star size={14} className="text-yellow-400 mr-1" />
            {rating > 0 ? rating.toFixed(1) : 'New'}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
        <button 
          onClick={onClick}
          className="text-sm font-medium text-blue-800 hover:text-blue-800 flex items-center"
        >
          {fileType === 'video' ? <><PlayCircle size={16} className="mr-1"/> Watch</> : <><ExternalLink size={16} className="mr-1"/> View</>}
        </button>
        <button 
          onClick={onDownload}
          className="text-sm text-gray-800 hover:text-gray-900 flex items-center"
        >
          <Download size={16} className="mr-1" /> Download
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;

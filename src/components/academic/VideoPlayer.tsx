import React from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  vimeoVideoId: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose, vimeoVideoId, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 truncate pr-8">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 w-full relative" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
          <iframe 
            src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1`}
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

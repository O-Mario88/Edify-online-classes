import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface ResourceFilterProps {
  onFilterChange: (filters: any) => void;
  categories: string[];
}

const ResourceFilter: React.FC<ResourceFilterProps> = ({ onFilterChange, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({
      search: value,
      category: selectedCategory,
      sortBy
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onFilterChange({
      search: searchTerm,
      category: value,
      sortBy
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    onFilterChange({
      search: searchTerm,
      category: selectedCategory,
      sortBy: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-800" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
          placeholder="Search resources by title, description, or author..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-800 mr-2" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2 whitespace-nowrap">Sort by:</span>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">Newest Added</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ResourceFilter;

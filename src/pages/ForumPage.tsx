import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  MessageCircle, 
  Search, 
  Plus,
  ChevronRight,
  ChevronDown,
  User,
  Clock,
  Heart,
  Reply,
  Pin,
  CheckCircle,
  Star,
  MapPin,
  GraduationCap,
  Target,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
  replies?: ForumReply[];
  tags: string[];
  views: number;
  likes: number;
  isPinned: boolean;
  isSolved: boolean;
}

interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  likes: number;
  isTeacherApproved?: boolean;
}

interface ForumCategory {
  id: string;
  name: string;
  level: string;
  description?: string;
  subcategories?: ForumCategory[];
  posts?: ForumPost[];
}

export const ForumPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [generalPosts, setGeneralPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        const response = await fetch('/data/forum.json');
        const data = await response.json();
        
        setCategories(data.categories);
        setGeneralPosts(data.generalDiscussion || []);
      } catch (error) {
        console.error('Error fetching forum data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForumData();
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getAllPosts = (): ForumPost[] => {
    const allPosts: ForumPost[] = [...generalPosts];
    
    const extractPosts = (categories: ForumCategory[]) => {
      categories.forEach(category => {
        if (category.posts) {
          allPosts.push(...category.posts);
        }
        if (category.subcategories) {
          extractPosts(category.subcategories);
        }
      });
    };
    
    extractPosts(categories);
    return allPosts;
  };

  const getFilteredPosts = (): ForumPost[] => {
    const allPosts = getAllPosts();
    return allPosts.filter(post => {
      const matchesSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newPostTitle,
      content: newPostContent,
      authorId: user?.id || 'anonymous',
      authorName: user?.name || 'Anonymous',
      authorRole: user?.role || 'student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      tags: [],
      views: 0,
      likes: 0,
      isPinned: false,
      isSolved: false
    };
    
    setGeneralPosts(prev => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderCategory = (category: ForumCategory, depth: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const postCount = category.posts?.length || 0;
    
    return (
      <div key={category.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <div 
          className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-l-4 ${
            category.level === 'level' ? 'border-l-blue-500 bg-blue-50' :
            category.level === 'class' ? 'border-l-green-500 bg-green-50' :
            category.level === 'subject' ? 'border-l-purple-500 bg-purple-50' :
            category.level === 'combination' ? 'border-l-orange-500 bg-orange-50' :
            'border-l-gray-300'
          }`}
          onClick={() => hasSubcategories ? toggleCategory(category.id) : setSelectedCategory(category.id)}
        >
          <div className="flex items-center gap-3">
            {hasSubcategories && (
              isExpanded ? 
                <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <div>
              <h4 className="font-medium text-gray-900">{category.name}</h4>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {postCount > 0 && (
              <Badge variant="outline">{postCount} posts</Badge>
            )}
            {category.level === 'level' && <GraduationCap className="h-4 w-4 text-blue-600" />}
            {category.level === 'class' && <BookOpen className="h-4 w-4 text-green-600" />}
            {category.level === 'subject' && <Target className="h-4 w-4 text-purple-600" />}
          </div>
        </div>
        
        {hasSubcategories && isExpanded && (
          <div className="mt-2 space-y-1">
            {category.subcategories!.map(subcat => renderCategory(subcat, depth + 1))}
          </div>
        )}
        
        {category.posts && isExpanded && (
          <div className="mt-2 ml-6 space-y-2">
            {category.posts.slice(0, 3).map(post => (
              <div 
                key={post.id} 
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                      {post.isSolved && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <h5 className="font-medium text-gray-900">{post.title}</h5>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>by {post.authorName}</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      <span>{post.replies?.length || 0} replies</span>
                      <span>{post.views} views</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {post.authorRole}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPost(null)}
            className="mb-6"
          >
            ← Back to Forum
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedPost.isPinned && <Pin className="h-5 w-5 text-yellow-500" />}
                    {selectedPost.isSolved && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{selectedPost.authorName}</span>
                      <Badge variant="outline" className="text-xs ml-1">{selectedPost.authorRole}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                    </div>
                    <span>{selectedPost.views} views</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              
              {selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Like ({selectedPost.likes})
                </Button>
                <Button variant="outline" size="sm">
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {selectedPost.replies && selectedPost.replies.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Replies ({selectedPost.replies.length})</h3>
              {selectedPost.replies.map(reply => (
                <Card key={reply.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{reply.authorName}</span>
                        <Badge variant="outline" className="text-xs">{reply.authorRole}</Badge>
                        {reply.isTeacherApproved && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Teacher Approved
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">{reply.content}</p>
                    <Button variant="outline" size="sm">
                      <Heart className="mr-1 h-3 w-3" />
                      {reply.likes}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {user && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Add a Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Share your thoughts or answer..."
                  className="mb-4"
                  rows={4}
                />
                <Button>Post Reply</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Uganda Secondary Education Community</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discussion Forum</h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect with fellow students and teachers across Uganda's O'level and A'level curriculum
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search discussions, topics, or ask a question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowNewPostModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div 
                  className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-l-4 border-l-gray-300"
                  onClick={() => setSelectedCategory('general')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">General Discussion</h4>
                      <p className="text-sm text-gray-600">Community chat & announcements</p>
                    </div>
                    <Badge variant="outline">{generalPosts.length} posts</Badge>
                  </div>
                </div>
                
                {categories.map(category => renderCategory(category))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Be respectful to all members</li>
                  <li>• Stay on topic and curriculum-focused</li>
                  <li>• Help fellow students with genuine support</li>
                  <li>• No academic dishonesty</li>
                  <li>• Use appropriate language</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {searchTerm ? `Search Results` : 'Recent Discussions'}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Latest</Button>
                    <Button variant="outline" size="sm">Popular</Button>
                    <Button variant="outline" size="sm">Solved</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredPosts().slice(0, 10).map(post => (
                    <div 
                      key={post.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                            {post.isSolved && <CheckCircle className="h-4 w-4 text-green-500" />}
                            <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{post.authorName}</span>
                              <Badge variant="outline" className="text-xs">{post.authorRole}</Badge>
                            </div>
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            <span>{post.replies?.length || 0} replies</span>
                            <span>{post.views} views</span>
                            <span>{post.likes} likes</span>
                          </div>
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Start a New Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input 
                  placeholder="What would you like to discuss?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <Textarea 
                  placeholder="Describe your question or share your thoughts..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreatePost}>Create Discussion</Button>
                <Button variant="outline" onClick={() => setShowNewPostModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

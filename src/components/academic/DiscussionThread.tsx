import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import {
  MessageSquare, User, Clock, Heart, Reply, Pin,
  CheckCircle, Star, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DiscussionReply {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  likes: number;
  isTeacherApproved?: boolean;
}

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  replies: DiscussionReply[];
  likes: number;
  isPinned: boolean;
  isSolved: boolean;
}

interface DiscussionThreadProps {
  contextType: 'topic' | 'lesson';
  contextId: string;
  contextName: string;
}

const MOCK_POSTS: DiscussionPost[] = [
  {
    id: 'dp-1',
    title: 'How do I approach this type of question in exams?',
    content: 'I keep getting confused when the question asks me to show my working. Can someone explain the step-by-step approach?',
    authorName: 'Grace Nakato',
    authorRole: 'Student',
    createdAt: '2026-03-28T10:00:00Z',
    replies: [
      { id: 'r-1', content: 'Start by identifying what the question is asking. Then write out the formula before substituting values. Always show each step on a new line.', authorName: 'Mr. Ssebunya', authorRole: 'Teacher', createdAt: '2026-03-28T11:00:00Z', likes: 12, isTeacherApproved: true },
      { id: 'r-2', content: 'Thanks! That really helped me understand the approach better.', authorName: 'Grace Nakato', authorRole: 'Student', createdAt: '2026-03-28T12:00:00Z', likes: 3 },
    ],
    likes: 8,
    isPinned: true,
    isSolved: true
  },
  {
    id: 'dp-2',
    title: 'Can we get extra practice problems?',
    content: 'I want to practice more before the test. Are there additional worksheets or past paper questions for this topic?',
    authorName: 'David Musoke',
    authorRole: 'Student',
    createdAt: '2026-03-30T14:00:00Z',
    replies: [],
    likes: 5,
    isPinned: false,
    isSolved: false
  }
];

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({ contextType, contextId, contextName }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DiscussionPost[]>(MOCK_POSTS);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const post: DiscussionPost = {
      id: `dp-${Date.now()}`,
      title: newTitle,
      content: newContent,
      authorName: user?.name || 'You',
      authorRole: user?.role?.includes('teacher') ? 'Teacher' : 'Student',
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0,
      isPinned: false,
      isSolved: false
    };
    setPosts(prev => [post, ...prev]);
    setNewTitle('');
    setNewContent('');
    setShowNewPost(false);
  };

  const handleReply = (postId: string) => {
    const text = replyText[postId];
    if (!text?.trim()) return;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        replies: [...p.replies, {
          id: `r-${Date.now()}`,
          content: text,
          authorName: user?.name || 'You',
          authorRole: user?.role?.includes('teacher') ? 'Teacher' : 'Student',
          createdAt: new Date().toISOString(),
          likes: 0
        }]
      };
    }));
    setReplyText(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-600" />
            {contextType === 'topic' ? 'Topic' : 'Lesson'} Discussion
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {contextType === 'topic'
              ? 'Broader questions, revision support, and peer help for this topic'
              : 'Questions and clarification specific to this lesson'}
          </p>
        </div>
        <Button onClick={() => setShowNewPost(true)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
          <MessageSquare className="h-4 w-4 mr-2" /> Ask Question
        </Button>
      </div>

      {showNewPost && (
        <Card className="border-teal-200 bg-teal-50/30">
          <CardContent className="p-4 space-y-3">
            <input
              type="text"
              placeholder="Question title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Textarea
              placeholder="Describe your question..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreatePost} className="bg-teal-600 hover:bg-teal-700 text-white">
                <Send className="h-3 w-3 mr-2" /> Post Question
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewPost(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No discussions yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to ask a question about this {contextType}!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:border-gray-300 transition-colors">
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500" />}
                      {post.isSolved && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                      <h4 className="font-semibold text-gray-900">{post.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.authorName}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{post.authorRole}</Badge>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(post.createdAt)}</span>
                      <span className="flex items-center gap-1"><Reply className="h-3 w-3" /> {post.replies.length}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
                    </div>
                  </div>
                  {expandedPost === post.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>

              {expandedPost === post.id && (
                <div className="border-t bg-gray-50/50 p-4 space-y-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>

                  {post.replies.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-teal-100">
                      {post.replies.map(reply => (
                        <div key={reply.id} className="bg-white p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-medium text-gray-900">{reply.authorName}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{reply.authorRole}</Badge>
                            {reply.isTeacherApproved && (
                              <Badge className="bg-green-100 text-green-700 border-none text-[10px] px-1.5 py-0">
                                <Star className="h-2.5 w-2.5 mr-0.5" /> Approved
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText[post.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                      rows={2}
                      className="flex-1 text-sm"
                    />
                    <Button size="sm" onClick={() => handleReply(post.id)} className="self-end bg-teal-600 hover:bg-teal-700 text-white">
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

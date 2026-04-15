import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Upload, Search, FileText, Video, FolderOpen, Archive,
  Send, Eye, BarChart3, Loader2, RefreshCcw, Filter
} from 'lucide-react';
import { ContentItemCard } from './ContentItemCard';
import { ContentUploadModal } from './ContentUploadModal';
import contentApi from '../../lib/contentApi';
import type {
  ContentItem, ContentStats, ContentFilters,
  ContentType, PublicationStatus, ContentUploadData
} from '../../lib/contentApi';
import { toast } from 'sonner';

interface ContentManagementPanelProps {
  role: 'teacher' | 'institution' | 'admin';
  /** Optional institution ID for scoping */
  institutionId?: number;
  /** Optional defaults for upload form */
  uploadDefaults?: Partial<ContentUploadData>;
}

type TabId = 'all' | 'drafts' | 'published' | 'archived' | 'under_review';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Content', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'drafts', label: 'Drafts', icon: <FileText className="w-4 h-4" /> },
  { id: 'published', label: 'Published', icon: <Send className="w-4 h-4" /> },
  { id: 'archived', label: 'Archived', icon: <Archive className="w-4 h-4" /> },
  { id: 'under_review', label: 'Under Review', icon: <Eye className="w-4 h-4" /> },
];

export const ContentManagementPanel: React.FC<ContentManagementPanelProps> = ({
  role, institutionId, uploadDefaults = {},
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const getApi = useCallback(() => {
    if (role === 'teacher') return contentApi.teacher;
    if (role === 'institution') return contentApi.institution;
    return contentApi.admin;
  }, [role]);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApi();
      const filters: ContentFilters = { page };

      if (activeTab !== 'all') {
        filters.publication_status = activeTab as PublicationStatus;
      }
      if (searchQuery) filters.search = searchQuery;
      if (contentTypeFilter) filters.content_type = contentTypeFilter as ContentType;
      if (institutionId) filters.owner_institution = institutionId;

      const response = await api.list(filters);
      setItems(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getApi, activeTab, searchQuery, contentTypeFilter, institutionId, page]);

  const fetchStats = useCallback(async () => {
    try {
      const api = getApi();
      const s = await api.stats();
      setStats(s);
    } catch {
      // Stats are non-critical
    }
  }, [getApi]);

  useEffect(() => {
    fetchContent();
    fetchStats();
  }, [fetchContent, fetchStats]);

  const handleUpload = async (data: ContentUploadData) => {
    const api = getApi();
    await api.create(data);
    toast.success('Content uploaded successfully');
    fetchContent();
    fetchStats();
  };

  const handlePublish = async (item: ContentItem) => {
    try {
      await contentApi.publish(item.id, 'publish');
      toast.success(`"${item.title}" published`);
      fetchContent();
      fetchStats();
    } catch {
      toast.error('Failed to publish');
    }
  };

  const handleArchive = async (item: ContentItem) => {
    try {
      await contentApi.publish(item.id, 'archive');
      toast.success(`"${item.title}" archived`);
      fetchContent();
      fetchStats();
    } catch {
      toast.error('Failed to archive');
    }
  };

  const handleView = (item: ContentItem) => {
    if (item.file_url) {
      window.open(item.file_url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('No file available for preview');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-500">{stats.archived}</p>
              <p className="text-xs text-muted-foreground">Archived</p>
            </CardContent>
          </Card>
          {stats.total_views !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total_views}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
          )}
          {stats.pending_review !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.pending_review}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className="flex items-center gap-1.5"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Content
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search content..."
            className="pl-9"
          />
        </div>
        <Select value={contentTypeFilter} onValueChange={v => { setContentTypeFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="slides">Slides</SelectItem>
            <SelectItem value="worksheet">Worksheet</SelectItem>
            <SelectItem value="textbook">Textbook</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="mock_exam">Mock Exam</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={fetchContent}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-muted-foreground">No content found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'all'
                ? 'Upload your first resource to get started'
                : `No ${activeTab.replace('_', ' ')} content`}
            </p>
            <Button onClick={() => setShowUploadModal(true)} className="mt-4">
              <Upload className="w-4 h-4 mr-2" /> Upload Content
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <ContentItemCard
              key={item.id}
              item={item}
              onView={handleView}
              onPublish={handlePublish}
              onArchive={handleArchive}
            />
          ))}

          {/* Pagination */}
          {totalCount > 20 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline" size="sm"
                  disabled={page * 20 >= totalCount}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <ContentUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUpload}
        role={role}
        defaults={uploadDefaults}
      />
    </div>
  );
};

export default ContentManagementPanel;

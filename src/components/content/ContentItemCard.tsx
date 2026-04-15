import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  FileText, Video, Image, File, Eye, Pencil, Archive, Send,
  MoreHorizontal, Download, Trash2, Star, Clock, Users
} from 'lucide-react';
import type { ContentItem, PublicationStatus } from '../../lib/contentApi';

interface ContentItemCardProps {
  item: ContentItem;
  onView?: (item: ContentItem) => void;
  onEdit?: (item: ContentItem) => void;
  onPublish?: (item: ContentItem) => void;
  onArchive?: (item: ContentItem) => void;
  showActions?: boolean;
}

const STATUS_STYLES: Record<PublicationStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
  uploaded: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  processing: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300' },
  under_review: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
  published: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
  archived: { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' },
  hidden: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-500' },
};

function getContentIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="w-5 h-5 text-blue-500" />;
    case 'pdf': case 'document': case 'notes': case 'textbook':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'slides': return <FileText className="w-5 h-5 text-orange-500" />;
    default: return <File className="w-5 h-5 text-gray-500" />;
  }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export const ContentItemCard: React.FC<ContentItemCardProps> = ({
  item, onView, onEdit, onPublish, onArchive, showActions = true,
}) => {
  const statusStyle = STATUS_STYLES[item.publication_status] || STATUS_STYLES.draft;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="mt-1 shrink-0">
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt="" className="w-10 h-10 rounded object-cover" />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {getContentIcon(item.content_type)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                )}
              </div>
              <Badge className={`${statusStyle.bg} ${statusStyle.text} text-xs shrink-0`}>
                {item.publication_status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getContentIcon(item.content_type)}
                {item.content_type.replace('_', ' ')}
              </span>
              {item.subject_name && (
                <Badge variant="outline" className="text-xs">{item.subject_name}</Badge>
              )}
              {item.class_level_name && (
                <Badge variant="outline" className="text-xs">{item.class_level_name}</Badge>
              )}
              {item.topic_name && (
                <Badge variant="outline" className="text-xs">{item.topic_name}</Badge>
              )}
              {item.file_size && (
                <span className="text-xs text-muted-foreground">{formatFileSize(item.file_size)}</span>
              )}
              {item.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500" />}
            </div>

            {/* Engagement + time */}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(item.created_at)}
              </span>
              {item.engagement_summary.total_views > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.engagement_summary.total_views} views
                </span>
              )}
              {item.engagement_summary.unique_viewers > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.engagement_summary.unique_viewers} students
                </span>
              )}
              {item.uploader_name && (
                <span className="text-xs text-muted-foreground">
                  by {item.uploader_name}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 shrink-0">
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onEdit && item.publication_status !== 'archived' && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onPublish && item.publication_status === 'draft' && (
                <Button variant="ghost" size="sm" onClick={() => onPublish(item)} title="Publish">
                  <Send className="w-4 h-4 text-green-600" />
                </Button>
              )}
              {onArchive && item.publication_status === 'published' && (
                <Button variant="ghost" size="sm" onClick={() => onArchive(item)} title="Archive">
                  <Archive className="w-4 h-4 text-orange-500" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap ml-[52px]">
            {item.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentItemCard;

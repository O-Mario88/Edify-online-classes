import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { ParentChild } from '@/api/parent.api';

interface ChildSelectorProps {
  children: ParentChild[];
  selectedId: number | null;
  onSelect: (child: ParentChild) => void;
}

/**
 * Mobile child-switcher chip strip. Renders nothing when the parent
 * has 0 or 1 linked children (no point showing a single chip). Each
 * chip badges its unread_count when > 0 so a parent with two kids
 * can see at a glance which one has news.
 */
export const ChildSelector: React.FC<ChildSelectorProps> = ({ children, selectedId, onSelect }) => {
  if (children.length <= 1) return null;

  return (
    <View>
      <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Viewing</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {children.map((c) => {
          const active = c.id === selectedId;
          const unread = c.unread_count || 0;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                unread > 0 ? `${c.name}, ${unread} new updates` : c.name
              }
              className={
                active
                  ? 'h-10 rounded-full bg-maple-900 px-4 mr-2 flex-row items-center'
                  : 'h-10 rounded-full bg-white border border-slate-300 px-4 mr-2 flex-row items-center'
              }
            >
              <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                {c.name.split(' ')[0]}
              </Text>
              {c.stage && (
                <View className={`ml-2 px-1.5 py-0.5 rounded-md ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <Text className={`text-[10px] font-bold ${active ? 'text-white' : 'text-slate-600'}`}>
                    {c.stage === 'primary' ? 'P4–P7' : 'S1–S6'}
                  </Text>
                </View>
              )}
              {unread > 0 && (
                <View className="ml-2 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 items-center justify-center">
                  <Text className="text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

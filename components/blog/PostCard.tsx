'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Post, Media, User as UserType } from '@/payload-types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const featuredImage = post.featuredImage as Media;
  const author = post.author as UserType;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="bg-[#0f0f0f] rounded-lg overflow-hidden border border-white/10 hover:border-[#ff6b35]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6b35]/5">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden">
            {featuredImage ? (
              <Image
                src={featuredImage.url || ''}
                alt={featuredImage.alt || post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ff6b35]/20 to-[#ff6b35]/5 flex items-center justify-center">
                <span className="text-[#ff6b35] text-4xl font-bold">28</span>
              </div>
            )}
            {/* Category Badge */}
            {post.category && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-[#ff6b35] text-white border-none">{post.category}</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#ff6b35] transition-colors line-clamp-2">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>{author?.name || author?.email || 'Equipe 28Web'}</span>
              </div>
              {post.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <time dateTime={post.publishedAt}>{formatDate(new Date(post.publishedAt))}</time>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

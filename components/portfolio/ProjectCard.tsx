'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { projectCategories } from '@/lib/constants';
import type { Portfolio, Media } from '@/payload-types';

interface ProjectCardProps {
  project: Portfolio;
  featured?: boolean;
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const images = (project.images as Array<{ image: Media; caption?: string }>) || [];
  const firstImage = images[0]?.image;
  const technologies = (project.technologies as Array<{ technology: string }>) || [];

  const categoryLabel =
    projectCategories.find((c) => c.value === project.category)?.label || project.category;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/portfolio/${project.slug}`} className="group block">
        <div
          className={`
          relative rounded-lg overflow-hidden border transition-all duration-500
          ${
            featured
              ? 'border-[#ff6b35]/30 hover:border-[#ff6b35]'
              : 'border-white/10 hover:border-[#ff6b35]/50'
          }
          hover:shadow-xl hover:shadow-[#ff6b35]/10
        `}
        >
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {firstImage ? (
              <Image
                src={firstImage.url || ''}
                alt={firstImage.alt || project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ff6b35]/20 to-[#ff6b35]/5 flex items-center justify-center">
                <span className="text-[#ff6b35] text-5xl font-bold">28</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-[#ff6b35] text-white border-none flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Destaque
                </Badge>
              </div>
            )}

            {/* Category */}
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="bg-black/50 text-white border-none backdrop-blur-sm"
              >
                {categoryLabel}
              </Badge>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#ff6b35] transition-colors">
                {project.title}
              </h3>

              {project.shortDescription && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {project.shortDescription}
                </p>
              )}

              {/* Technologies */}
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {technologies.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300"
                    >
                      {tech.technology}
                    </span>
                  ))}
                  {technologies.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300">
                      +{technologies.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow Icon */}
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-[#ff6b35] flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/InputComponent';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PortfolioFiltersProps {
  initialCategory: string;
  initialSearch: string;
  categories: { value: string; label: string }[];
}

export function PortfolioFilters({
  initialCategory,
  initialSearch,
  categories,
}: PortfolioFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);

  // Update URL with new search params
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === 'all' || value === '') {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      const search = current.toString();
      return search ? `?${search}` : '';
    },
    [searchParams]
  );

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      const query = createQueryString({ search: value || null });
      router.push(`${pathname}${query}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    const category = value === 'all' ? null : value;
    const query = createQueryString({ category });
    router.push(`${pathname}${query}`, { scroll: false });
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = createQueryString({ search: search || null });
    router.push(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12">
      <form onSubmit={handleSearchSubmit} className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscar projetos..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </form>
      <Select defaultValue={initialCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full md:w-[280px] bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10">
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

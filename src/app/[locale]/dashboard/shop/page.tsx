// src/app/[locale]/dashboard/shop/page.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ShopPrizeCard } from "@/components/prizes/ShopPrizeCard";
import { Search, Filter, X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Prize } from '@/generated/prisma';

const ITEMS_PER_PAGE = 12;

export default function ShopPage() {
  const t = useTranslations('shop');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPoints, setMaxPoints] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active prizes
    const fetchPrizes = async () => {
      try {
        const response = await fetch('/api/prizes/active');
        if (response.ok) {
          const data = await response.json();
          setPrizes(data);
        }
      } catch (error) {
        console.error('Failed to fetch prizes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  const filteredPrizes = useMemo(() => {
    return prizes.filter(prize => {
      const matchesSearch = !searchQuery ||
        prize.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prize.description && prize.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPoints = !maxPoints || prize.pointCost <= maxPoints;

      return matchesSearch && matchesPoints;
    });
  }, [prizes, searchQuery, maxPoints]);

  const totalPages = Math.ceil(filteredPrizes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPrizes = filteredPrizes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMaxPoints("");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
          <Link href={`/${locale}/dashboard/cart`}>
            <Button className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t('viewCart')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('searchAndFilter')}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? t('hideFilters') : t('showFilters')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxPoints">{t('maxPoints')}</Label>
                <Input
                  id="maxPoints"
                  type="number"
                  placeholder={t('maxPointsPlaceholder')}
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  {t('clearFilters')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {t('showingResults', {
            count: filteredPrizes.length,
            total: prizes.length
          })}
        </p>
      </div>

      {/* Prize Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading prizes...</p>
        </div>
      ) : paginatedPrizes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedPrizes.map((prize) => (
            <ShopPrizeCard key={prize.prizeId} prize={prize} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noPrizesFound')}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
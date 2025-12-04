"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Fragment } from "react";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText/AnimatedText";
import GlassCard from "@/components/ui/GlassCard/GlassCard";

import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

/* -------------------------
   Constants / Mock (kept as-is)
   ------------------------- */
const MIN_CHARS = 2;
const DEBOUNCE_DELAY_MS = 1000;
const ITEMS_PER_PAGE = 9;

interface PortfolioItem {
  id: number;
  title: string;
  category_id: number;
  category_name?: string | null;
  details: JSON; // JSON array
  description?: string | null;
  image: string;
  created_at: string;
  updated_at: string;
}

/* -------------------------
   Presentational components (memoized)
   ------------------------- */
const PortfolioItemCard: React.FC<{ item: PortfolioItem; index: number }> = React.memo(({ item }) => {
  const imageSrc = item.image || "https://placehold.co/600x224/1e293b/cbd5e1?text=Project+Image";
  const categoryLabel = item.category_name || "Uncategorized";
  
  return (
    <Link
      href={`/portfolio/${item.id}`}
      className="group block w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,168,89,0.8)]"
    >
      <GlassCard className="w-full h-full">
        <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-900">
          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-80"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://placehold.co/600x224/1e293b/cbd5e1?text=Project+Image";
            }}
          />
        </div>

        <div className="p-4 min-h-[90px] flex flex-col justify-center">
          <p className="text-xs text-gray-300 mb-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {categoryLabel}
          </p>
          <h3 className="text-white text-lg font-semibold transition-colors duration-300 group-hover:text-[#00A859]">
            {item.title}
          </h3>
        </div>
      </GlassCard>
    </Link>
  );
});
PortfolioItemCard.displayName = "PortfolioItemCard";

/* -------------------------
   FilterBar component (memoized)
   ------------------------- */
interface CategoryType {
  id: number;
  name: string;
}
interface FilterBarProps {
  searchTermInput: string;
  onSearchInputChange: (value: string) => void;
  activeCategoryId: number | null; // store category by id for simpler mapping
  setActiveCategoryId: (id: number | null) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  categories: CategoryType[]; // includes an "All" entry with id = 1
  isLoadingCategories: boolean;
}

const FilterBar: React.FC<FilterBarProps> = React.memo(({
  searchTermInput,
  onSearchInputChange,
  activeCategoryId,
  setActiveCategoryId,
  sortBy,
  setSortBy,
  categories,
  isLoadingCategories
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchInputChange(e.target.value);
  }, [onSearchInputChange]);

  // --- Data for the Listbox ---
  const sortOptions = [
    { id: 'latest', name: 'Latest' },
    { id: 'az', name: 'A to Z' },
    { id: 'za', name: 'Z to A' },
  ];
  const selectedOption = sortOptions.find(option => option.id === sortBy) || sortOptions[0];

  return (
    <div className="w-full max-w-7xl px-4 lg:px-0 mx-auto mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-around gap-3 sm:gap-4 mb-4 sm:mb-6">
        <GlassCard className="flex w-full sm:w-2/3 lg:w-2/3 rounded-lg overflow-hidden shadow-xl">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTermInput}
            onChange={handleInputChange}
            className="flex-grow p-2.5 sm:p-3 bg-transparent border-0 text-sm sm:text-base text-gray-200 rounded-lg placeholder-gray-500 transition duration-150"
          />
        </GlassCard>

        {/* Replaced <select> with <Listbox> */}
        <div className="relative w-full sm:w-1/3 lg:w-1/3">
          <Listbox value={sortBy} onChange={setSortBy}>
            <div className="relative">
              {/* Use GlassCard for the button */}
              <GlassCard className="rounded-lg shadow-xl overflow-hidden">
                <Listbox.Button className="relative w-full cursor-pointer py-2.5 sm:py-3 px-3 sm:px-4 pr-10 text-left text-sm sm:text-base text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A859] focus-visible:ring-opacity-75">
                  <span className="block truncate">{selectedOption.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronsUpDown
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
              </GlassCard>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {/* Use GlassCard for the options panel */}
                <Listbox.Options 
                  as={GlassCard} 
                  className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg shadow-lg z-10 py-1 focus:outline-none sm:text-sm"
                >
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-lime-500/30 text-lime-300' : 'text-gray-200'
                        }`
                      }
                      value={option.id}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium text-lime-300' : 'font-normal'
                            }`}
                          >
                            {option.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lime-400">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      <GlassCard className="rounded-xl shadow-2xl p-4 sm:p-6">
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3">
          {isLoadingCategories ? (
            // simple skeleton while loading
            <div className="h-8 w-full flex items-center justify-center text-gray-500">Loading categories...</div>
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id === 1 ? 1 : cat.id)} // id=1 == All (backend convention)
                className={`
                  px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap
                  ${activeCategoryId === cat.id
                    ? 'bg-[#00A859] text-white shadow-lg shadow-[#00A859]/50 transform scale-105'
                    : 'text-gray-300 hover:bg-[#00A859] hover:text-white hover:shadow-md hover:scale-105 border border-gray-700'
                  }
                `}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
});
FilterBar.displayName = "FilterBar";

/* -------------------------
   Main Page component
   ------------------------- */

export default function PortfolioPage() {
  // categories and loading
  const [categories, setCategories] = useState<CategoryType[]>([{ id: 1, name: "All" }]); 
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  // server-driven list
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // filters / UI state
  const [searchTermInput, setSearchTermInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(1); // default All => 1
  const [sortBy, setSortBy] = useState<string>("latest");

  // keep a ref to AbortController so we can cancel fetches
  const fetchControllerRef = useRef<AbortController | null>(null);

  // keep stable mapping of categories by name/id for quick lookups (memo)
  const categoryMap = useMemo(() => {
    const map = new Map<number | string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

   /* -----------------------------------
      On mount, restore the last active category from localStorage.
      (Used when coming back from /portfolio/:id)
  ----------------------------------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio_last_category_id");
      if (saved) {
        const parsed = parseInt(saved);
        if (!isNaN(parsed)) {
          setActiveCategoryId(parsed);
        }
      }
    } catch (e) {
      console.error("LocalStorage error:", e);
    }
  }, []);

  /* -------------------------
     Fetch categories from API once (on mount)
     - Keep 'All' (id=1) as first entry (if API doesn't return it)
     ------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoadingCategories(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          // ensure "All" with id 1 present (backend uses category_id=1 as All)
          const hasAll = data.some((d: any) => d.id === 1 || d.name?.toLowerCase() === "all");
          const normalized = [...data];
          if (!hasAll) normalized.unshift({ id: 1, name: "All" });
          setCategories(normalized);
        } else {
          setCategories([{ id: 1, name: "All" }]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([{ id: 1, name: "All" }]);
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

   /* -----------------------------------
     When user manually changes category, update localStorage
  ----------------------------------- */
  const handleSetActiveCategory = useCallback((id: number | null) => {
    setActiveCategoryId(id);
    try {
      if (id !== null) localStorage.setItem("portfolio_last_category_id", String(id));
    } catch {}
  }, []);

  /* -------------------------
     Debounced search: user types into searchTermInput -> after debounce set searchQuery
     Changing searchQuery triggers server fetch (see effect below)
     ------------------------- */
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchTermInput.trim();
      if (trimmed.length >= MIN_CHARS || trimmed.length === 0) {
        setSearchQuery(trimmed);
      }
      // if trimmed too short (1-2 chars) we keep previous searchQuery (so no flicker)
    }, DEBOUNCE_DELAY_MS);

    return () => clearTimeout(handler);
  }, [searchTermInput]);

  /* -------------------------
     Utility: build query params for API call
     ------------------------- */
  const buildApiUrl = useCallback((pageNum: number) => {
    const base = `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio`;
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", String(ITEMS_PER_PAGE)); // if your backend uses limit param (safe to include)
    // category: backend interprets category_id=1 as all
    const catIdToSend = activeCategoryId ?? 1;
    params.set("category_id", String(catIdToSend));
    // sort mapping: 'latest' | 'atoz' | 'ztoa' (backend expects 'atoz'/'ztoa' or 'latest')
    if (sortBy === "az") params.set("sort", "atoz");
    else if (sortBy === "za") params.set("sort", "ztoa");
    else params.set("sort", "latest");
    if (searchQuery) params.set("search", searchQuery);
    return `${base}?${params.toString()}`;
  }, [activeCategoryId, sortBy, searchQuery]);

  /* -------------------------
     Fetch helper: fetch single page from API
     - appends results when append === true
     - cancels previous fetch via AbortController
     ------------------------- */
  const fetchPage = useCallback(async (pageToFetch: number, append = false) => {
    // cancel previous fetch
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setIsLoading(true);
    try {
      const url = buildApiUrl(pageToFetch);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Failed fetching portfolio: ${res.status}`);
      }
      const json = await res.json();
      // expected backend response { data: PortfolioItem[], pagination: { totalItems, totalPages, currentPage, itemsPerPage } }
      const fetchedItems: PortfolioItem[] = Array.isArray(json.data) ? json.data : [];
      const pagination = json.pagination || {};
      const fetchedTotalPages = pagination.totalPages ?? 1;
      const fetchedTotalItems = pagination.totalItems ?? (append ? items.length + fetchedItems.length : fetchedItems.length);

      setTotalPages(fetchedTotalPages);
      setTotalItems(fetchedTotalItems);
      setPage(pageToFetch);

      setItems(prev => {
        if (append) {
          // avoid duplicates by id
          const ids = new Set(prev.map(p => p.id));
          const deduped = fetchedItems.filter(fi => !ids.has(fi.id));
          return prev.concat(deduped);
        } else {
          return fetchedItems;
        }
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        // expected when cancelling; ignore silently
      } else {
        console.error("Error fetching portfolio items:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildApiUrl, items.length]);

  /* -------------------------
     Effect: initial load and when filters change (category, sort, search)
     - reset to page 1 and fetch fresh data (no append)
     ------------------------- */
  useEffect(() => {
    // reset items and page then fetch first page
    setItems([]);
    setPage(1);
    setTotalPages(1);
    // fetch first page (no append)
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId, sortBy, searchQuery]); // fetchPage stable, but include deps explicit: activeCategoryId, sortBy, searchQuery

  /* -------------------------
     Load more handler (fetch next page and append)
     ------------------------- */
  const handleLoadMore = useCallback(() => {
    if (isLoading) return;
    if (page >= totalPages) return;
    const next = page + 1;
    fetchPage(next, true);
  }, [fetchPage, isLoading, page, totalPages]);

  /* -------------------------
     Derived state: whether there is more to load
     ------------------------- */
  const hasMoreToLoad = useMemo(() => page < totalPages, [page, totalPages]);

  /* -------------------------
     UI: activeCategoryName for display (avoid recompute)
     ------------------------- */
  const activeCategoryName = useMemo(() => {
    if (!categories || categories.length === 0) return "All";
    const found = categories.find(c => c.id === (activeCategoryId ?? 1));
    return found ? found.name : "All";
  }, [categories, activeCategoryId]);

  return (
    <main className="pt-16 sm:pt-20 min-h-screen flex flex-col items-center px-4 relative text-white font-inter">
      <section className="mb-6 sm:mb-8 p-4 pt-8 sm:pt-12">
        <AnimatedText
          text="PORTFOLIO"
          className="!text-4xl sm:!text-5xl md:!text-7xl lg:!text-8xl !text-center !font-bold !text-white tracking-widest"
        />
      </section>

      <div className="w-full flex justify-center">
        <FilterBar
          searchTermInput={searchTermInput}
          onSearchInputChange={setSearchTermInput}
          activeCategoryId={activeCategoryId}
          setActiveCategoryId={handleSetActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
        />
      </div>

      <section className="w-full max-w-7xl px-4 lg:px-0 mx-auto">
        {items.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-400">
            No projects found matching your criteria.
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* If items empty while loading, show nothing (or you can show placeholders) */}
          {items.length === 0 && isLoading ? (
            // show mock placeholders (use the original MOCK to preserve look)
            [0, 1, 2, 3, 4, 5].map((m, index) => (
              <div key={`ph-${index}`} className="animate-pulse">
                <GlassCard className="w-full h-full">
                  <div className="w-full h-48 bg-gray-800" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-700 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                </GlassCard>
              </div>
            ))
          ) : (
            items.map((item, index) => (
              <PortfolioItemCard key={item.id} item={item} index={index} />
            ))
          )}
        </div>

        {/* Load More */}
        {hasMoreToLoad && (
          <div className="flex justify-center mb-20">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`
                px-8 py-3 text-lg font-semibold rounded-lg border-2 border-[#00A859] 
                bg-transparent text-[#00A859] transition-all duration-300 
                hover:bg-[#00A859] hover:text-white hover:shadow-[0_0_20px_rgba(0,168,89,0.6)]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

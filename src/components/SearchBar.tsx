import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Resources } from '@/entities/resources';
import { Counselors } from '@/entities/counselors';
import { ForumCategories } from '@/entities/forumcategories';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'counselor' | 'forum' | 'page';
  link: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const pages = [
    { title: 'Home', link: '/', type: 'page' as const },
    { title: 'Chat Support', link: '/chat', type: 'page' as const },
    { title: 'Book Counselor', link: '/booking', type: 'page' as const },
    { title: 'Resources', link: '/resources', type: 'page' as const },
    { title: 'Forum', link: '/forum', type: 'page' as const },
    { title: 'Mindful Garden', link: '/plant-game', type: 'page' as const },
  ];

  useEffect(() => {
    const searchContent = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const query = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      try {
        // Search pages
        const pageMatches = pages.filter(
          page =>
            page.title.toLowerCase().includes(query) ||
            page.link.toLowerCase().includes(query)
        );
        allResults.push(
          ...pageMatches.map(page => ({
            id: page.link,
            title: page.title,
            description: `Navigate to ${page.title}`,
            type: 'page' as const,
            link: page.link,
          }))
        );

        // Search resources
        const { items: resources } = await BaseCrudService.getAll<Resources>('resources');
        const resourceMatches = resources.filter(
          r =>
            r.title?.toLowerCase().includes(query) ||
            r.description?.toLowerCase().includes(query) ||
            r.resourceType?.toLowerCase().includes(query)
        );
        allResults.push(
          ...resourceMatches.slice(0, 3).map(r => ({
            id: r._id,
            title: r.title || 'Untitled Resource',
            description: r.description || r.resourceType || 'Resource',
            type: 'resource' as const,
            link: `/resources#${r._id}`,
          }))
        );

        // Search counselors
        const { items: counselors } = await BaseCrudService.getAll<Counselors>('counselors');
        const counselorMatches = counselors.filter(
          c =>
            c.counselorName?.toLowerCase().includes(query) ||
            c.specialty?.toLowerCase().includes(query) ||
            c.bio?.toLowerCase().includes(query)
        );
        allResults.push(
          ...counselorMatches.slice(0, 3).map(c => ({
            id: c._id,
            title: c.counselorName || 'Counselor',
            description: c.specialty || 'Mental Health Professional',
            type: 'counselor' as const,
            link: '/booking',
          }))
        );

        // Search forum categories
        const { items: categories } = await BaseCrudService.getAll<ForumCategories>('forumcategories');
        const categoryMatches = categories.filter(
          cat =>
            cat.categoryName?.toLowerCase().includes(query) ||
            cat.description?.toLowerCase().includes(query)
        );
        allResults.push(
          ...categoryMatches.slice(0, 3).map(cat => ({
            id: cat._id,
            title: cat.categoryName || 'Forum Category',
            description: cat.description || 'Discussion Category',
            type: 'forum' as const,
            link: `/forum#${cat._id}`,
          }))
        );

        setResults(allResults.slice(0, 8)); // Limit to 8 results
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleResultClick = (link: string) => {
    navigate(link);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resource':
        return 'bg-blue-100 text-blue-700';
      case 'counselor':
        return 'bg-green-100 text-green-700';
      case 'forum':
        return 'bg-purple-100 text-purple-700';
      case 'page':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-foreground hover:bg-gray-50 transition-colors"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Search Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources, counselors, forum..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent outline-none font-paragraph text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <p className="font-paragraph text-sm text-gray-500">Searching...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result.link)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors mb-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-paragraph font-medium text-foreground text-sm">
                              {result.title}
                            </p>
                            <p className="font-paragraph text-xs text-gray-600 mt-1">
                              {result.description}
                            </p>
                          </div>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center">
                    <p className="font-paragraph text-sm text-gray-500">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="font-paragraph text-sm text-gray-500">
                      Start typing to search...
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

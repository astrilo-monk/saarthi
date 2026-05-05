import { useState, useEffect } from 'react';
import { Play, FileText, Headphones, Video, Globe, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Resources } from '@/entities/resources';
import { Image } from '@/components/ui/image';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resources[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const languages = ['English', 'Hindi', 'Gujarati', 'Tamil', 'Bengali'];
  const categories = ['All', 'Audio', 'Video', 'Article', 'Meditation', 'Exercise'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { items } = await BaseCrudService.getAll<Resources>('resources');
        setResources(items);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter(resource => {
    const languageMatch = selectedLanguage === 'English' || resource.language === selectedLanguage;
    const categoryMatch = selectedCategory === 'All' || resource.resourceType === selectedCategory;
    return languageMatch && categoryMatch;
  });

  const getResourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'audio':
        return Headphones;
      case 'video':
        return Video;
      case 'article':
        return FileText;
      default:
        return Play;
    }
  };

  const featuredResources = [
    {
      title: 'Guided Breathing Exercise',
      description: '5-minute breathing technique to reduce anxiety and stress',
      type: 'Audio',
      duration: '5 min',
      icon: Headphones,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Sleep Meditation',
      description: 'Calming meditation to help you fall asleep peacefully',
      type: 'Audio',
      duration: '15 min',
      icon: Headphones,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Stress Management Tips',
      description: 'Evidence-based strategies for managing academic stress',
      type: 'Article',
      duration: '8 min read',
      icon: FileText,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Mindfulness for Students',
      description: 'Introduction to mindfulness practices for college life',
      type: 'Video',
      duration: '12 min',
      icon: Video,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[120rem] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Mental Health Resources
          </h1>
          <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
            Access a comprehensive collection of mental health resources including guided meditations, 
            educational articles, and wellness tools designed specifically for students.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Filter */}
              <div>
                <label className="block font-paragraph font-medium text-foreground mb-3">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <button
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                      className={`px-4 py-2 rounded-lg font-paragraph text-sm transition-colors ${
                        selectedLanguage === language
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block font-paragraph font-medium text-foreground mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-paragraph text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
            Featured Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${resource.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="font-heading font-bold text-foreground mb-2">
                    {resource.title}
                  </h3>
                  
                  <p className="font-paragraph text-sm text-gray-600 mb-4">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-paragraph text-xs text-gray-500">
                      {resource.duration}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-paragraph text-xs">
                      {resource.type}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* All Resources */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              All Resources ({filteredResources.length})
            </h2>
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-paragraph text-gray-600">
                No resources found for the selected filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const Icon = getResourceIcon(resource.resourceType || '');
                return (
                  <motion.div
                    key={resource._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {resource.thumbnailImage && (
                      <div className="aspect-video relative">
                        <Image
                          src={resource.thumbnailImage}
                          alt={resource.title || 'Resource thumbnail'}
                          width={400}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-heading font-bold text-foreground flex-1">
                          {resource.title}
                        </h3>
                        {resource.resourceType && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-paragraph text-xs ml-2">
                            {resource.resourceType}
                          </span>
                        )}
                      </div>
                      
                      <p className="font-paragraph text-sm text-gray-600 mb-4 line-clamp-3">
                        {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {resource.language && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-paragraph text-xs">
                              {resource.language}
                            </span>
                          )}
                        </div>
                        
                        {resource.contentUrl && (
                          <a
                            href={resource.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Access</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Access Tools */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
            Quick Access Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Relaxation Audio</h3>
              <p className="font-paragraph text-sm text-gray-600 mb-4">
                Guided breathing exercises and calming soundscapes
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-blue-700 transition-colors">
                Listen Now
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Guided Breathing</h3>
              <p className="font-paragraph text-sm text-gray-600 mb-4">
                Interactive breathing exercises for stress relief
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-green-700 transition-colors">
                Start Exercise
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Self-Help Guides</h3>
              <p className="font-paragraph text-sm text-gray-600 mb-4">
                Downloadable PDFs and worksheets for personal growth
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-purple-700 transition-colors">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
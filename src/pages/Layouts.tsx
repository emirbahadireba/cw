import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/Layout/PageLayout';
import { Plus, Search, Filter, Grid, List, Copy, Edit, Trash2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '../store/layoutStore';
import toast from 'react-hot-toast';

const categories = ['Tümü', 'Genel', 'Haber', 'Reklam', 'Etkinlik', 'Şablon'];

export default function Layouts() {
  const { layouts, deleteLayout } = useLayoutStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const filteredLayouts = layouts.filter(layout => {
    const matchesSearch = layout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || layout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" layoutunu silmek istediğinizden emin misiniz?`)) {
      deleteLayout(id);
      toast.success('Layout başarıyla silindi!');
    }
  };

  const handleDuplicate = (layout: any) => {
    toast.success('Layout kopyalandı!');
  };

  return (
    <PageLayout 
      title="Layoutlar" 
      action={
        <Link to="/layouts/editor">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors shadow-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Layout</span>
          </motion.button>
        </Link>
      }
    >
      <div className="space-y-5">
        {/* Filters and Controls - Kompakt */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
              <input
                type="text"
                placeholder="Layout ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            
            <div className="flex items-center space-x-1 bg-surface border border-border rounded-lg p-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'text-textSecondary hover:text-text'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-surface border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-textSecondary hover:text-text'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'text-textSecondary hover:text-text'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout Grid/List - Kompakt */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
              : 'space-y-3'
            }
          >
            {filteredLayouts.map((layout, index) => (
              <motion.div
                key={layout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-surface border border-border rounded-lg overflow-hidden group hover:border-primary/50 transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'hover:scale-102 hover:shadow-lg hover:shadow-primary/10' 
                    : 'flex items-center p-3'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                      <div 
                        className="absolute inset-0 opacity-50"
                        style={{ background: layout.background }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/60 text-2xl font-light">
                          {layout.width} × {layout.height}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {layout.isTemplate && (
                          <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            Şablon
                          </span>
                        )}
                        <span className="bg-background/80 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {layout.elements.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-text text-base mb-1">{layout.name}</h3>
                          <p className="text-textSecondary text-xs">{layout.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-textSecondary text-xs mb-3">
                        {layout.updatedAt.toLocaleDateString('tr-TR')}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Link to={`/layouts/editor/${layout.id}`} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-primary text-white py-2 px-3 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Düzenle</span>
                          </motion.button>
                        </Link>
                        
                        <div className="flex space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDuplicate(layout)}
                            className="p-1.5 bg-background border border-border rounded-md hover:border-secondary transition-colors"
                            title="Kopyala"
                          >
                            <Copy className="w-3 h-3 text-textSecondary hover:text-secondary" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 bg-background border border-border rounded-md hover:border-success transition-colors"
                            title="Önizle"
                          >
                            <Play className="w-3 h-3 text-textSecondary hover:text-success" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(layout.id, layout.name)}
                            className="p-1.5 bg-background border border-border rounded-md hover:border-error transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3 h-3 text-textSecondary hover:text-error" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-md flex-shrink-0 mr-3 relative overflow-hidden">
                      <div 
                        className="absolute inset-0 opacity-50"
                        style={{ background: layout.background }}
                      ></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-text text-base">{layout.name}</h3>
                          <p className="text-textSecondary text-xs">{layout.category} • {layout.elements.length} öğe</p>
                          <p className="text-textSecondary text-xs">
                            {layout.width} × {layout.height} • {layout.updatedAt.toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {layout.isTemplate && (
                            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              Şablon
                            </span>
                          )}
                          
                          <Link to={`/layouts/editor/${layout.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center space-x-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Düzenle</span>
                            </motion.button>
                          </Link>
                          
                          <div className="flex space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDuplicate(layout)}
                              className="p-1.5 bg-background border border-border rounded-md hover:border-secondary transition-colors"
                              title="Kopyala"
                            >
                              <Copy className="w-3 h-3 text-textSecondary hover:text-secondary" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 bg-background border border-border rounded-md hover:border-success transition-colors"
                              title="Önizle"
                            >
                              <Play className="w-3 h-3 text-textSecondary hover:text-success" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(layout.id, layout.name)}
                              className="p-1.5 bg-background border border-border rounded-md hover:border-error transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3 h-3 text-textSecondary hover:text-error" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredLayouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">Layout bulunamadı</h3>
            <p className="text-textSecondary text-sm mb-4">
              {searchQuery || selectedCategory !== 'Tümü' 
                ? 'Arama kriterlerinize uygun layout bulunamadı.'
                : 'Henüz hiç layout oluşturulmamış.'
              }
            </p>
            <Link to="/layouts/editor">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-primary/90 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Layout'unuzu Oluşturun</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}

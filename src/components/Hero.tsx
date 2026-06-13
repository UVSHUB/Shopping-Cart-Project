import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    title: 'Fresh Organic Produce Delivered to Your Home',
    subtitle: 'Get up to 25% OFF on premium vegetables and seasonal fruits sourced from local farmers.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop',
    cta: 'Shop Fresh Produce',
    category: 'Vegetables'
  },
  {
    id: 2,
    title: 'Sweet Celebrations & Gourmet Cakes',
    subtitle: 'Delicious custom-made fudge cakes, cheesecakes, and muffins freshly baked daily.',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=1200&auto=format&fit=crop',
    cta: 'Browse Bakery',
    category: 'Cakes'
  },
  {
    id: 3,
    title: 'Energize & Refresh with Pure Beverages',
    subtitle: '100% cold-pressed juices, organic dairy milk, and cold brew coffees for active routines.',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=1200&auto=format&fit=crop',
    cta: 'Shop Drinks',
    category: 'Beverages'
  }
];

export const Hero: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-3xl shadow-xl border border-app-border">
      {/* Slideshow background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[activeSlide].image})` }}
        >
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-2xl text-white">
        <motion.span
          key={`sub-${activeSlide}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block text-accent font-extrabold text-xs md:text-sm uppercase tracking-wider mb-2.5"
        >
          Special Weekly Offer
        </motion.span>
        
        <motion.h1
          key={`title-${activeSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-white drop-shadow-sm"
        >
          {slides[activeSlide].title}
        </motion.h1>

        <motion.p
          key={`desc-${activeSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm md:text-lg text-slate-200 mb-6 max-w-xl font-normal"
        >
          {slides[activeSlide].subtitle}
        </motion.p>

        <motion.div
          key={`btn-${activeSlide}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={() => navigate(`/products?category=${encodeURIComponent(slides[activeSlide].category)}`)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>{slides[activeSlide].cta}</span>
          </button>
        </motion.div>
      </div>

      {/* Slider Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass-button text-white"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass-button text-white"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeSlide ? 'w-6 bg-primary' : 'w-2.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

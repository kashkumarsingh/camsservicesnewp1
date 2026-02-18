'use client';

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ImageItem {
  src: string;
  alt: string;
}

interface ContentItem {
  content: React.ReactNode;
}

type SliderItem = ImageItem | ContentItem;

interface SliderProps {
  items: SliderItem[];
  type: 'image' | 'content';
  className?: string;
  hasShadow?: boolean; // Optional shadow
  slidesToShow?: number; // New prop to control how many items are visible at once
  arrowColor?: string; // New prop for arrow color
  dotColor?: string; // New prop for dot color
  gap?: string; // New prop for gap between slides (e.g., 'gap-4', 'gap-8')
  itemHeightClass?: string; // New prop for controlling individual item height
}

const Slider: React.FC<SliderProps> = ({ items, type, className = '', hasShadow = true, slidesToShow = 1, arrowColor = 'text-gray-800', dotColor = 'bg-gray-800', gap = 'gap-4', itemHeightClass = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSlidesToShow, setCurrentSlidesToShow] = useState(slidesToShow);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCurrentSlidesToShow(1); // 1 item on small screens
      } else if (window.innerWidth < 1024) {
        setCurrentSlidesToShow(slidesToShow > 2 ? 2 : slidesToShow); // 2 items on medium screens, or slidesToShow if less than 2
      } else {
        setCurrentSlidesToShow(slidesToShow); // slidesToShow on large screens
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesToShow]);

  const totalSlides = items.length;
  const maxIndex = Math.ceil(totalSlides / currentSlidesToShow) - 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (maxIndex + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex, currentSlidesToShow]);
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (maxIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (maxIndex + 1)) % (maxIndex + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useLayoutEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const slides = Array.from(slider.children);

    slides.forEach(slide => {
      gsap.fromTo(
        slide,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: slide,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }, [items]);

  return (
    <div className={`relative ${className} ${hasShadow ? 'shadow-lg rounded-2xl' : ''}`}>
      <div className="overflow-hidden rounded-2xl">
        <div ref={sliderRef} className={`flex transition-transform duration-500 ease-in-out ${gap}`} style={{ transform: `translateX(-${currentIndex * (100 / currentSlidesToShow)}%)` }}>
          {items.map((item, index) => (
            <div key={index} className={`flex-shrink-0 ${itemHeightClass}`} style={{ width: `calc(${100 / currentSlidesToShow}% - ${parseInt(gap.replace('gap-', '')) / currentSlidesToShow}rem)` }}>
              {type === 'image' && 'src' in item ? (
                <Image src={item.src} alt={item.alt} width={600} height={400} className="w-full h-auto object-cover" />
              ) : (
                (item as ContentItem).content
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={prevSlide} className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 ${arrowColor}`}>
        <ArrowRight className="w-5 h-5 rotate-180" />
      </button>
      <button onClick={nextSlide} className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 ${arrowColor}`}>
        <ArrowRight className="w-5 h-5" />
      </button>
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? dotColor : 'bg-gray-300'}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Slider;
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ImageCarouselProps {
    universityName: string;
}

// Dynamically import all images in the carousel folder
const carouselImages = import.meta.glob('/assets/carousel/*/*.{png,jpg,jpeg,svg,webp}', { eager: true, query: '?url', import: 'default' });

const ImageCarousel: React.FC<ImageCarouselProps> = ({ universityName }) => {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Filter images for the specific university
        // The path format is /assets/carousel/[University Name]/[image.jpg]
        // We need to match the University Name part
        const uniImages = Object.keys(carouselImages)
            .filter(path => path.includes(`/assets/carousel/${universityName}/`))
            .map(path => carouselImages[path]);

        console.log(`Found ${uniImages.length} images for ${universityName}`);
        setImages(uniImages);
        setCurrentIndex(0);
    }, [universityName]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    if (images.length === 0) {
        return (
            <div className="w-full h-96 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>Фотографии загружаются...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-96 group rounded-2xl overflow-hidden bg-slate-900">
            <div
                className="w-full h-full transition-transform duration-500 ease-out flex"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((img, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                        <img
                            src={img}
                            alt={`${universityName} view ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Dark gradient overlay for text readability if needed */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCarousel;

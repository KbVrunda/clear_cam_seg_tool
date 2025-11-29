import { useState } from 'react';
import { mockImages, mockSelectedImage } from '../utils/mockData';

export default function ImageThumbnailGrid() {
  const [selectedImage, setSelectedImage] = useState(mockSelectedImage.id);

  return (
    <div className="bg-gray-50 border-t border-gray-300 p-4 overflow-x-auto">
      <div className="flex space-x-3">
        {mockImages.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image.id)}
            className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition ${
              selectedImage === image.id
                ? 'border-blue-600 ring-2 ring-blue-300'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <img
              src={image.thumbnail}
              alt={image.filename}
              className="w-24 h-16 object-cover"
            />
            <div className="px-2 py-1 bg-white text-xs text-gray-600 text-center">
              {image.filename}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


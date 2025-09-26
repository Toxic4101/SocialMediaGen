import React from 'react';
import { Icon } from './Icon';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, totalStars = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Icon
            key={index}
            name="star"
            className={`w-4 h-4 ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-600'
            }`}
            style={{ fill: starValue <= rating ? 'currentColor' : 'none' }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
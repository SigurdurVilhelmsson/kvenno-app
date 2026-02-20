import { Link } from 'react-router-dom';

import { Category } from '../data/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/spjald/${category.id}`} className="block h-full">
      <div
        className="group relative overflow-hidden rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-200 ease-out hover:-translate-y-0.5 cursor-pointer h-full flex flex-col"
        style={{ backgroundColor: category.color }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative p-6 sm:p-8 flex flex-col flex-1">
          <div className="text-4xl sm:text-5xl mb-4">{category.icon}</div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-2">
            {category.name}
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed flex-1">
            {category.description}
          </p>
          <div className="mt-4 flex items-center text-white/70 text-sm font-medium group-hover:text-white transition-colors">
            <span>Skoða spjald</span>
            <svg
              className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

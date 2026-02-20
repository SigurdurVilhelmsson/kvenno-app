import { Container } from '@kvenno/shared/components';

import { CategoryCard } from '../components/CategoryCard';
import { categories } from '../data';

export function Home() {
  return (
    <Container className="py-10 sm:py-16">
      {/* Hero section */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-900 mb-4">
          Kennsluspjöld fyrir íslenskukennslu
        </h1>
        <p className="text-lg sm:text-xl text-warm-600 max-w-2xl mx-auto leading-relaxed">
          Veldu efnisflokk og erfiðleikastig til að búa til prentvæn spjöld sem
          styðja nemendur í að lýsa myndum munnlega á íslensku.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warm-900 text-white text-sm font-bold mb-3">
            1
          </div>
          <p className="font-semibold text-warm-900 mb-1">Veldu flokk</p>
          <p className="text-sm text-warm-500">Dýr, matur, farartæki og fleira</p>
        </div>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warm-900 text-white text-sm font-bold mb-3">
            2
          </div>
          <p className="font-semibold text-warm-900 mb-1">Veldu stig</p>
          <p className="text-sm text-warm-500">A1 byrjandi, A2 grunnþekking, B1 miðstig</p>
        </div>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-warm-900 text-white text-sm font-bold mb-3">
            3
          </div>
          <p className="font-semibold text-warm-900 mb-1">Hladdu niður</p>
          <p className="text-sm text-warm-500">Fáðu PDF til að prenta og plasta</p>
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-3 lg:grid-cols-3 lg:grid-rows-2 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Container>
  );
}

import { useState, useMemo } from 'react';
import { ELEMENTS, CATEGORY_COLORS, APPROX_MASSES, type Element, type ElementCategory } from '../data/elements';

interface PeriodicTableProps {
  onClose: () => void;
  /** Show approximate masses instead of exact */
  showApproximate?: boolean;
  /** Highlight specific elements */
  highlightElements?: string[];
  /** Show element info on click */
  onElementClick?: (element: Element) => void;
}

// Element cell component
function ElementCell({
  element,
  showApproximate,
  isHighlighted,
  isSelected,
  onClick
}: {
  element: Element;
  showApproximate: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const colors = CATEGORY_COLORS[element.category];
  const mass = showApproximate
    ? APPROX_MASSES[element.symbol] || Math.round(element.atomicMass)
    : element.atomicMass.toFixed(3);

  return (
    <button
      onClick={onClick}
      className={`
        w-full h-full min-h-[48px] md:min-h-[56px] p-1 rounded-md border-2 transition-all
        flex flex-col items-center justify-center text-center
        hover:scale-110 hover:z-10 hover:shadow-lg
        ${colors.bg} ${colors.text} ${colors.border}
        ${isHighlighted ? 'ring-2 ring-primary ring-offset-1' : ''}
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 scale-110 z-10' : ''}
      `}
    >
      <span className="text-[8px] md:text-[10px] text-gray-500">{element.atomicNumber}</span>
      <span className="text-sm md:text-lg font-bold leading-tight">{element.symbol}</span>
      <span className="text-[8px] md:text-[10px] font-mono leading-tight">
        {showApproximate ? `≈${mass}` : mass}
      </span>
    </button>
  );
}

// Empty cell placeholder
function EmptyCell() {
  return <div className="w-full h-full min-h-[48px] md:min-h-[56px]" />;
}

export function PeriodicTable({
  onClose,
  showApproximate = false,
  highlightElements = [],
  onElementClick
}: PeriodicTableProps) {
  const [search, setSearch] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showApprox, setShowApprox] = useState(showApproximate);

  // Build periodic table grid (18 groups x 7 periods for main table)
  const periodicGrid = useMemo(() => {
    const grid: (Element | null)[][] = [];

    // Create 7 periods (rows)
    for (let period = 1; period <= 7; period++) {
      const row: (Element | null)[] = [];
      // Create 18 groups (columns)
      for (let group = 1; group <= 18; group++) {
        const element = ELEMENTS.find(e => e.period === period && e.group === group);
        row.push(element || null);
      }
      grid.push(row);
    }

    return grid;
  }, []);

  // Filter elements for list view
  const filteredElements = useMemo(() => {
    if (!search) return ELEMENTS;
    const searchLower = search.toLowerCase();
    return ELEMENTS.filter(
      el =>
        el.symbol.toLowerCase().includes(searchLower) ||
        el.name.toLowerCase().includes(searchLower) ||
        el.atomicNumber.toString().includes(search)
    );
  }, [search]);

  const highlightSet = new Set(highlightElements);

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
    onElementClick?.(element);
  };

  // Category legend
  const categories: { key: ElementCategory; label: string }[] = [
    { key: 'alkali-metal', label: 'Alkalímálmar' },
    { key: 'alkaline-earth', label: 'Jarðalkalímálmar' },
    { key: 'transition-metal', label: 'Skiptimálmar' },
    { key: 'post-transition-metal', label: 'P-málmar' },
    { key: 'metalloid', label: 'Hálfmálmar' },
    { key: 'nonmetal', label: 'Ómálmar' },
    { key: 'halogen', label: 'Halógen' },
    { key: 'noble-gas', label: 'Eðallofttegundir' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-3 md:p-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Lotukerfið</h2>
            <p className="text-xs md:text-sm opacity-90">Smelltu á frumefni til að sjá nánari upplýsingar</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Loka"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="p-3 md:p-4 border-b bg-gray-50 shrink-0">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center">
            <input
              type="text"
              placeholder="Leita (nafn, tákn, atómnúmer)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none text-sm"
            />

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border-2 border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📊 Tafla
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📋 Listi
              </button>
            </div>

            {/* Mass toggle */}
            <button
              onClick={() => setShowApprox(!showApprox)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                showApprox
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
              }`}
            >
              {showApprox ? '≈ Námundað' : '🎯 Nákvæmt'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-2 md:p-4">
          {viewMode === 'grid' ? (
            <div className="min-w-[700px]">
              {/* Periodic Table Grid */}
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                {/* Group numbers header */}
                {Array.from({ length: 18 }, (_, i) => (
                  <div key={`group-${i + 1}`} className="text-center text-xs text-gray-400 font-semibold py-1">
                    {i + 1}
                  </div>
                ))}

                {/* Periodic table rows */}
                {periodicGrid.map((row, periodIdx) => (
                  row.map((element, groupIdx) => (
                    <div key={`${periodIdx}-${groupIdx}`} className="aspect-square">
                      {element ? (
                        <ElementCell
                          element={element}
                          showApproximate={showApprox}
                          isHighlighted={highlightSet.has(element.symbol)}
                          isSelected={selectedElement?.symbol === element.symbol}
                          onClick={() => handleElementClick(element)}
                        />
                      ) : (
                        <EmptyCell />
                      )}
                    </div>
                  ))
                ))}
              </div>

              {/* Category Legend */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Flokkar frumefna:</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const colors = CATEGORY_COLORS[cat.key];
                    return (
                      <div
                        key={cat.key}
                        className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                      >
                        {cat.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredElements.map((element) => (
                <button
                  key={element.symbol}
                  onClick={() => handleElementClick(element)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    hover:shadow-md hover:scale-[1.02]
                    ${CATEGORY_COLORS[element.category].bg}
                    ${CATEGORY_COLORS[element.category].border}
                    ${selectedElement?.symbol === element.symbol ? 'ring-4 ring-blue-500' : ''}
                    ${highlightSet.has(element.symbol) ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{element.symbol}</span>
                    <span className="text-xs text-gray-500">#{element.atomicNumber}</span>
                  </div>
                  <div className="text-sm text-gray-700">{element.name}</div>
                  <div className="text-sm font-mono text-gray-600 mt-1">
                    {showApprox
                      ? `≈ ${APPROX_MASSES[element.symbol] || Math.round(element.atomicMass)} g/mol`
                      : `${element.atomicMass.toFixed(3)} g/mol`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Element Detail Panel */}
        {selectedElement && (
          <div className="border-t bg-gray-50 p-4 shrink-0">
            <div className="flex items-start gap-4">
              <div className={`
                w-20 h-20 rounded-xl flex flex-col items-center justify-center
                ${CATEGORY_COLORS[selectedElement.category].bg}
                ${CATEGORY_COLORS[selectedElement.category].border}
                border-2
              `}>
                <span className="text-xs text-gray-500">{selectedElement.atomicNumber}</span>
                <span className="text-3xl font-bold">{selectedElement.symbol}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{selectedElement.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                  <div className="bg-white rounded-lg p-2 border">
                    <div className="text-gray-500 text-xs">Atómnúmer</div>
                    <div className="font-bold">{selectedElement.atomicNumber}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border">
                    <div className="text-gray-500 text-xs">Atómmassi (nákvæmt)</div>
                    <div className="font-bold font-mono">{selectedElement.atomicMass.toFixed(3)} g/mol</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border">
                    <div className="text-gray-500 text-xs">Atómmassi (námundað)</div>
                    <div className="font-bold font-mono">≈ {APPROX_MASSES[selectedElement.symbol] || Math.round(selectedElement.atomicMass)} g/mol</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border">
                    <div className="text-gray-500 text-xs">Staðsetning</div>
                    <div className="font-bold">Lota {selectedElement.period}, Flokkur {selectedElement.group}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedElement(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 p-3 text-center text-sm text-gray-600 shrink-0">
          <p>
            {showApprox
              ? 'Sýnir námundaðan atómmassa (heil tölu) fyrir einfalda útreikninga'
              : 'Sýnir nákvæman atómmassa í g/mol (atómeiningarmassi)'}
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, getLabel, getValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find((opt) => String(getValue(opt)) === String(value));

  const filteredOptions = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange(String(getValue(opt)));
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm cursor-pointer bg-white flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </span>
        <span className="text-slate-400 text-xs">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari..."
            className="px-3 py-2 text-sm border-b border-slate-200 focus:outline-none"
          />
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">Tidak ditemukan</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={getValue(opt)}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-teal-50 ${
                    String(getValue(opt)) === String(value) ? 'bg-teal-50 text-teal-700 font-medium' : ''
                  }`}
                >
                  {getLabel(opt)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
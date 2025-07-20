import { useState } from 'react';

export default function TransfigurationBooth() {
  const [file, setFile] = useState(null);
  const [spell, setSpell] = useState('evanesco');
  const [original, setOriginal] = useState(null);
  const [transformed, setTransformed] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const handleUpload = async () => {
    if (!file) return alert("Select a photo first");
    const formData = new FormData();
    formData.append('image', file);
    formData.append('spell', spell);
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/transfigure', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setOriginal(data.originalImageUrl);
    setTransformed(data.transformedImageUrl);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block animate-bounce mb-3">
            <span className="text-5xl">🪄</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-200 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-4 tracking-tight">
            Transfiguration Booth
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-xl mx-auto leading-relaxed">
            Harness the power of <span className="text-purple-300 font-semibold">ancient magic</span> to transform your images
          </p>
          <div className="flex justify-center mt-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 mb-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 hover:bg-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-end">
            
            {/* Spell Selection */}
            <div className="space-y-3">
              <label className="block text-slate-200 font-bold text-base mb-3 text-center lg:text-left">
                🔮 Choose Your Spell
              </label>
              <div className="relative group">
                <select 
                  value={spell} 
                  onChange={(e) => setSpell(e.target.value)} 
                  className="w-full bg-gradient-to-r from-purple-800 to-indigo-800 text-white border-2 border-purple-500/30 px-4 py-3 rounded-xl text-base font-semibold shadow-xl hover:from-purple-700 hover:to-indigo-700 hover:border-purple-400/50 focus:outline-none focus:ring-4 focus:ring-purple-400/30 focus:border-purple-400 transition-all duration-300 cursor-pointer appearance-none backdrop-blur-sm group-hover:scale-105 transform"
                >
                  <option className='text-slate-800 font-semibold' value="evanesco">👻 Evanesco</option>
                  <option className='text-slate-800 font-semibold' value="pictorifica">🖌️ Pictorifica</option>
                  <option className='text-slate-800 font-semibold' value="lumos">🌠 Lumos</option>
                  <option className='text-slate-800 font-semibold' value="serpensortia">🐍 Serpensortia</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-purple-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <label className="block text-slate-200 font-bold text-base mb-3 text-center">
                📸 Select Image
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-bold text-base shadow-xl border-2 border-rose-500/30 hover:border-rose-400/50 transition-all duration-300 text-center group-hover:scale-105 transform backdrop-blur-sm">
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span>✅</span>
                      <span className="truncate max-w-24">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>📁</span>
                      <span>Choose File</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transform Button */}
            <div className="space-y-3">
              <div className="h-6 mb-3"></div> {/* Spacer for alignment */}
              <button 
                onClick={handleUpload} 
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600 text-white px-4 py-3 rounded-xl font-black text-base shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-amber-400/30 hover:border-amber-300/50 disabled:border-slate-500/30 backdrop-blur-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>🔮 Casting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>✨</span>
                    <span>Cast Spell!</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-2xl px-8 py-4 border border-purple-400/30 shadow-2xl">
              <div className="relative">
                <div className="w-6 h-6 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-6 h-6 border-3 border-pink-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
              </div>
              <p className="text-lg font-bold text-transparent bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text animate-pulse">
                Channeling energies... 🔮✨
              </p>
            </div>
          </div>
        )}

        {/* Results Gallery */}
        {(original || transformed) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            {original && (
              <div className="group cursor-pointer">
                <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 shadow-2xl hover:shadow-slate-400/20 transition-all duration-700 transform hover:scale-105 hover:-translate-y-1">
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-bold text-slate-200 flex items-center space-x-2">
                      <span>📷</span>
                      <span>Original</span>
                    </h3>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border-3 border-slate-500/50 group-hover:border-slate-400/70 transition-colors duration-500 shadow-xl">
                    <img 
                      src={original} 
                      alt="Original" 
                      className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Transformed Image */}
            {transformed && (
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border-2 border-amber-400/40 rounded-2xl p-4 shadow-2xl hover:shadow-amber-400/30 transition-all duration-700 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                  {/* Sparkle effects */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-3 right-6 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-amber-200 via-purple-200 to-pink-200 bg-clip-text flex items-center space-x-2">
                      <span>✨</span>
                      <span>Transfigured</span>
                    </h3>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border-3 border-amber-400/70 hover:border-amber-300/90 transition-colors duration-500 shadow-2xl">
                    <img 
                      src={transformed} 
                      alt="Transformed" 
                      className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 px-3 py-1 rounded-full text-xs font-black shadow-lg animate-pulse">
                      🪄 MAGIC
                    </div>
                  </div>
                  
                  {/* Download Button */}
                  <div className="mt-4 text-center">
                    <a
                      href={transformed}
                      download="transfigured_image.jpg"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-500/30 hover:border-emerald-400/50 text-sm"
                    >
                      <span>💾</span>
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-slate-700/50">
          <p className="text-base text-slate-400 tracking-wide">
            Powered by <span className="text-purple-300 font-semibold">Ancient Magic</span> & 
            <span className="text-pink-300 font-semibold"> Modern Tech</span> ✨
          </p>
          <div className="flex justify-center mt-3 space-x-3">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-300"></div>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
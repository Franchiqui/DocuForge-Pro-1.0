import React from 'react';

type CircleGameProps = {
  level: number;
  score: number;
  activeColor?: 'red' | 'green' | 'blue' | 'yellow' | null;
  onColorClick?: (color: 'red' | 'green' | 'blue' | 'yellow') => void;
};

export default function CircleGame({ 
  level = 1, 
  score = 0, 
  activeColor = null,
  onColorClick 
}: CircleGameProps) {
  const handleColorClick = (color: 'red' | 'green' | 'blue' | 'yellow') => {
    if (onColorClick) {
      onColorClick(color);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <div className="relative w-96 h-96">
        {/* Marco negro exterior */}
        <div className="absolute inset-0 rounded-full border-12 border-black bg-black shadow-2xl"></div>
        
        {/* Círculo de colores */}
        <div className="absolute inset-8 rounded-full overflow-hidden">
          {/* Sección superior izquierda - Rojo */}
          <button
            onClick={() => handleColorClick('red')}
            className={`absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-full transition-all duration-300 ${onColorClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            style={{
              background: `radial-gradient(circle at 30% 30%, #ff0000, #cc0000)`,
              boxShadow: activeColor === 'red' 
                ? '0 0 60px #ff0000, 0 0 120px #ff0000, inset 0 0 60px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 0, 0, 0.9)' 
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
              opacity: activeColor === 'red' ? 1 : 0.4,
              filter: activeColor === 'red' ? 'brightness(2.5)' : 'brightness(0.6)',
            }}
          >
            {/* Efecto de brillo interior cuando está activo */}
            {activeColor === 'red' && (
              <div 
                className="absolute inset-0 rounded-tl-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent 70%)',
                  mixBlendMode: 'overlay'
                }}
              />
            )}
            {/* Letra del color */}
            <span className="absolute bottom-4 right-4 text-white font-bold text-xl drop-shadow-lg">
              R
            </span>
          </button>
          
          {/* Sección superior derecha - Azul */}
          <button
            onClick={() => handleColorClick('blue')}
            className={`absolute top-0 right-0 w-1/2 h-1/2 rounded-tr-full transition-all duration-300 ${onColorClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            style={{
              background: `radial-gradient(circle at 70% 30%, #0000ff, #0000cc)`,
              boxShadow: activeColor === 'blue' 
                ? '0 0 60px #0000ff, 0 0 120px #0000ff, inset 0 0 60px rgba(255, 255, 255, 0.8), 0 0 30px rgba(0, 0, 255, 0.9)' 
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
              opacity: activeColor === 'blue' ? 1 : 0.4,
              filter: activeColor === 'blue' ? 'brightness(2.5)' : 'brightness(0.6)',
            }}
          >
            {activeColor === 'blue' && (
              <div 
                className="absolute inset-0 rounded-tr-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent 70%)',
                  mixBlendMode: 'overlay'
                }}
              />
            )}
            <span className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-lg">
              B
            </span>
          </button>
          
          {/* Sección inferior izquierda - Verde */}
          <button
            onClick={() => handleColorClick('green')}
            className={`absolute bottom-0 left-0 w-1/2 h-1/2 rounded-bl-full transition-all duration-300 ${onColorClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            style={{
              background: `radial-gradient(circle at 30% 70%, #00ff00, #00cc00)`,
              boxShadow: activeColor === 'green' 
                ? '0 0 60px #00ff00, 0 0 120px #00ff00, inset 0 0 60px rgba(255, 255, 255, 0.8), 0 0 30px rgba(0, 255, 0, 0.9)' 
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
              opacity: activeColor === 'green' ? 1 : 0.4,
              filter: activeColor === 'green' ? 'brightness(2.5)' : 'brightness(0.6)',
            }}
          >
            {activeColor === 'green' && (
              <div 
                className="absolute inset-0 rounded-bl-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent 70%)',
                  mixBlendMode: 'overlay'
                }}
              />
            )}
            <span className="absolute top-4 right-4 text-white font-bold text-xl drop-shadow-lg">
              G
            </span>
          </button>
          
          {/* Sección inferior derecha - Amarillo */}
          <button
            onClick={() => handleColorClick('yellow')}
            className={`absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-full transition-all duration-300 ${onColorClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            style={{
              background: `radial-gradient(circle at 70% 70%, #ffff00, #cccc00)`,
              boxShadow: activeColor === 'yellow' 
                ? '0 0 60px #ffff00, 0 0 120px #ffff00, inset 0 0 60px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 0, 0.9)' 
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
              opacity: activeColor === 'yellow' ? 1 : 0.4,
              filter: activeColor === 'yellow' ? 'brightness(2.5)' : 'brightness(0.6)',
            }}
          >
            {activeColor === 'yellow' && (
              <div 
                className="absolute inset-0 rounded-br-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent 70%)',
                  mixBlendMode: 'overlay'
                }}
              />
            )}
            <span className="absolute top-4 left-4 text-white font-bold text-xl drop-shadow-lg">
              Y
            </span>
          </button>
        </div>

        {/* Círculo central para nivel y puntuación - Más pequeño */}
        <div className="absolute inset-1/3 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-8 border-black shadow-2xl flex flex-col items-center justify-center">
          <div className="text-white text-center">
            <div className="text-xs font-medium text-gray-400">NIVEL</div>
            <div className="text-4xl font-bold text-blue-400">{level}</div>
            <div className="text-xs font-medium text-gray-400 mt-2">PUNTOS</div>
            <div className="text-3xl font-bold text-green-400">{score}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md bg-gray-900 rounded-xl p-6 shadow-xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-white">SimonSays Pro</h3>
          <p className="text-sm text-gray-400">
            Juego clásico con diseño circular. Sigue la secuencia de colores que se iluminan.
          </p>
        </div>
      </div>
    </div>
  );
}

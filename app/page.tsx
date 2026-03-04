'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, HelpCircle, Power, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Footer from '@/components/layout/footer';
import CircleGame from '@/components/game/CircleGame';

type GameColor = 'red' | 'green' | 'blue' | 'yellow';
type Difficulty = 'slow' | 'normal' | 'fast';
type GameStatus = 'idle' | 'playing' | 'sequence' | 'input' | 'game-over';

interface Score {
  id: string;
  playerName: string;
  score: number;
  level: number;
  difficulty: Difficulty;
  date: string;
}

const colorMap: Record<GameColor, { light: string; dark: string; tone: number }> = {
  red: { light: '#ff0000', dark: '#cc0000', tone: 440 },
  green: { light: '#00ff00', dark: '#00cc00', tone: 554.37 },
  blue: { light: '#0000ff', dark: '#0000cc', tone: 659.25 },
  yellow: { light: '#ffff00', dark: '#cccc00', tone: 329.63 }
};

const difficultySpeeds: Record<Difficulty, number> = {
  slow: 1500,
  normal: 1000,
  fast: 600
};

const scoreSchema = z.object({
  playerName: z.string().min(1).max(20)
});

export default function SimonSaysPro() {
  const [gameStatus, setGameStatus] = useState < GameStatus > ('idle');
  const [sequence, setSequence] = useState < GameColor[] > ([]);
  const [playerInput, setPlayerInput] = useState < GameColor[] > ([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState < Difficulty > ('normal');
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [activeColor, setActiveColor] = useState < GameColor | null > (null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [highScores, setHighScores] = useState < Score[] > ([]);

  const audioContextRef = useRef < AudioContext | null > (null);
  const sequenceIndexRef = useRef(0);

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(scoreSchema)
  });

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playTone = useCallback((frequency: number) => {
    if (!isSoundOn || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }, [isSoundOn]);

  const generateSequence = useCallback((length: number): GameColor[] => {
    const colors: GameColor[] = ['red', 'green', 'blue', 'yellow'];
    return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  const playSequence = useCallback(async () => {
    if (sequence.length === 0) return;

    setGameStatus('sequence');
    sequenceIndexRef.current = 0;

    for (const color of sequence) {
      setActiveColor(color);
      playTone(colorMap[color].tone);

      await new Promise(resolve => setTimeout(resolve, difficultySpeeds[difficulty] / 2));

      setActiveColor(null);
      await new Promise(resolve => setTimeout(resolve, difficultySpeeds[difficulty] / 2));
    }

    setGameStatus('input');
    setPlayerInput([]);
  }, [sequence, difficulty, playTone]);

  const playSequenceRef = useRef < (() => Promise < void>) | null > (null);

  useEffect(() => {
    playSequenceRef.current = playSequence;
  }, [playSequence]);

  const resetGame = useCallback(() => {
    setSequence([]);
    setPlayerInput([]);
    setLevel(1);
    setScore(0);
    setActiveColor(null);
    sequenceIndexRef.current = 0;
    setGameStatus('idle');
    setShowGameOverModal(false);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameStatus('game-over');
    setShowGameOverModal(true);

    if (isStrictMode) {
      setTimeout(() => {
        resetGame();
        setShowGameOverModal(false);
      }, 2000);
    }
  }, [isStrictMode, resetGame]);

  const handleColorClick = useCallback((color: GameColor) => {
    if (gameStatus !== 'input' || !isPoweredOn) return;

    setActiveColor(color);
    playTone(colorMap[color].tone);

    const newInput = [...playerInput, color];
    setPlayerInput(newInput);

    setTimeout(() => setActiveColor(null), 300);

    // Verificar si el jugador cometió un error
    const expectedColor = sequence[newInput.length - 1];
    if (color !== expectedColor) {
      handleGameOver();
      return;
    }

    // Verificar si el jugador completó la secuencia correctamente
    if (newInput.length === sequence.length) {
      const newLevel = level + 1;
      const newScore = score + (level * 10);

      setLevel(newLevel);
      setScore(newScore);

      // Generar nueva secuencia con un color adicional
      const newSequence = [...sequence, generateSequence(1)[0]];
      setSequence(newSequence);

      // Cambiar a estado 'playing' y luego reproducir la nueva secuencia
      setGameStatus('playing');
      setTimeout(() => {
        playSequenceRef.current?.();
      }, 1500);
    }
  }, [gameStatus, isPoweredOn, playerInput, sequence, level, score, playTone, generateSequence, playSequence, handleGameOver]);

  const startGame = useCallback(() => {
    if (!isPoweredOn) return;

    resetGame();
    const initialSequence = generateSequence(1);
    setSequence(initialSequence);

    setGameStatus('playing');

    setTimeout(() => {
      playSequenceRef.current?.();
    }, 1000);
  }, [isPoweredOn, generateSequence, playSequence, resetGame]);

  const saveScore = useCallback(async (data: { playerName: string }) => {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: data.playerName,
          score,
          level,
          difficulty,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        reset();
        fetchHighScores();
        setShowGameOverModal(false);
        resetGame();
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [score, level, difficulty, resetGame]);

  const fetchHighScores = useCallback(async () => {
    try {
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        setHighScores(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  }, []);

  useEffect(() => {
    initAudioContext();
    fetchHighScores();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initAudioContext, fetchHighScores]);

  useEffect(() => {
    if (!isPoweredOn) {
      resetGame();
    }
  }, [isPoweredOn, resetGame]);

  const ColorButton = ({ color }: { color: GameColor }) => (
    <motion.button
      whileHover={{ scale: isPoweredOn && gameStatus === 'input' ? 1.1 : 1 }}
      whileTap={{ scale: isPoweredOn && gameStatus === 'input' ? 0.9 : 1 }}
      className={`
        relative w-32 h-32 md:w-40 md:h-40 rounded-full
        ${!isPoweredOn ? 'opacity-50 cursor-not-allowed' : ''}
        ${gameStatus === 'input' ? 'cursor-pointer' : 'cursor-default'}
        border-4 transition-all duration-300
        ${color === 'red' ? 'col-start-2 row-start-1' : ''}
        ${color === 'green' ? 'col-start-1 row-start-2' : ''}
        ${color === 'blue' ? 'col-start-2 row-start-2' : ''}
        ${color === 'yellow' ? 'col-start-1 row-start-1' : ''}
      `}
      onClick={() => handleColorClick(color)}
      disabled={!isPoweredOn || gameStatus !== 'input'}
      aria-label={`${color} button`}
      style={{
        borderColor: activeColor === color ? colorMap[color].light : '#1f2937',
        boxShadow: activeColor === color ? `0 0 30px ${colorMap[color].light}, 0 0 60px ${colorMap[color].light}40` : '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* Color base más apagado cuando está inactivo */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colorMap[color].light}, ${colorMap[color].dark})`,
            opacity: activeColor === color ? 1 : isPoweredOn ? 0.6 : 0.3,
            filter: activeColor === color ? 'brightness(1.5)' : 'brightness(0.8)'
          }}
        />

        {/* Efecto de brillo interior cuando está activo */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${activeColor === color ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            background: `radial-gradient(circle at center, ${colorMap[color].light}, transparent 70%)`,
            boxShadow: activeColor === color ? `inset 0 0 40px ${colorMap[color].light}` : 'none'
          }}
        />

        {/* Efecto de brillo exterior alrededor del botón */}
        <div
          className={`absolute -inset-4 rounded-full transition-all duration-300 ${activeColor === color ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            background: `radial-gradient(circle at center, ${colorMap[color].light}80, transparent 70%)`,
            filter: 'blur(10px)'
          }}
        />

        {/* Efecto de brillo adicional en el centro */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${activeColor === color ? 'opacity-80' : 'opacity-0'
            }`}
          style={{
            background: `radial-gradient(circle at center, white, transparent 60%)`,
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      {/* Letra del color */}
      <span className="absolute bottom-2 right-2 text-white font-bold text-lg drop-shadow-lg">
        {color.charAt(0).toUpperCase()}
      </span>

      {/* Efecto de pulso cuando está activo */}
      {activeColor === color && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            background: `radial-gradient(circle at center, ${colorMap[color].light}40, transparent)`,
            border: `2px solid ${colorMap[color].light}`
          }}
        />
      )}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <header className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
            SimonSays Pro
          </h1>
          <p className="text-gray-400 text-lg">¿Puedes seguir el ritmo de la luz?</p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-b from-[#333333] to-[#444444] rounded-3xl p-6 md:p-8 shadow-2xl">
                {/* Componente CircleGame con el diseño circular */}
                <CircleGame level={level} score={score} />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <button
                    onClick={startGame}
                    disabled={!isPoweredOn || gameStatus === 'sequence'}
                    className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-6 h-6 mb-2" />
                    <span className="text-sm">Start</span>
                  </button>

                  <button
                    onClick={resetGame}
                    disabled={!isPoweredOn}
                    className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="w-6 h-6 mb-2" />
                    <span className="text-sm">Reset</span>
                  </button>

                  <button
                    onClick={() => setIsSoundOn(!isSoundOn)}
                    className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    {isSoundOn ? <Volume2 className="w-6 h-6 mb-2" /> : <VolumeX className="w-6 h-6 mb-2" />}
                    <span className="text-sm">Sound</span>
                  </button>

                  <button
                    onClick={() => setIsPoweredOn(!isPoweredOn)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${isPoweredOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    <Power className="w-6 h-6 mb-2" />
                    <span className="text-sm">Power</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Game Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    disabled={!isPoweredOn}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 disabled:opacity-50"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsStrictMode(!isStrictMode)}
                  disabled={!isPoweredOn}
                  className={`w-full py-3 rounded-lg transition-colors ${isStrictMode
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-800 hover:bg-gray-700'
                    } disabled:opacity-50`}
                >
                  Strict Mode {isStrictMode ? '(ON)' : '(OFF)'}
                </button>

                <button
                  onClick={() => setShowTutorial(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  How to Play
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                High Scores
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {highScores.map((scoreItem, index) => (
                  <div key={scoreItem.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-yellow-700' :
                            'bg-gray-700'
                        }`}>
                        {index + 1}
                      </span>
                      <span>{scoreItem.playerName}</span>
                    </div>
                    <span className="font-mono font-bold">{scoreItem.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

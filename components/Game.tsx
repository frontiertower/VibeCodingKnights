'use client';

import { useEffect, useRef, useState } from 'react';
import { Knight, Bar, Dragon } from '@/lib/game-objects';
import { sounds } from '@/lib/sounds';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GROUND_Y,
  GROUND_HEIGHT,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MAX_SPEED,
  BAR_MIN_GAP,
  BAR_MAX_GAP,
  DRAGON_MIN_GAP,
  DRAGON_MAX_GAP,
  COLORS,
} from '@/lib/constants';

type GameState = 'start' | 'playing' | 'gameOver';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('start');
  const gameStateRef = useRef<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const gameLoopRef = useRef<number>();
  const gameDataRef = useRef({
    knight: new Knight(),
    bars: [] as Bar[],
    dragons: [] as Dragon[],
    speed: INITIAL_SPEED,
    score: 0,
    lastBarSpawn: 0,
    lastDragonSpawn: 0,
    frameCount: 0,
  });

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('vibeKnightsHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const checkCollision = (rect1: any, rect2: any) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Dark cyberpunk gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, COLORS.dark);
    gradient.addColorStop(1, COLORS.darker);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Starry background (cyberpunk city lights)
    ctx.fillStyle = COLORS.purpleLight;
    for (let i = 0; i < 50; i++) {
      const x = (i * 173) % GAME_WIDTH;
      const y = (i * 79) % (GROUND_Y - 50);
      const size = (i % 3) + 1;
      ctx.fillRect(x, y, size, size);
    }

    // Grid floor
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Horizontal grid lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + i * 10);
      ctx.lineTo(GAME_WIDTH, GROUND_Y + i * 10);
      ctx.stroke();
    }

    // Vertical grid lines (moving)
    const offset = (gameDataRef.current.frameCount * 2) % 40;
    for (let i = -1; i < GAME_WIDTH / 40 + 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 40 - offset, GROUND_Y);
      ctx.lineTo(i * 40 - offset, GAME_HEIGHT);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;

    // Ground line with glow
    ctx.strokeStyle = COLORS.purple;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.purple;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = gameDataRef.current;
    data.frameCount++;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background
    drawBackground(ctx);

    // Update knight
    data.knight.update();
    data.knight.draw(ctx);

    // Spawn bars
    if (data.frameCount - data.lastBarSpawn > BAR_MIN_GAP + Math.random() * (BAR_MAX_GAP - BAR_MIN_GAP)) {
      data.bars.push(new Bar(GAME_WIDTH));
      data.lastBarSpawn = data.frameCount;
    }

    // Spawn dragons
    if (data.frameCount - data.lastDragonSpawn > DRAGON_MIN_GAP + Math.random() * (DRAGON_MAX_GAP - DRAGON_MIN_GAP)) {
      data.dragons.push(new Dragon(GAME_WIDTH));
      data.lastDragonSpawn = data.frameCount;
    }

    // Update and draw bars
    data.bars = data.bars.filter((bar) => {
      bar.update(data.speed);
      bar.draw(ctx);

      // Check collision
      if (checkCollision(data.knight.getHitbox(), bar.getHitbox())) {
        sounds.collision();
        setGameState('gameOver');
        return true;
      }

      // Score when passing obstacle
      if (!bar.passed && bar.x + bar.width < data.knight.x) {
        bar.passed = true;
        data.score += 10;
        setScore(data.score);
        if (data.score % 100 === 0) {
          sounds.score();
        }
      }

      return !bar.isOffScreen();
    });

    // Update and draw dragons
    data.dragons = data.dragons.filter((dragon) => {
      dragon.update(data.speed);
      dragon.draw(ctx);

      // Check collision
      if (checkCollision(data.knight.getHitbox(), dragon.getHitbox())) {
        sounds.collision();
        setGameState('gameOver');
        return true;
      }

      // Score when passing obstacle
      if (!dragon.passed && dragon.x + dragon.width < data.knight.x) {
        dragon.passed = true;
        data.score += 15;
        setScore(data.score);
        if (data.score % 100 === 0) {
          sounds.score();
        }
      }

      return !dragon.isOffScreen();
    });

    // Increase speed over time
    if (data.speed < MAX_SPEED) {
      data.speed += SPEED_INCREMENT;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    const data = gameDataRef.current;
    data.knight = new Knight();
    data.bars = [];
    data.dragons = [];
    data.speed = INITIAL_SPEED;
    data.score = 0;
    data.lastBarSpawn = 0;
    data.lastDragonSpawn = 0;
    data.frameCount = 0;
    setScore(0);
    setGameState('playing');
    gameLoop();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentState = gameStateRef.current;
      
      if (currentState === 'start' && e.code === 'Space') {
        e.preventDefault();
        startGame();
        return;
      }

      if (currentState === 'playing') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          gameDataRef.current.knight.jump();
          sounds.jump();
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          gameDataRef.current.knight.duck();
          sounds.duck();
        }
      }

      if (currentState === 'gameOver' && e.code === 'Space') {
        e.preventDefault();
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'playing' && e.code === 'ArrowDown') {
        gameDataRef.current.knight.stopDuck();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === 'gameOver') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('vibeKnightsHighScore', score.toString());
      }
    }
  }, [gameState, score]);

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-cyber-dark to-cyber-darker">
      <div className="mb-4 flex items-center gap-8">
        <div className="text-neon-purple text-2xl font-bold">
          SCORE: {score}
        </div>
        <div className="text-neon-cyan text-2xl font-bold">
          HI: {highScore}
        </div>
        <button
          onClick={toggleMute}
          className="px-4 py-2 bg-cyber-purple text-white rounded font-bold hover:bg-cyber-purple-light transition-colors"
        >
          {isMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-4 border-cyber-purple rounded-lg glow-purple"
        />

        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <h1 className="text-neon-purple text-6xl font-bold mb-8 uppercase">
              Vibe Knights
            </h1>
            <p className="text-neon-cyan text-xl mb-4">Cyberpunk Runner</p>
            <div className="text-white text-lg mb-8 text-center">
              <p className="mb-2">SPACE / UP ARROW - Jump over bars</p>
              <p className="mb-2">DOWN ARROW - Duck under dragons</p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-cyber-pink text-white text-2xl font-bold rounded-lg hover:bg-cyber-purple-light transition-colors glow-purple animate-pulse"
            >
              PRESS SPACE TO START
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <h2 className="text-neon-pink text-5xl font-bold mb-4 uppercase">
              Game Over
            </h2>
            <p className="text-neon-purple text-3xl mb-2">Score: {score}</p>
            <p className="text-neon-cyan text-2xl mb-8">High Score: {highScore}</p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-cyber-purple text-white text-xl font-bold rounded-lg hover:bg-cyber-purple-light transition-colors glow-purple"
            >
              PRESS SPACE TO RESTART
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-cyber-purple-light text-sm">
        Built with Next.js • Cyberpunk Theme
      </div>
    </div>
  );
}
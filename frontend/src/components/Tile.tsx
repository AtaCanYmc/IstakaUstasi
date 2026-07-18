import React from 'react';
import type { Tile as TileType, TileColor } from '../services/api';

interface TileProps {
  tile: TileType;
  isIndicator?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const Tile: React.FC<TileProps> = ({ tile, isIndicator = false, onClick, onRemove, className = '' }) => {
  const getColorStyles = (color: TileColor) => {
    switch (color) {
      case 'RED':
        return 'text-red-500 border-red-200/50';
      case 'BLACK':
        return 'text-slate-950 border-slate-300/50';
      case 'BLUE':
        return 'text-blue-600 border-blue-200/50';
      case 'YELLOW':
        return 'text-amber-500 border-amber-200/50';
      case 'JOKER':
        return 'text-rose-600 border-rose-300/50 bg-radial from-amber-50 to-amber-100';
      default:
        return 'text-slate-700';
    }
  };

  const getLabel = (tile: TileType) => {
    if (tile.color === 'JOKER' || tile.value === 0) {
      return '★'; // Star symbol for fake okey / joker
    }
    return tile.value;
  };

  return (
    <div
      onClick={onClick}
      className={`relative select-none cursor-pointer flex flex-col items-center justify-center
        rounded-lg font-bold text-base xs:text-lg sm:text-xl lg:text-2xl shadow-md border-t border-b-4 border-x
        bg-gradient-to-b from-amber-50 to-amber-100/90 active:scale-95 transition-all
        ${getColorStyles(tile.color)}
        ${isIndicator ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-bg-primary shadow-emerald-500/20' : 'shadow-black/30'}
        ${className || 'w-11 h-16 sm:w-12 sm:h-18'}`}
      style={{
        textShadow: '0.5px 0.5px 0px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Tile Label */}
      <span className="leading-none">{getLabel(tile)}</span>

      {/* Tiny circle indicator at the bottom */}
      {tile.color !== 'JOKER' && (
        <span
          className={`hidden sm:block absolute bottom-2 w-1.5 h-1.5 rounded-full ${
            tile.color === 'RED'
              ? 'bg-red-500'
              : tile.color === 'BLACK'
              ? 'bg-slate-950'
              : tile.color === 'BLUE'
              ? 'bg-blue-600'
              : 'bg-amber-500'
          }`}
        />
      )}

      {/* Hover delete button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px]
            flex items-center justify-center hover:bg-rose-700 transition-colors shadow opacity-0 hover:opacity-100 group-hover:opacity-100"
          title="Remove tile"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Tile;

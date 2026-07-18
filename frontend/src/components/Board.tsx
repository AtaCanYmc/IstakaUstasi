import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useStore } from '../store/store';
import Tile from './Tile';

export const Board: React.FC = () => {
  const rack = useStore((state) => state.rack);
  const moveTile = useStore((state) => state.moveTile);
  const removeTile = useStore((state) => state.removeTile);

  const renderSlot = (index: number) => {
    const tile = rack[index];

    return (
      <Droppable droppableId={`slot-${index}`} type="SLOT" key={`slot-drop-${index}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`relative flex items-center justify-center w-12 h-18 sm:w-14 sm:h-20
              rounded-md border border-[var(--rack-slot-border)] bg-[var(--rack-slot-bg)] transition-colors duration-200
              ${snapshot.isDraggingOver ? 'bg-emerald-500/20 border-emerald-500/50' : ''}`}
          >
            {tile ? (
              <Draggable draggableId={`tile-${index}`} index={index} key={tile.id}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`group absolute z-10 transition-transform ${
                      dragSnapshot.isDragging ? 'rotate-3 scale-105 z-50' : ''
                    }`}
                  >
                    <Tile tile={tile} onRemove={() => removeTile(index)} />
                  </div>
                )}
              </Draggable>
            ) : (
              <span className="text-[10px] text-[var(--rack-slot-num)] font-medium select-none">{index + 1}</span>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  const onGlobalDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Determine target index
    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;

    const sourceIdx = parseInt(sourceId.split('-')[1], 10);
    const destIdx = parseInt(destId.split('-')[1], 10);

    if (isNaN(sourceIdx) || isNaN(destIdx)) return;

    moveTile(sourceIdx, destIdx);
  };

  // We have 40 slots, split into 2 rows of 20 slots
  const row1Slots = Array.from({ length: 20 }, (_, i) => i);
  const row2Slots = Array.from({ length: 20 }, (_, i) => i + 20);

  return (
    <DragDropContext onDragEnd={onGlobalDragEnd}>
      <div className="relative w-full max-w-6xl mx-auto p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[var(--rack-bg-from)] to-[var(--rack-bg-to)] border border-card-border shadow-2xl overflow-hidden">
        {/* Wood rack style decorative base */}
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-r from-[var(--rack-base-from)] via-[var(--rack-base-via)] to-[var(--rack-base-to)] border-t border-[var(--rack-border)]" />

        {/* Rack Rows Container */}
        <div className="flex flex-col gap-6 sm:gap-8 pb-4">
          {/* Row 1 */}
          <div className="relative">
            {/* Shelf divider shadow line */}
            <div className="absolute inset-x-0 -bottom-3 h-1.5 bg-black/35 dark:bg-black/50 blur-[1px]" />
            <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 sm:gap-2 justify-center items-center">
              {row1Slots.map((index) => renderSlot(index))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="relative">
            <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 sm:gap-2 justify-center items-center">
              {row2Slots.map((index) => renderSlot(index))}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default Board;

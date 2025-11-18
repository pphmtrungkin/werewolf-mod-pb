import React from 'react';

export default function SideButton({ id, name, hex_color, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        px-6 py-3 rounded-lg font-semibold
        transition-all duration-200 ease-in-out
        cursor-pointer
        ${selected ? 'scale-110 shadow-lg text-white' : 'text-black hover:text-white hover:shadow-md'}
        ${selected ? '' : 'bg-gray-400 hover:bg-[var(--btn-color)]'}
      `}
      style={
        selected
          ? { backgroundColor: hex_color, '--btn-color': hex_color }
          : { '--btn-color': hex_color }
      }
    >
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </button>
  );
}

import React from 'react';

export default function SideButton({ id, name, hex_color, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        px-6 py-3 rounded-lg font-semibold
        transition-all duration-200 ease-in-out
        hover:cursor-pointer
        ${selected ? 'scale-110 shadow-lg' : 'hover:opacity-100'}
      `}
      style={{ backgroundColor: selected ? hex_color : 'gray', color: selected ? 'white' : 'black' }}
    >
      {name.charAt(0).toUpperCase() + name.slice(1)}
    </button>
  );
}
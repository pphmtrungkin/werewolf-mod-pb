import React from 'react';

export default function SideButton({ id, name, hex_color, selected, onClick }) {
  return (
    <button
      className={`${selected ? 'selected' : ' text-black'} px-8 py-3 rounded-xl text-lg font-semibold`}
      style={{ backgroundColor: selected ? hex_color : '#bfbfbf' }}
      onClick={() => onClick(id)}
    >
      {name}
    </button>
  );
}
export default function Card({
  title,
  link,
  onSelect,
  count,
  selected,
}) {
  return (
    <div className="relative inline-block m-2">
      <button onClick={onSelect} className={`relative border-none p-0 bg-none ${selected ? 'grayscale-0' : 'grayscale'}`}>
        <img src={link} alt={title} className="block" />
        {count > 1 && (
          <span className="absolute top-0 right-0 bg-white text-black px-3 py-1 rounded-full text-lg font-semibold">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
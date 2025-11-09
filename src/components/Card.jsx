export default function Card({
  id,
  title,
  img,
  onSelect,
  count,
  selected,
}) {
  const url = import.meta.env.VITE_POCKETBASE_URL + '/api/files/cards/' + id + '/' + img;
  return (
    <div className="relative w-full p-2 outline-none">
      <button
        onClick={onSelect}
        type="button"
        className={`relative w-full border-none p-0 bg-none cursor-pointer ${selected ? 'grayscale-0' : 'grayscale'}`}
      >
        <div className="isolate w-full hover:shadow-lg transition-all">
          <img
            src={url}
            alt={title}
            className="block bg-[#242020] mix-blend-multiply w-full rounded-2xl h-auto object-cover"
          />
          {count > 1 && (
            <span className="absolute top-0 right-0 bg-white text-black px-3 py-1 rounded-full text-lg font-semibold">
              {count}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

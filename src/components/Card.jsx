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
    <div className="relative inline-block border-none m-2">
      <button onClick={onSelect} className={`relative border-none p-0 bg-none ${selected ? 'grayscale-0' : 'grayscale'}`}>
        <div className="isolate">
          <img
            src={url}
            alt={title}
            className="block bg-[#242020] mix-blend-multiply"
            style={{ display: 'block' }}
          />
        </div>
        {count > 1 && (
          <span className="absolute top-0 right-0 bg-white text-black px-3 py-1 rounded-full text-lg font-semibold">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col text-center bg-linear-to-br from-red-900 via-red-800 to-slate-900 px-6">

      <div className="m-5 flex flex-col items-center justify-center">
        <h1 className="mb-6 text-4xl max-w-200 font-extrabold uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
          It is that <span className="text-red-300">simple.</span>
        </h1>
      </div>

      {/* IMAGE BOTTOM */}
      <div className="flex justify-center mt-auto">
        <Image
          src="/pizza.png"
          alt="pizza"
          width={743}
          height={780}
        />
      </div>

    </div>
  );
}
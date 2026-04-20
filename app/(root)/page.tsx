import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col text-center bg-linear-to-br from-red-900 via-red-800 to-slate-900 px-5">
      
      <div className="mt-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl max-w-200 font-extrabold font-mono uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
          Order your favourites in <span className="text-red-300">minutes.</span>
        </h1>
      </div>

      <div className="mt-20 flex justify-center ">
        <Image
          src="/pizza.png"
          alt="pizza"
          width={750}
          height={750}
        />
      </div>

    </div>
  );
}
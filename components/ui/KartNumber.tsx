"use client"
import { useEffect, useState } from 'react';
import { CountCartFromLocalStorage } from '@/lib/actions';
import { ShoppingCart } from 'lucide-react';

export default function KartNumber(){
    const [nmbr, setNmbr] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            setNmbr(CountCartFromLocalStorage());
        };

        updateCartCount();
        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cart-updated", updateCartCount);

        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cart-updated", updateCartCount);
        };
    }, []);

    return(
    <div className='relative'>
        <ShoppingCart/>
        <div className='flex rounded-full bg-red-500 w-5 h-5 items-center justify-center text-white absolute left-full bottom-full'>
            <b>{nmbr}</b>
        </div>
    </div>
  );
}

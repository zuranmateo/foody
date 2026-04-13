"use client"
import { AddToCart } from '@/lib/actions'
import React, { useState } from 'react'

export default function DishCard({dish}: {dish: any}){

  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);

    try {
      await AddToCart(dish.slug);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <h2>{dish.name}</h2>
        <h2>{dish.category}</h2>
        <div>
            {/**description, price, image, (ingrediants bom js, ti samo naredi plac), preparationTime, isPopular, isAvailable */}
        </div>
        <div>
            <button onClick={handleAddToCart} disabled={loading}>{loading ? "adding..." : "add to cart"}</button>
        </div>
    </div>
  )
}

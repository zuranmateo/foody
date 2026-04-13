"use client"
import { AddToCart } from '@/lib/actions'
import React from 'react'

export default function DishCard({dish}: {dish: any}){
  return (
    <div>
        <h2>{dish.name}</h2>
        <h2>{dish.category}</h2>
        <div>
            {/**description, price, image, (ingrediants bom js, ti samo naredi plac), preparationTime, isPopular, isAvailable */}
        </div>
        <div>
            <button onClick={() => AddToCart(dish.slug)}>Add to cart</button>
        </div>
    </div>
  )
}
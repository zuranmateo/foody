import DishCard from '@/components/cards/DishCard'
import { PIZZA_DISHES_QUERY, POPULAR_DISHES_QUERY } from '@/sanity/lib/query'
import { writeClient } from '@/sanity/lib/write-client'
import React from 'react'

export default async function page(){
    const popDishes = await writeClient.fetch(POPULAR_DISHES_QUERY);
    const pizzaDishes = await writeClient.fetch(PIZZA_DISHES_QUERY);
  return (
    <div className='main'>
        <h1>
            MENU
        </h1>
        <div>
            {/** slika velika od hrane al pa neki, frontend shit :) */}
        </div>
        <div className='shadow-2xl'>
            <h1>
                Popularne jedi
            </h1>
            <div>
                {popDishes?.length > 0 ? (
                    popDishes.map((popDish: any) => (
                        <DishCard key={popDish._id} dish={popDish}/>
                    ))
                ):("ni popularnih jedi")}
            </div>
        </div>
        <div>
            <h1>
                pizze
            </h1>
            <div>
                {pizzaDishes?.length > 0 ? (
                    pizzaDishes.map((pizzaDish: any) => (
                        <DishCard key={pizzaDish._id} dish={pizzaDish}/>
                    ))
                ):("ni pizza jedi")}
            </div>
        </div>
    </div>
  )
}
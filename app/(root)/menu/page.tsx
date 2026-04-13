import DishCard from '@/components/cards/DishCard'
import { POPULAR_DISHES_QUERY } from '@/sanity/lib/query'
import { writeClient } from '@/sanity/lib/write-client'
import React from 'react'

export default async function page(){

    const popDishes = await writeClient.fetch(POPULAR_DISHES_QUERY)
  return (
    <div className='main'>
        <h1>
            MENU
        </h1>
        <div>
            {/** slika velika od hrane al pa neki, frontend shit :) */}
        </div>
        <div>
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
    </div>
  )
}
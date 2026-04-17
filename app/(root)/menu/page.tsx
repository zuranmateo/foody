import { Suspense } from 'react'
import { auth } from '@/auth'
import DishCard from '@/components/cards/DishCard'
import { DishSkeleton } from '@/components/ui/DishSkeleton'
import { CATEGORY_DISHES_QUERY, POPULAR_DISHES_QUERY } from '@/sanity/lib/query'
import { writeClient } from '@/sanity/lib/write-client'
import { SanityLive } from '@/sanity/lib/live'
import Image from 'next/image'

async function PopularDishes({ isLoggedIn }: { isLoggedIn: boolean }) {
  const popDishes = await writeClient.fetch(POPULAR_DISHES_QUERY)
  return (
      <div className="items-center max-w-500 shadow-lg p-7 mx-auto">
      <h1 className="text-5xl font-extrabold uppercase tracking-tight text-red-700 text-center mb-10">
        Popular dishes
      </h1>

      <div className="grid grid-cols-2 gap-5">
        {popDishes?.length > 0 ? (
          popDishes.map((popDish: any) => (
            <DishCard
              key={popDish._id}
              dish={popDish}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <p>Ni popularnih jedi</p>
        )}
      </div>
    </div>
  )
}

async function CategoryDishes({ 
  categorySection, 
  isLoggedIn 
}: { 
  categorySection: any, 
  isLoggedIn: boolean 
}) {
  return (
    <div className="">
      <h1 className="h2">{categorySection.title}</h1>
      <div className="w-100 gap-5 m-2">
        {categorySection.dishes?.length > 0 ? (
          categorySection.dishes.map((dish: any) => (
            <DishCard key={dish._id} dish={dish} isLoggedIn={isLoggedIn}/>
          ))
        ) : (
          <p>{categorySection.empty}</p>
        )}
      </div>
    </div>
  )
}

export default async function page(){
  const session = await auth()
  const isLoggedIn = !!session?.user

  const categories = [
    { title: 'Pizze', value: 'pica', empty: 'Ni pizza jedi' },
    { title: 'Burgerji', value: 'burger', empty: 'Ni burger jedi' },
    { title: 'Testenine', value: 'testenine', empty: 'Ni testenin' },
    { title: 'Žar', value: 'žar', empty: 'Ni žar jedi' },
    { title: 'Ribe', value: 'ribe', empty: 'Ni ribjih jedi' },
    { title: 'Morska hrana', value: 'morska', empty: 'Ni morske hrane' },
    { title: 'Pijače', value: 'drink', empty: 'Ni pijač' },
  ]

  const categorySections = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      dishes: await writeClient.fetch(CATEGORY_DISHES_QUERY, { category: category.value }),
    }))
  )

  return (
    <div className='text-center px-5'>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          background: #f9f9f9;
          margin: 0;
        }
      `}</style>

      <div className="p-20 flex justify-center">  
        <div className="bg-white relative w-800 h-100 rounded-xl overflow-hidden shadow-2xl">
          <Image
            src="benner.png"
            alt="heroBg"
            width="400" 
            height="400" 
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <h1 className="mb-6 text-8xl font-extrabold flex uppercase text-red-700 drop-shadow-lg">
              MENU
            </h1>
            <p className="text-red-300 text-lg drop-shadow-md">
              Delicious food awaits...
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <Suspense fallback={<div>Loading...</div>}>
          <PopularDishes isLoggedIn={isLoggedIn} />
        </Suspense>
      </div>

      {categorySections.map((categorySection) => (
        <div className="section" key={categorySection.value}>
          <Suspense fallback={<div>Loading...</div>}>
            <CategoryDishes categorySection={categorySection} isLoggedIn={isLoggedIn} />
          </Suspense>
        </div>
      ))}

      <SanityLive />
    </div>
  )
}
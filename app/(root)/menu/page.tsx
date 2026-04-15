import { Suspense } from 'react'
import { auth } from '@/auth'
import DishCard from '@/components/cards/DishCard'
import { DishSkeleton } from '@/components/ui/DishSkeleton'
import { CATEGORY_DISHES_QUERY, POPULAR_DISHES_QUERY } from '@/sanity/lib/query'
import { writeClient } from '@/sanity/lib/write-client'
import { SanityLive } from '@/sanity/lib/live'

async function PopularDishes({ isLoggedIn }: { isLoggedIn: boolean }) {
  const popDishes = await writeClient.fetch(POPULAR_DISHES_QUERY)
  return (
    <div>
      <h1 className="">Popularne jedi</h1>
      <div className="">
        {popDishes?.length > 0 ? (
          popDishes.map((popDish: any) => (
            <DishCard key={popDish._id} dish={popDish} isLoggedIn={isLoggedIn}/>
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
      <h1 className="">{categorySection.title}</h1>
      <div className="">
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
    <div className="">
      <div className="">
        <h1 className="">
          MENU
        </h1>
        <div className="">
          {/* Hero image placeholder - add your food image here */}
          <div className="">
            <span className="">Delicious food awaits...</span>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="">
          <DishSkeleton />
          <DishSkeleton />
          <DishSkeleton />
        </div>
      }>
        <PopularDishes isLoggedIn={isLoggedIn} />
      </Suspense>

      {categorySections.map((categorySection) => (
        <Suspense 
          key={categorySection.value}
          fallback={
            <div className="">
              <DishSkeleton />
              <DishSkeleton />
              <DishSkeleton />
            </div>
          }
        >
          <CategoryDishes categorySection={categorySection} isLoggedIn={isLoggedIn} />
        </Suspense>
      ))}
      <SanityLive />
    </div>
  )
}


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
      <h1 className="text-2xl font-bold mb-4">Popularne jedi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="mb-12">
      <h1 className="text-2xl font-bold mb-6">{categorySection.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          MENU
        </h1>
        <div className="h-64 md:h-80 bg-linear-to-r from-muted to-muted-foreground/30 rounded-3xl overflow-hidden mx-auto max-w-4xl shadow-2xl">
          {/* Hero image placeholder - add your food image here */}
          <div className="h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-2xl text-muted-foreground/50">Delicious food awaits...</span>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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


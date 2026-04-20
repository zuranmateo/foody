import { Suspense } from 'react'
import { auth } from '@/auth'
import DishCard from '@/components/cards/DishCard'
import { CATEGORY_DISHES_QUERY, POPULAR_DISHES_QUERY } from '@/sanity/lib/query'
import { writeClient } from '@/sanity/lib/write-client'
import { SanityLive } from '@/sanity/lib/live'
import Image from 'next/image'

type MenuDish = {
  _id: string
  [key: string]: unknown
}

type CategoryConfig = {
  title: string
  value: string
  empty: string
}

type CategorySection = CategoryConfig & {
  dishes: MenuDish[]
}

async function PopularDishes({ isLoggedIn }: { isLoggedIn: boolean }) {
  const popDishes = await writeClient.fetch<MenuDish[]>(POPULAR_DISHES_QUERY)
  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col gap-3 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Crowd favorites
          </p>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-tight text-foreground sm:text-4xl">
        Popular dishes
          </h1>
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">
          The dishes guests keep coming back for.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {popDishes?.length > 0 ? (
          popDishes.map((popDish) => (
            <DishCard
              key={popDish._id}
              dish={popDish}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
            Ni popularnih jedi
          </p>
        )}
      </div>
    </section>
  )
}

async function CategoryDishes({ 
  categorySection, 
  isLoggedIn 
}: { 
  categorySection: CategorySection, 
  isLoggedIn: boolean 
}) {
  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-border/70 pb-4">
        <h2 className="text-2xl font-semibold uppercase tracking-tight text-foreground">
          {categorySection.title}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categorySection.dishes?.length > 0 ? (
          categorySection.dishes.map((dish) => (
            <DishCard key={dish._id} dish={dish} isLoggedIn={isLoggedIn}/>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground md:col-span-2 xl:col-span-3">
            {categorySection.empty}
          </p>
        )}
      </div>
    </section>
  )
}

export default async function page(){
  const session = await auth()
  const isLoggedIn = !!session?.user

  const categories: CategoryConfig[] = [
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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)]">
          <div className="relative flex min-h-80 items-center justify-center px-6 py-12 sm:px-10">
          

            <div className="absolute inset-0 bg-linear-to-br from-red-900 via-red-800 to-slate-900" />
            <div className="relative z-10 flex max-w-3xl flex-col items-center text-center text-white">
              <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/70">
                Fresh every day
              </p>
              <h1 className="mt-4 text-5xl font-extrabold uppercase tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
              MENU
              </h1>
              <p className="mt-4 text-sm text-white/80 drop-shadow-md sm:text-lg">
                Delicious food awaits...
              </p>
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="rounded-3xl border bg-card p-10 text-center text-muted-foreground">Loading...</div>}>
          <PopularDishes isLoggedIn={isLoggedIn} />
        </Suspense>

        {categorySections.map((categorySection) => (
          <Suspense
            key={categorySection.value}
            fallback={<div className="rounded-3xl border bg-card p-10 text-center text-muted-foreground">Loading...</div>}
          >
            <CategoryDishes categorySection={categorySection} isLoggedIn={isLoggedIn} />
          </Suspense>
        ))}

        <SanityLive />
      </div>
    </main>
  )
}

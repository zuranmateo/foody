import { auth } from '@/auth'
import DishCard from '@/components/cards/DishCard'
import { CATEGORY_DISHES_QUERY, POPULAR_DISHES_QUERY } from '@/sanity/lib/query'
import { writeClient } from '@/sanity/lib/write-client'

export default async function page(){
    const session = await auth();
    const popDishes = await writeClient.fetch(POPULAR_DISHES_QUERY);
    const categories = [
        { title: 'pizze', value: 'pica', empty: 'ni pizza jedi' },
        { title: 'burgerji', value: 'burger', empty: 'ni burger jedi' },
        { title: 'testenine', value: 'testenine', empty: 'ni testenin' },
        { title: 'žar', value: 'Ĺľar', empty: 'ni žar jedi' },
        { title: 'ribe', value: 'ribe', empty: 'ni ribjih jedi' },
        { title: 'morska hrana', value: 'morska', empty: 'ni morske hrane' },
        { title: 'pijače', value: 'drink', empty: 'ni pijač' },
    ];
    const categorySections = await Promise.all(
        categories.map(async (category) => ({
            ...category,
            dishes: await writeClient.fetch(CATEGORY_DISHES_QUERY, { category: category.value }),
        }))
    );
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
                        <DishCard key={popDish._id} dish={popDish} isLoggedIn={!!session?.user}/>
                    ))
                ):("ni popularnih jedi")}
            </div>
        </div>
        {categorySections.map((categorySection) => (
            <div key={categorySection.value}>
                <h1>
                    {categorySection.title}
                </h1>
                <div>
                    {categorySection.dishes?.length > 0 ? (
                        categorySection.dishes.map((dish: any) => (
                            <DishCard key={dish._id} dish={dish} isLoggedIn={!!session?.user}/>
                        ))
                    ):(categorySection.empty)}
                </div>
            </div>
        ))}
    </div>
  )
}

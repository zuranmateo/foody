import { defineQuery } from "next-sanity";

export const USER_BY_GITHUB_ID_QUERY = defineQuery(`
   *[_type == "users" && id == $id][0]{
    _id,
    id,
    name,
    email,
    password,
    imageUrl,
   } 
`);

export const CHECK_FOR_EXISTING_USER = defineQuery(`
   *[_type == "users" && email == $email][0]
`);

export const USER_BY_ID_QUERY = defineQuery(`
   *[_type == "users" && _id == $id][0]{
  _id,
  id,
  name,
  surname,
  email,
  password,
  "image": image.asset->url,
  imageUrl,
  _rev,
  _type,
  _createdAt,
  _updatedAt
}
`);

export const USER_BY_EMAIL_QUERY = defineQuery(`
   *[_type == "users" && email == $email][0]{
  _id,
  id,
  name,
  surname,
  email,
  password,
  "image": image.asset->url,
  imageUrl,
  _rev,
  _type,
  _createdAt,
  _updatedAt
}
`);


export const CHECK_FOR_ID_QUERY = defineQuery(`
   *[_type == "users" && id == $generatedId][0]{
      id
   }
`)

export const POPULAR_DISHES_QUERY = defineQuery(`
   *[_type == "dishes" && isPopular == true]{
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      image,
      ingredients[]{
         quantity,
         ingredient->{
            name,
            quantity,
            unit,
            inStock
         }
      },
      category,
      preparationTime,
      isPopular,
      isAvailable,
   }
`)

export const PIZZA_DISHES_QUERY = defineQuery(`
   *[_type == "dishes" && category == "pizza"]{
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      image,
      ingredients[]{
         quantity,
         ingredient->{
            name,
            quantity,
            unit,
            inStock
         }
      },
      category,
      preparationTime,
      isPopular,
      isAvailable,
   }
`)

export const CART_DISHES_QUERY = defineQuery(`
   *[_type == "dishes" && slug.current in $slugs]{
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      image,
      ingredients[]{
         quantity,
         ingredient->{
            name,
            quantity,
            unit,
            inStock
         }
      },
      category,
      preparationTime,
      isPopular,
      isAvailable,
   }
`)

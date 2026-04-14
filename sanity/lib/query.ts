import { defineQuery } from "next-sanity";

export const USER_BY_GITHUB_ID_QUERY = defineQuery(`
   *[_type == "users" && id == $id][0]{
    _id,
    id,
    name,
    email,
    password,
    imageUrl,
    role,
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
  role,
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
  role,
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

export const CATEGORY_DISHES_QUERY = defineQuery(`
   *[_type == "dishes" && category == $category]{
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

export const ORDER_DISHES_QUERY = defineQuery(`
   *[_type == "dishes" && slug.current in $slugs]{
      _id,
      name,
      "slug": slug.current,
      price
   }
`)

export const CHECKOUT_DISHES_QUERY = defineQuery(`
   *[_type == "dishes" && slug.current in $slugs]{
      _id,
      name,
      "slug": slug.current,
      price,
      isAvailable,
      ingredients[] {
         quantity,
         ingredient->{
            _id,
            _rev,
            name,
            quantity,
            unit,
            inStock
         }
      }
   }
`)

export const ORDER_BY_PAYPAL_ORDER_ID_QUERY = defineQuery(`
   *[_type == "orders" && paypalOrderId == $paypalOrderId][0]{
      _id,
      user->{
         _id
      }
   }
`)

export const PROFILE_USER_QUERY = defineQuery(`
   *[_type == "users" && _id == $id][0]{
      _id,
      id,
      name,
      surname,
      email,
      phone,
      address,
      role,
      "image": image.asset->url,
      imageUrl,
      _createdAt
   }
`)

export const USER_ORDERS_QUERY = defineQuery(`
   *[_type == "orders" && user._ref == $id] | order(_createdAt desc){
      _id,
      _createdAt,
      totalPrice,
      status,
      paymentStatus,
      paidAt,
      paypalOrderId,
      items[]{
         quantity,
         dish->{
            _id,
            name,
            "slug": slug.current,
            price
         }
      }
   }
`)

export const ADMIN_ORDERS_QUERY = defineQuery(`
   *[_type == "orders"] | order(status asc, _createdAt desc){
      _id,
      _createdAt,
      totalPrice,
      status,
      paymentStatus,
      paidAt,
      paypalOrderId,
      user->{
         _id,
         name,
         surname,
         email
      },
      items[]{
         quantity,
         dish->{
            _id,
            name,
            "slug": slug.current,
            price
         }
      }
   }
`)

export const ADMIN_DASHBOARD_STATS_QUERY = defineQuery(`
   {
      "totalOrders": count(*[_type == "orders"]),
      "pendingOrders": count(*[_type == "orders" && status == "pending"]),
      "preparingOrders": count(*[_type == "orders" && status == "preparing"]),
      "deliveredOrders": count(*[_type == "orders" && status == "delivered"]),
      "totalUsers": count(*[_type == "users"]),
      "totalIngredients": count(*[_type == "ingredients"]),
      "outOfStockIngredients": count(*[_type == "ingredients" && inStock != true]),
      "revenue": math::sum(*[_type == "orders"].totalPrice)
   }
`)

export const ALL_INGREDIENTS_QUERY = defineQuery(`
   *[_type == "ingredients"] | order(name asc){
      _id,
      name,
      quantity,
      unit,
      inStock
   }
`)

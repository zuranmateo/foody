import { type SchemaTypeDefinition } from 'sanity'
import { ingredients } from './ingredients'
import { users } from './users'
import { dishes } from './dishes'
import { orders } from './orders'
import { reviews } from './reviews'
import { sentEmails } from './sentEmails'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ingredients, users, dishes, orders, reviews, sentEmails],
}

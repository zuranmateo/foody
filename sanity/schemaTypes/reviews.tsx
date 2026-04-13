import { defineType, defineField } from 'sanity'

export const reviews = defineType({
  name: 'reviews',
  title: 'Reviews',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'Uporabnik',
      type: 'reference',
      to: [{ type: 'users' }]
    }),
    defineField({
      name: 'dish',
      title: 'Jed',
      type: 'reference',
      to: [{ type: 'dishes' }]
    }),
    defineField({
      name: 'rating',
      title: 'Ocena',
      type: 'number',
      validation: Rule => Rule.min(1).max(5)
    }),
    defineField({
      name: 'comment',
      title: 'Komentar',
      type: 'text'
    })
  ]
})
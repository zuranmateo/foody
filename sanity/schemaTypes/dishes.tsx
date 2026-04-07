import { defineType, defineField } from 'sanity'

export const dishes = defineType({
  name: 'dishes',
  title: 'Dishes',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Ime jedi',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 }
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      type: 'text'
    }),
    defineField({
      name: 'price',
      title: 'Cena',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'image',
      title: 'Slika',
      type: 'image'
    }),
    defineField({
      name: 'ingredients',
      title: 'Sestavine',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'ingredients' }] }]
    }),
    defineField({
      name: 'preparationTime',
      title: 'Čas priprave (min)',
      type: 'number'
    }),
    defineField({
      name: 'isPopular',
      title: 'Popularna jed',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'isAvailable',
      title: 'Na voljo',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: "name",
    },
  },
})
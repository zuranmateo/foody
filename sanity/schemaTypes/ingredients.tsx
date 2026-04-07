import { defineType, defineField } from 'sanity'

export const ingredients = defineType({
  name: 'ingredients',
  title: 'Ingredients',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Ime sestavine',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'quantity',
      title: 'Količina',
      type: 'number'
    }),
    defineField({
      name: 'unit',
      title: 'Enota',
      type: 'string'
    }),
    defineField({
      name: 'inStock',
      title: 'Na zalogi',
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
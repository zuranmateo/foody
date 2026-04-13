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
      title: 'enota',
      type: 'string',
      options: {
        list: [
          { title: 'miligram', value: 'mg' },
          { title: 'gram', value: 'g' },
          { title: 'kilogram', value: 'kg' },
          { title: 'liter', value: 'l' },
        ]
      }
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
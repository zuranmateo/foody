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
      of: [
        defineField({
          name: 'ingredientItem',
          title: 'Sestavina',
          type: 'object',
          fields: [
            defineField({
              name: 'ingredient',
              title: 'Sestavina',
              type: 'reference',
              to: [{ type: 'ingredients' }],
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'quantity',
              title: 'Potrebna količina',
              type: 'number',
              validation: Rule => Rule.required().min(0)
            })
          ],
          preview: {
            select: {
              title: 'ingredient.name',
              quantity: 'quantity',
              unit: 'ingredient.unit'
            },
            prepare({ title, quantity, unit }) {
              return {
                title: title || 'Sestavina',
                subtitle: quantity !== undefined ? `${quantity} ${unit || ''}`.trim() : 'Brez količine'
              }
            }
          }
        })
      ]
    }),
    defineField({
      name: 'category',
      title: 'Kategorija',
      type: 'string',
      options: {
        list: [
          { title: 'Pica', value: 'pica' },
          { title: 'Burger', value: 'burger' },
          { title: 'Testenine', value: 'testenine' },
          { title: 'Žar', value: 'žar' },
          { title: 'Ribe', value: 'ribe' },
          { title: 'Morska', value: 'morska' },
          { title: 'Pijača', value: 'drink' }
        ]
      }
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

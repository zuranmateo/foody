import { defineType, defineField } from 'sanity'

export const orders = defineType({
  name: 'orders',
  title: 'Orders',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'Uporabnik',
      type: 'reference',
      to: [{ type: 'users' }]
    }),
    defineField({
      name: 'items',
      title: 'Naročene jedi',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'dish',
              title: 'Dish',
              type: 'reference',
              to: [{ type: 'dishes' }]
            }),
            defineField({
              name: 'quantity',
              title: 'Koliko',
              type: 'number'
            })
          ]
          
        }
      ]
    }),
    defineField({
      name: 'totalPrice',
      title: 'Skupna cena',
      type: 'number'
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['pending', 'preparing', 'delivered']
      }
    }),
    defineField({
      name: 'paymentProvider',
      title: 'Payment provider',
      type: 'string',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment status',
      type: 'string',
      options: {
        list: ['completed', 'refunded', 'failed']
      }
    }),
    defineField({
      name: 'paypalOrderId',
      title: 'PayPal order id',
      type: 'string',
    }),
    defineField({
      name: 'paypalCaptureId',
      title: 'PayPal capture id',
      type: 'string',
    }),
    defineField({
      name: 'paidAt',
      title: 'Paid at',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: "_id",
    },
  },
})

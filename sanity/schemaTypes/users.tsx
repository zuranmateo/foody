import { defineType, defineField } from 'sanity'

export const users = defineType({
  name: 'users',
  title: 'Users',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'github id',
      type: 'string',
    }),
    defineField({
      name: 'name',
      title: 'Ime',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'surname',
      title: 'Priimek',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'password',
      title: 'Password (hashed)',
      type: 'string'
    }),
    defineField({
      name: 'phone',
      title: 'Telefonska številka',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Naslov',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Vloga',
      type: 'string',
      options: {
        list: ['user', 'admin']
      },
      initialValue: 'user'
    }),
    defineField({
      name: 'image',
      title: 'Profilna slika',
      type: 'image'
    }),
    defineField({
      name: 'imageUrl',
      title: 'Profilna slika github',
      type: 'string'
    })
  ],
  preview: {
    select: {
      title: 'email'
    }
  }
})

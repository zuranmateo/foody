import { defineField, defineType } from 'sanity'

export const sentEmails = defineType({
  name: 'sentEmails',
  title: 'Sent Emails',
  type: 'document',
  fields: [
    defineField({
      name: 'admin',
      title: 'Admin',
      type: 'reference',
      to: [{ type: 'users' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'users' }],
    }),
    defineField({
      name: 'to',
      title: 'To',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['sent', 'failed'],
      },
      initialValue: 'sent',
    }),
    defineField({
      name: 'resendId',
      title: 'Resend ID',
      type: 'string',
    }),
    defineField({
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'subject',
      subtitle: 'to',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Sent email',
        subtitle: subtitle || 'Unknown recipient',
      }
    },
  },
})

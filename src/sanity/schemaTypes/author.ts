import { defineField, defineType } from 'sanity';

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(600),
    }),
    defineField({ name: 'email', title: 'Email', type: 'email' }),
    defineField({ name: 'twitter', title: 'X profile URL', type: 'url' }),
    defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url' }),
    defineField({ name: 'initials', title: 'Initials', type: 'string', hidden: true }),
    defineField({ name: 'avatarColor', title: 'Avatar gradient classes', type: 'string', hidden: true }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' },
  },
});

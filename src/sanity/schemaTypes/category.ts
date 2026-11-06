import { defineField, defineType } from 'sanity';

export const categoryType = defineType({
  name: 'category',
  title: 'Desk / category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'kicker', title: 'Kicker', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'accent', title: 'Accent hex', type: 'string', initialValue: '#c9f74a' }),
    defineField({ name: 'order', title: 'Sort order', type: 'number' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'kicker' },
  },
});

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'mictech-local';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';

export default defineConfig({
  name: 'mictech-newsroom',
  title: 'MIC TECH Newsroom',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('MIC TECH Newsroom')
          .items([
            S.listItem()
              .title('Published')
              .child(
                S.documentList()
                  .title('Published stories')
                  .filter('_type == "article" && status == "published"')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
              ),
            S.listItem()
              .title('In review')
              .child(
                S.documentList()
                  .title('Awaiting review')
                  .filter('_type == "article" && status == "review"'),
              ),
            S.listItem()
              .title('Scheduled')
              .child(
                S.documentList()
                  .title('Scheduled stories')
                  .filter('_type == "article" && status == "scheduled"')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'asc' }]),
              ),
            S.listItem()
              .title('Drafts')
              .child(
                S.documentList()
                  .title('Drafts')
                  .filter('_type == "article" && status == "draft"'),
              ),
            S.divider(),
            S.documentTypeListItem('article').title('All articles'),
            S.documentTypeListItem('author').title('Authors'),
            S.documentTypeListItem('category').title('Desks'),
          ]),
    }),
  ],
  document: {
    actions: (actions) => actions,
  },
});

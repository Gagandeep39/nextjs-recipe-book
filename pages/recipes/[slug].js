import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export const getStaticPaths = async () => {
  const res = await client.getEntries({ content_type: 'recipe' });

  // Generate data for all pths
  const paths = res.items.map((item) => {
    return {
      params: { slug: item.fields.slug },
    };
  });
  return {
    paths,
    fallback: false,
  };
};

export async function getStaticProps({ params }) {
  const { items } = await client.getEntries({
    content_type: 'recipe',
    // Slug is unique in server so we are fetching by slug name
    // Server doesnt know field is unique so it will send array in res
    'fields.slug': params.slug,
  });
  console.log(items);
  return {
    props: {
      recipes: items[0],
    },
  };
}

export default function RecipeDetails() {
  return <div>Recipe Details</div>;
}

import { createClient } from 'contentful';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

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
      recipe: items[0],
    },
    revalidate: 10, // App fetches conentful data once in every 10 sec
  };
}

export default function RecipeDetails({ recipe }) {
  const {
    featuredImage,
    title,
    cookingTime,
    ingredients,
    method,
  } = recipe.fields;
  return (
    <div>
      <div className="banner">
        <Image
          src={`https:${featuredImage.fields.file.url}`}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
        />
        <h2>{title}</h2>
      </div>
      <div className="info">
        <p>Take about {cookingTime} mins to cook. </p>
        <h3> Ingredients: </h3>
        {ingredients.map((ingredient) => (
          <span key={ingredient}> {ingredient} </span>
        ))}
      </div>

      <div className="method">
        <h3>Method: </h3>
        <div> {documentToReactComponents(method)} </div>
      </div>
      <style jsx>{`
        h2,
        h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ', ';
        }
        .info span:last-child::after {
          content: '.';
        }
      `}</style>
    </div>
  );
}

function RecipeCard({ recipe }) {
  if (!recipe) return null;

  return (
    <article>
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      <small>Kategoria: {recipe.category}</small>
    </article>
  );
}

export default RecipeCard;
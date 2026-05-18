import { useRecipes } from '@/hooks/useRecipes';

function Home() {
  const { recipes, loading, error } = useRecipes();

  if (loading) {
    return <p>Ladowanie przepisow...</p>;
  }

  if (error) {
    return <p>Blad: {error}</p>;
  }

  return (
    <main>
      <h1>CookBook</h1>
      <p>Twoja osobista ksiazka kucharska.</p>

      <section>
        <h2>Przepisy</h2>
        {recipes.length === 0 ? (
          <p>Brak przepisow. Dodaj pierwszy!</p>
        ) : (
          <ul>
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <strong>{recipe.title}</strong> — {recipe.category}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Home;
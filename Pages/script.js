async function fetchArticles() {
  try {
    // Requête pour récupérer les articles
    const res = await fetch('http://localhost:8080/articles');
    const articles = await res.json();

    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = ''; // Vider le contenu existant

    // Parcourir les articles et les afficher
    articles.forEach(article => {
      const articleElement = document.createElement('div');
      articleElement.classList.add('article'); // Ajout de la classe article pour chaque élément

      // Création de l'image et du contenu de l'article
      const imgElement = document.createElement('img');
      imgElement.src = `http://localhost:8080/images/${article.image}`; 
      articleElement.innerHTML = `
        <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
        <p>Publié par ${article.author} le ${new Date(article.date_post).toLocaleDateString()}</p>
      `;

      // Ajouter l'image avant le texte
      articleElement.insertBefore(imgElement, articleElement.firstChild);
      articlesList.appendChild(articleElement);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles', error);
  }
}

async function fetchArticleById(articleId) {
  try {
    const res = await fetch(`http://localhost:8080/articles/${articleId}`);
    if (!res.ok) {
      throw new Error('Erreur lors de la récupération de l\'article');
    }

    const article = await res.json();
    const articleDetail = document.getElementById('articleDetail');
   articleDetail.innerHTML = '';  // Vider le contenu existant

    // Afficher les détails de l'article
    articleDetail.innerHTML = `
      <h3>${article.title}</h3>
      <p>Publié par ${article.author} le ${new Date(article.date_post).toLocaleDateString()}</p>
      <img src="http://localhost:8080/images/${article.image}" alt="${article.title}">
      <p>${article.content}</p>
      <a href="articles.html" class="back-link">Retour à la liste des articles</a>
    `;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article', error);
    document.getElementById('articleDetail').innerHTML = '<p>Erreur lors de la récupération de l\'article. Veuillez réessayer plus tard.</p>';
  }
}
function initPage() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id'); // Récupérer l'ID de l'article depuis l'URL

  if (articleId) {
    fetchArticleById(articleId); // Appeler la fonction pour afficher l'article
  } else {
    document.getElementById('articleDetail').innerHTML = '<p>ID de l\'article manquant dans l\'URL.</p>';
  }
}

// Charger la page avec les détails de l'article
document.addEventListener('DOMContentLoaded', initPage);

// Récupérer les articles lorsque la page se charge
document.addEventListener('DOMContentLoaded', fetchArticles);
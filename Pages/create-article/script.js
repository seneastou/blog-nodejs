document
        .getElementById("createArticleForm")
        .addEventListener("submit", async function (event) {
          event.preventDefault(); // Empêche le rechargement de la page

          // Récupérer les données du formulaire
          const form = document.getElementById("createArticleForm");
          const formData = new FormData(form); // Utilisation de FormData pour gérer les fichiers
          formData.append("title", document.getElementById("title").value);
          formData.append("content", document.getElementById("content").value);
          formData.append("author", document.getElementById("author").value);
          formData.append(
            "image",
            document.getElementById("image").files[0].name
          ); // Ajout de l'image
          const title = document.getElementById("title").value;
          const content = document.getElementById("content").value;
          const author = document.getElementById("author").value;
          const image = document.getElementById("image").files[0].name; // Ajout de l'image
          try {
            const res = await fetch("http://localhost:8080/articles", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: title,
                content: content,
                author: author,
                image: image,
              }),
            });

            if (res.ok) {
              alert("Article créé avec succès !");
              window.location.href = "../article/articles.html"; // Redirection vers la liste des articles
            } else {
              const errorData = await res.text();
              alert("Erreur : " + errorData);
            }
          } catch (error) {
            console.error("Erreur lors de la création de l'article:", error);
            alert("Erreur lors de la création de l'article.");
          }
        });
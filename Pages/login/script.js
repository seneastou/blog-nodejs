document
        .getElementById("loginForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();
          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;

          try {
            const res = await fetch("http://localhost:8080/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
              alert("Connexion réussie");
              window.location.href = "../article/articles.html"; // Rediriger vers la page des articles
            } else {
              alert("Erreur de connexion");
            }
          } catch (error) {
            console.error(error);
          }
        });
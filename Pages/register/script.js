document
        .getElementById("registerForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();
          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;
          const username = document.getElementById("username").value;

          try {
            const res = await fetch("http://localhost:8080/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, username }),
            });

            if (res.ok) {
              alert("Inscription réussie");
              window.location.href = "../login/index.html"; // Rediriger vers la page de connexion
            } else {
              alert("Erreur lors de l'inscription");
            }
          } catch (error) {
            console.error(error);
          }
        });
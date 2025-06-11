document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o comportamento padrão de submit

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const loginError = document.getElementById("loginError");

    // Oculta qualquer erro anterior
    loginError.classList.add("d-none");
    loginError.innerText = "";

    const loginData = { email, password };

    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Usuário ou senha inválidos.");
            } else {
                throw new Error("Erro no login. Tente novamente.");
            }
        }
        return response.json(); // Lê o JSON com os dados do usuário
    })
    .then(user => {
        localStorage.setItem("userId", user.id); // Salva o ID no localStorage
        window.location.href = "lembrae.html"; // Redireciona após sucesso
    })
    .catch(error => {
        console.error('Erro no login:', error);
        loginError.classList.remove("d-none");
        loginError.innerText = error.message;
    });
});

document.getElementById("backToRegister").addEventListener("click", function () {
    window.location.href = "register.html"; // Redireciona para a página de registro
});

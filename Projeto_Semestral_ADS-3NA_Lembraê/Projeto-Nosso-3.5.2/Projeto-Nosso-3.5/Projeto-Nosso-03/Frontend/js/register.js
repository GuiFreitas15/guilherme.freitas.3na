document.getElementById("registerForm").addEventListener("submit", function(event) {
	event.preventDefault(); // sempre previne o comportamento padrão
  
	const nome = document.getElementById("nome");
	const email = document.getElementById("email");
	const senha = document.getElementById("password");
  
	const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
	const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  
	let formValido = true;
  
	// Validação do nome
	if (nome.value.trim() === "" || !nomeRegex.test(nome.value.trim())) {
	  nome.classList.add("is-invalid");
	  formValido = false;
	} else {
	  nome.classList.remove("is-invalid");
	}
  
	// Validação do e-mail
	if (!emailRegex.test(email.value.trim())) {
	  email.classList.add("is-invalid");
	  formValido = false;
	} else {
	  email.classList.remove("is-invalid");
	}
  
	// Validação da senha
	if (senha.value.trim().length < 8) {
	  senha.classList.add("is-invalid");
	  formValido = false;
	} else {
	  senha.classList.remove("is-invalid");
	}
  
	// Se o formulário for inválido, para aqui
	if (!formValido) return;
  
	// Se chegou aqui, form está válido, faz o envio
	const userData = { 
	  nome: nome.value.trim(), 
	  email: email.value.trim(), 
	  password: senha.value 
	};
  
	fetch("http://localhost:8080/auth/register", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify(userData)
	})
	.then(response => {
	  if (response.ok) {
		window.location.href = "index.html";
	  }
	})
	.catch(error => {
	  console.error("Erro:", error);
	  alert("Erro ao registrar usuário.");
	});
  });


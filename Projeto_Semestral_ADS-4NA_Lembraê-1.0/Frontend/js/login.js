
document.addEventListener("DOMContentLoaded", () => {

  /*
  |----------------------------------------------------------------
  | 1. LÓGICA DO MODO ESCURO (GLOBAL)
  | (Garante que o tema funcione em todas as páginas)
  |----------------------------------------------------------------
  */
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Função para aplicar o tema salvo
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      if(themeToggle) themeToggle.checked = true;
    } else {
      body.classList.remove('dark-mode');
      if(themeToggle) themeToggle.checked = false;
    }
  };

  // Carrega o tema salvo no localStorage ou usa 'light' como padrão
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  // Adiciona o listener para o clique no botão (se ele existir na página)
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      // Salva a preferência no localStorage
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }

  /*
  |----------------------------------------------------------------
  | 2. LÓGICA DE VALIDAÇÃO DO FORMULÁRIO DE LOGIN
  |----------------------------------------------------------------
  */

  const loginForm = document.getElementById("loginForm");
  
  // "Guard Clause" - Se não houver formulário de login nesta página,
  // o script para aqui e não tenta executar o resto.
  if (!loginForm) {
      return;
  }

  // Se o formulário existe, pegue os campos
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const cardWrapper = document.querySelector(".card-wrapper");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio padrão
    
    clearAllErrors(); // Limpa erros antigos
    let isValid = true;

    const email = emailField.value.trim();
    const password = passwordField.value.trim();
    
    // Regex para validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Validação de Frontend (Campos Vazios / Formato)
    
    // Valida E-mail
    if (email === "") {
      showError('email', 'O e-mail é obrigatório.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError('email', 'Por favor, insira um e-mail válido.');
      isValid = false;
    }

    // Valida Senha (Vazia OU Muito Curta)
    if (password === "") {
      showError('password', 'A senha é obrigatória.');
      isValid = false;
    } else if (password.length < 8) { // <-- ATUALIZAÇÃO PREMIUM
      showError('password', 'A senha deve ter no mínimo 8 caracteres.');
      isValid = false;
    }

    // 2. Se a validação do frontend falhar, ative o "shake" e pare
    if (!isValid) {
      cardWrapper.classList.add('shake-error');
      setTimeout(() => cardWrapper.classList.remove('shake-error'), 600); // 600ms = 0.6s
      return;
    }

    /*
    |----------------------------------------------------------------
    | 3. COMUNICAÇÃO COM O BACKEND (Seu código, aprimorado)
    |----------------------------------------------------------------
    */
    const backendURL = "http://localhost:4000";
    const loginData = { email, password };

    try {
      const response = await fetch(`${backendURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      // Se a resposta NÃO for OK (Erro 401, 500, etc.)
      if (!response.ok) {
        // Pega a mensagem de erro do backend (ex: "Usuário ou senha inválidos.")
        const errorMessage = data.message || "E-mail ou senha inválidos.";
        
        // MOSTRA o erro de forma "Premium"
        showError('password', errorMessage); // Mostra o erro de login no campo de senha
        
        // ATIVA o shake
        cardWrapper.classList.add('shake-error');
        setTimeout(() => cardWrapper.classList.remove('shake-error'), 600);
        
        throw new Error(errorMessage); // Para a execução
      }
      
      // SUCESSO!
      console.log("Login bem-sucedido!", data);
      
      // Salva os dados no localStorage (como no seu script original)
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userCreated", data.user.data_criacao);
      localStorage.setItem("userBirth", data.user.data_nascimento);
      
      // Redireciona para a página principal do app
      window.location.href = "lembrae.html";

    } catch (error) {
      // O 'console.error' só vai mostrar o erro no console, não para o usuário
      // O usuário já viu o erro na tela (graças ao 'showError')
      console.error("❌ Erro ao fazer login:", error.message);
    }
  });

  /*
  |----------------------------------------------------------------
  | 4. FUNÇÕES AUXILIARES (Helpers)
  | (Necessárias para a validação premium)
  |----------------------------------------------------------------
  */
  
  /**
   * Mostra uma mensagem de erro para um campo específico.
   */
  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    // Assume que seu HTML tem 'email-error' e 'password-error'
    const errorContainer = document.getElementById(fieldId + "-error");
    
    if (field && errorContainer) {
      field.classList.add('is-invalid'); // Borda vermelha
      errorContainer.textContent = message; // Texto do erro
      errorContainer.classList.add('show'); // Animação de entrada
    }
  }

  /**
   * Limpa todas as mensagens de erro do formulário.
   */
  function clearAllErrors() {
    // Remove bordas vermelhas
    document.querySelectorAll('.form-control').forEach((input) => {
      input.classList.remove('is-invalid');
    });
    
    // Esconde textos de erro
    document.querySelectorAll('.invalid-feedback').forEach((feedback) => {
      feedback.classList.remove('show');
      feedback.textContent = '';
    });
    
    // Para a animação de shake
    if (cardWrapper) {
        cardWrapper.classList.remove('shake-error');
    }
  }

}); // Fim do 'DOMContentLoaded'
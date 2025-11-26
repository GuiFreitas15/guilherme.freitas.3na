document.addEventListener("DOMContentLoaded", () => {
    
    /*
    |----------------------------------------------------------------
    | 1. LÓGICA DO MODO ESCURO (GLOBAL)
    | (Mantido do seu código original)
    |----------------------------------------------------------------
    */
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if(themeToggle) themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            if(themeToggle) themeToggle.checked = false;
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    /*
    |----------------------------------------------------------------
    | 2. LÓGICA DO FORMULÁRIO DE REGISTRO
    |----------------------------------------------------------------
    */
	const form = document.getElementById("registerForm");
    
    // "Guard Clause" - Se não houver formulário de registro, para aqui.
    if (!form) {
        return; 
    }

    // --- SELEÇÃO DE ELEMENTOS (ATUALIZADA) ---
    // (Adicionados os campos que faltavam no seu JS)
    const nameInput = document.getElementById("nome");
    const dataNascInput = document.getElementById("datanasc"); // <--- ADICIONADO
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const palavraInput = document.getElementById("palavra"); // <--- ADICIONADO
    const cardWrapper = document.querySelector(".card-wrapper");
  
    /*
    |----------------------------------------------------------------
    | 3. LÓGICA DE UI (MOSTRAR/OCULTAR SENHA)
    | (Nova seção "Premium" adicionada conforme seu pedido)
    |----------------------------------------------------------------
    */

    // --- REQUISIÇÃO: Torna a Palavra Chave secreta ---
    palavraInput.type = 'password'; 

    // --- REQUISIÇÃO: Adiciona ícones de visibilidade ---

    // 1. Injeta o CSS para os ícones
    const style = document.createElement('style');
    style.innerHTML = `
        .password-toggle-icon {
            position: absolute;
            top: 43px; 
            right: 15px;
            cursor: pointer;
            color: #6c757d;
            user-select: none;
            z-index: 3;
        }
    `;
    document.head.appendChild(style);

    // 2. Função auxiliar para criar os ícones
    const createPasswordToggle = (inputElement) => {
        const toggleIcon = document.createElement('span');
        toggleIcon.classList.add('password-toggle-icon');
        toggleIcon.innerHTML = '👁️'; // Ícone visível

        // Adiciona o ícone ao lado do input
        inputElement.parentNode.appendChild(toggleIcon);

        // Adiciona o evento de clique
        toggleIcon.addEventListener('click', () => {
            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                toggleIcon.innerHTML = '🙈'; // Ícone oculto
            } else {
                inputElement.type = 'password';
                toggleIcon.innerHTML = '👁️'; // Ícone visível
            }
        });
    };

    // 3. Aplica a função aos dois campos
    createPasswordToggle(passwordInput);
    createPasswordToggle(palavraInput);


    /*
    |----------------------------------------------------------------
    | 4. LÓGICA DE SUBMISSÃO E VALIDAÇÃO
    | (Seção atualizada com suas requisições)
    |----------------------------------------------------------------
    */
	form.addEventListener("submit", async (e) => {
	    e.preventDefault(); 

        clearAllErrors(); 
        let isValid = true; 

        // Pega os valores "limpos"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        const nameValue = nameInput.value.trim();
        const dataNascValue = dataNascInput.value.trim(); // <--- ADICIONADO
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        const palavraValue = palavraInput.value.trim(); // <--- ADICIONADO

        // 1. Validação de Frontend (Campos Vazios / Formato)
        // --- REQUISIÇÃO: Validação de TODOS os campos ---

        // Valida Nome
        if (nameValue === '') {
            showError(nameInput, 'O campo Nome é obrigatório.');
            isValid = false;
        }

        // Valida Data de Nascimento
        if (dataNascValue === '') {
            showError(dataNascInput, 'O campo Data de Nascimento é obrigatório.');
            isValid = false;
        }
        // (Validação extra "premium": não permite data futura)
        else if (new Date(dataNascValue) > new Date()) {
            showError(dataNascInput, 'A data não pode ser no futuro.');
            isValid = false;
        }
        
        // Valida E-mail
        if (emailValue === '') {
            showError(emailInput, 'O campo E-mail é obrigatório.');
            isValid = false;
        } else if (!emailRegex.test(emailValue)) {
            showError(emailInput, 'Por favor, insira um e-mail válido.');
            isValid = false;
        }


        // Valida Senha Forte
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (passwordValue === '') {
            showError(passwordInput, 'O campo Senha é obrigatório.');
            isValid = false;
        } else if (!strongRegex.test(passwordValue)) {
            showError(
                passwordInput,
                'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.'
            );
            isValid = false;
        }

        // Valida Palavra Chave
        if (palavraValue === '') {
            showError(palavraInput, 'O campo Palavra Chave é obrigatório.');
            isValid = false;
        }
        
        // 2. Se a validação do frontend falhar...
        if (!isValid) {
            
            // --- REQUISIÇÃO: Scroll ativo para o primeiro erro ---
            const firstInvalidField = form.querySelector('.is-invalid');
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                firstInvalidField.focus(); // Foca no campo
            }
            
            // Animação de "shake" (do seu código original)
            cardWrapper.classList.add('shake-error');
            setTimeout(() => {
                cardWrapper.classList.remove('shake-error');
            }, 600); 
            return; 
        }

        /*
        |----------------------------------------------------------------
        | 5. COMUNICAÇÃO COM O BACKEND
        | (Atualizado para enviar TODOS os campos)
        |----------------------------------------------------------------
        */
	    const backendURL = "http://localhost:4000";
  
	    try {
            // Prepara os dados para enviar
            const dataToSend = {
                name: nameValue,
                data_nascimento: `${dataNascValue}T00:00:00`, 
                email: emailValue,
                password: passwordValue,
                palavra_chave: palavraValue
            };

		    const response = await fetch(`${backendURL}/auth/register`, {
		        method: "POST",
		        headers: { "Content-Type": "application/json" },
		        body: JSON.stringify(dataToSend), // Envia todos os dados
		    });
  
		    const data = await response.json();
  
		    if (!response.ok) {
                // Erro vindo do Backend (ex: email já existe)
                
                // Tenta ser inteligente: se o erro for de email, mostra no email
                if (data.message && data.message.toLowerCase().includes('email')) {
                    showError(emailInput, data.message);
                } else {
                    // Erro genérico (mostra no primeiro campo)
                    showError(nameInput, data.message || "Falha no cadastro");
                }
                
                // ATIVA o shake (do seu código original)
                cardWrapper.classList.add('shake-error');
                setTimeout(() => cardWrapper.classList.remove('shake-error'), 600);

                throw new Error(data.message || "Falha no cadastro");
            }
  
		    // --- AVISO DE SUCESSO PREMIUM ---
            // (Mantido do seu código original)
            const formParent = form.parentElement; 
            form.style.display = 'none'; 

            const successMessage = document.createElement('div');
            successMessage.style.textAlign = 'center';

            const isDarkMode = document.body.classList.contains('dark-mode');
            const titleColor = isDarkMode ? '#ffffff' : '#1a1a2e';
            const textColor = isDarkMode ? '#E6F0FF' : '#555';
            const iconColor = isDarkMode ? '#4D94FF' : '#0066FF'; 

            successMessage.innerHTML = `
                <h3 style="color: ${iconColor}; font-weight: 600; margin-top: 20px; font-size: 48px;">✅</h3>
                <h4 style="color: ${titleColor};" class="card-title">Cadastro Concluído!</h4>
                <p style="color: ${textColor};">Seja bem-vindo(a). Redirecionando para o login...</p>
            `;
            
            formParent.appendChild(successMessage);

            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);

	    } catch (error) {
		    console.error("❌ Erro ao cadastrar:", error.message);
	    }
	});

    /*
    |----------------------------------------------------------------
    | 6. FUNÇÕES AUXILIARES (Helpers)
    | (Atualizadas para serem mais robustas)
    |----------------------------------------------------------------
    */

    /**
     * Mostra uma mensagem de erro para um campo específico.
     * (Versão ATUALIZADA que não depende de IDs de erro, 
     * consertando o bug do seu HTML onde IDs estavam repetidos)
     */
    function showError(inputElement, message) {
        // Encontra o .invalid-feedback que é o próximo irmão do input
        const errorContainer = inputElement.nextElementSibling;
        
        if (inputElement && errorContainer) {
            inputElement.classList.add('is-invalid'); // Borda vermelha
            errorContainer.textContent = message; // Texto do erro
            errorContainer.classList.add('show'); // Animação de entrada
        }
    }

    /**
     * Limpa todas as mensagens de erro do formulário.
     * (Atualizado para corresponder ao novo showError)
     */
    function clearAllErrors() {
        document.querySelectorAll('.form-control').forEach((input) => {
            input.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.invalid-feedback').forEach((feedback) => {
            feedback.classList.remove('show');
            feedback.textContent = '';
        });
        
        if (cardWrapper) {
            cardWrapper.classList.remove('shake-error');
        }
    }

});
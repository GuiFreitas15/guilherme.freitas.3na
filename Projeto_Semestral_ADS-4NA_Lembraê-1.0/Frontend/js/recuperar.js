document.addEventListener("DOMContentLoaded", () => {

    /* --------------------------------------------------------------
     1. DARK MODE GLOBAL
    -------------------------------------------------------------- */
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
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
    
    /* --------------------------------------------------------------
     2. FORM DE RECUPERAÇÃO
    -------------------------------------------------------------- */
    const form = document.getElementById("recuperaForm");
    if (!form) return;
    
    const emailInput = document.getElementById("email");
    const dataNascInput = document.getElementById("datanasc");
    const palavraInput = document.getElementById("palavra");
    const cardWrapper = document.querySelector(".card-wrapper");
    
    /* --------------------------------------------------------------
     3. MOSTRAR/OCULTAR PALAVRA CHAVE
    -------------------------------------------------------------- */
    const style = document.createElement('style');
    style.innerHTML = `
        .password-toggle-icon {
            position: absolute;
            top: 43px;
            right: 15px;
            cursor: pointer;
            user-select: none;
            z-index: 3;
            color: #6c757d;
            transition: color .3s;
        }
        body.dark-mode .password-toggle-icon {
            color: #aaa;
        }
    `;
    document.head.appendChild(style);
    
    const createPasswordToggle = (inputElement) => {
        const toggleIcon = document.createElement('span');
        toggleIcon.classList.add('password-toggle-icon');
        toggleIcon.innerHTML = '👁️';
    
        inputElement.parentNode.appendChild(toggleIcon);
    
        toggleIcon.addEventListener('click', () => {
            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                toggleIcon.innerHTML = '🙈';
            } else {
                inputElement.type = 'password';
                toggleIcon.innerHTML = '👁️';
            }
        });
    };
    
    createPasswordToggle(palavraInput);
    
    /* --------------------------------------------------------------
     4. ENVIO DO FORM
    -------------------------------------------------------------- */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        clearAllErrors();
        let isValid = true;
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        const emailValue = emailInput.value.trim();
        const dataNascValue = dataNascInput.value.trim();
        const palavraValue = palavraInput.value.trim();
    
        /* VALIDAR CAMPOS */
        if (emailValue === '') {
            showError(emailInput, 'O campo E-mail é obrigatório.');
            isValid = false;
        } else if (!emailRegex.test(emailValue)) {
            showError(emailInput, 'Por favor, insira um e-mail válido.');
            isValid = false;
        }
    
        if (dataNascValue === '') {
            showError(dataNascInput, 'O campo Data de Nascimento é obrigatório.');
            isValid = false;
        }
    
        if (palavraValue === '') {
            showError(palavraInput, 'O campo Palavra Chave é obrigatório.');
            isValid = false;
        }
    
        if (!isValid) {
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
    
            cardWrapper.classList.add('shake-error');
            setTimeout(() => cardWrapper.classList.remove('shake-error'), 600);
            return;
        }
    
        /* ----------------------------------------------------------
         5. CHAMADA AO BACKEND
        ---------------------------------------------------------- */
        const backendURL = "http://localhost:4000";
    
        try {
            const dataToSend = {
                email: emailValue,
                data_nascimento: dataNascValue,
                palavra_chave: palavraValue,
            };
    
            const response = await fetch(`${backendURL}/recovery/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                showError(
                    emailInput,
                    data.message || "Os dados informados não conferem."
                );
    
                cardWrapper.classList.add("shake-error");
                setTimeout(() => cardWrapper.classList.remove("shake-error"), 600);
    
                throw new Error(data.message);
            }
    
            /* SUCESSO */
            localStorage.setItem("userEmailForRecovery", emailValue);
    
            form.style.display = "none";
            const msg = document.createElement("div");
            msg.style.textAlign = "center";
    
            const isDark = document.body.classList.contains("dark-mode");
            const textColor = isDark ? "#E6F0FF" : "#555";
            const iconColor = isDark ? "#4D94FF" : "#0066FF";
    
            msg.innerHTML = `
                <h3 style="color:${iconColor}; font-weight:600; margin-top:20px; font-size:48px;">✅</h3>
                <h4 style="color:${isDark ? "#fff" : "#1a1a2e"}" class="card-title">
                    Identidade Verificada!
                </h4>
                <p style="color:${textColor};">
                    Você será redirecionado para criar uma nova senha...
                </p>
            `;
    
            form.parentElement.appendChild(msg);
    
            setTimeout(() => {
                window.location.href = "reset.html";
            }, 3000);
    
        } catch (err) {
            console.error("❌ Erro ao verificar:", err.message);
        }
    });
    
    /* --------------------------------------------------------------
     6. FUNÇÕES AUXILIARES
    -------------------------------------------------------------- */
    function showError(inputElement, message) {
        const errorContainer = inputElement.nextElementSibling;
    
        if (inputElement && errorContainer) {
            inputElement.classList.add('is-invalid');
            errorContainer.textContent = message;
            errorContainer.classList.add('show');
        }
    }
    
    function clearAllErrors() {
        document.querySelectorAll('.form-control').forEach((input) => {
            input.classList.remove('is-invalid');
        });
    
        document.querySelectorAll('.invalid-feedback').forEach((fb) => {
            fb.classList.remove('show');
            fb.textContent = '';
        });
    
        if (cardWrapper) {
            cardWrapper.classList.remove('shake-error');
        }
    }
    
    });
document.addEventListener("DOMContentLoaded", () => {

    /* --------------------------------------------------------------
     1. DARK MODE
    ----------------
    ---------------------------------------------- */
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    
    const applyTheme = (theme) => {
        if (theme === "dark") {
            body.classList.add("dark-mode");
            if (themeToggle) themeToggle.checked = true;
        } else {
            body.classList.remove("dark-mode");
            if (themeToggle) themeToggle.checked = false;
        }
    };
    
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener("change", () => {
            const newTheme = themeToggle.checked ? "dark" : "light";
            localStorage.setItem("theme", newTheme);
            applyTheme(newTheme);
        });
    }
    
    
    /* --------------------------------------------------------------
     2. FORM DE RESET
    -------------------------------------------------------------- */
    const form = document.getElementById("resetForm");
    if (!form) return;
    
    const newPassInput = document.getElementById("newPassword");
    const confirmInput = document.getElementById("confirmPassword");
    const cardWrapper = document.querySelector(".card-wrapper");
    
    /* --------------------------------------------------------------
     3. MOSTRAR / ESCONDER SENHA
    -------------------------------------------------------------- */
    const style = document.createElement("style");
    style.innerHTML = `
        .password-toggle-icon {
            position: absolute;
            top: 41px;
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
        const toggleIcon = document.createElement("span");
        toggleIcon.classList.add("password-toggle-icon");
        toggleIcon.innerHTML = "👁️";
    
        inputElement.parentNode.appendChild(toggleIcon);
    
        toggleIcon.addEventListener("click", () => {
            if (inputElement.type === "password") {
                inputElement.type = "text";
                toggleIcon.innerHTML = "🙈";
            } else {
                inputElement.type = "password";
                toggleIcon.innerHTML = "👁️";
            }
        });
    };
    
    createPasswordToggle(newPassInput);
    createPasswordToggle(confirmInput);
    
    
    /* --------------------------------------------------------------
     4. ENVIO DO FORM
    -------------------------------------------------------------- */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
    
        clearErrors();
        let isValid = true;
    
        const newPassValue = newPassInput.value.trim();
        const confirmValue = confirmInput.value.trim();
    
        // Validação
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!strongRegex.test(newPassValue)) {
            showError(
                newPassInput, 
                "A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos."
            );
            isValid = false;
        }
    
        if (confirmValue !== newPassValue) {
            showError(confirmInput, "As senhas não coincidem.");
            isValid = false;
        }
    
        if (!isValid) {
            cardWrapper.classList.add("shake-error");
            setTimeout(() => cardWrapper.classList.remove("shake-error"), 600);
            return;
        }
    
        // Email salvo no primeiro passo
        const email = localStorage.getItem("userEmailForRecovery");
        if (!email) {
            alert("Erro interno. Nenhum email em recuperação.");
            return;
        }
    
        const backendURL = "http://localhost:4000";
    
        try {
            const response = await fetch(`${backendURL}/recovery/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    newPassword: newPassValue,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                showError(newPassInput, data.message || "Erro ao redefinir senha.");
                throw new Error(data.message);
            }
    
            // Sucesso: mostrar animação
            form.style.display = "none";
    
            const msg = document.createElement("div");
            msg.style.textAlign = "center";
    
            const isDark = document.body.classList.contains("dark-mode");
            const textColor = isDark ? "#E6F0FF" : "#555";
            const iconColor = isDark ? "#4D94FF" : "#0066FF";
    
            msg.innerHTML = `
                <h3 style="color:${iconColor}; font-size:48px; margin-top:20px;">🔒</h3>
                <h4 style="color:${isDark ? "#fff" : "#1a1a2e"};">Senha Alterada!</h4>
                <p style="color:${textColor};">Redirecionando para o login...</p>
            `;
    
            form.parentElement.appendChild(msg);
    
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2500);
    
        } catch (err) {
            console.error("❌ Erro:", err.message);
        }
    });
    
    
    /* --------------------------------------------------------------
     5. FUNÇÕES AUXILIARES
    -------------------------------------------------------------- */
    function showError(input, message) {
        const errorContainer = input.nextElementSibling;
    
        if (input && errorContainer) {
            input.classList.add("is-invalid");
            errorContainer.textContent = message;
            errorContainer.classList.add("show");
        }
    }
    
    function clearErrors() {
        document.querySelectorAll(".form-control").forEach((input) => {
            input.classList.remove("is-invalid");
        });
    
        document.querySelectorAll(".invalid-feedback").forEach((fb) => {
            fb.classList.remove("show");
            fb.textContent = "";
        });
    }
    
    });
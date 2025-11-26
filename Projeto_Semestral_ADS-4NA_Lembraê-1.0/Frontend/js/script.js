// --- DOM References ---
const descContainer = document.getElementById("desc-container");
const checklistContainer = document.getElementById("checklist-container");
const checklistItemsDiv = document.getElementById("checklist-items");
const formArea = document.getElementById("form-area");
const submitBtn = document.getElementById("submit-btn");

const addBtnContainer = document.getElementById("add-reminder-btn"); 
const reminderList = document.getElementById("reminder-list"); 

// Referências do Modal de Formulário e Overlay
const body = document.body;
const overlay = document.getElementById('modal-overlay'); 

// --- Global Data ---
let checklistItems = [];
let editingReminder = null;
let userCategories = [];

// Prioridade - valores e ordem para ordenação
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

function showToast(message, type = 'default') {
  let x = document.getElementById("snackbar");
  
  if (!x) {
      x = document.createElement("div");
      x.id = "snackbar";
      document.body.appendChild(x);
  }

  x.innerText = message;
  x.className = "show " + type;

  setTimeout(function(){ 
      x.className = x.className.replace("show", "").replace(type, "").trim(); 
  }, 3000);
}

// =====================================================
// 🗑️ CONFIRMAÇÃO PERSONALIZADA (Substitui o confirm())
// =====================================================
function showCustomConfirm(titulo, mensagem) {
    return new Promise((resolve) => {
        // 1. Verifica se o modal já existe no HTML, se não, cria
        let modalOverlay = document.getElementById('custom-confirm-overlay');
        
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'custom-confirm-overlay';
            modalOverlay.innerHTML = `
                <div class="confirm-box">
                    <span class="confirm-icon">🗑️</span>
                    <h3 class="confirm-title" id="confirm-title">Confirmar</h3>
                    <p class="confirm-desc" id="confirm-desc">Descrição</p>
                    <div class="confirm-actions">
                        <button class="confirm-btn btn-cancel-modal" id="btn-cancel-confirm">Cancelar</button>
                        <button class="confirm-btn btn-delete-modal" id="btn-yes-confirm">Sim, Excluir</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
        }

        // 2. Atualiza os textos
        document.getElementById('confirm-title').textContent = titulo;
        document.getElementById('confirm-desc').textContent = mensagem;

        // 3. Referências dos botões
        const btnCancel = document.getElementById('btn-cancel-confirm');
        const btnYes = document.getElementById('btn-yes-confirm');

        // 4. Função para limpar eventos e fechar
        const closeAndResolve = (value) => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300); // Espera a animação acabar
            
            // Remove os Event Listeners para não acumular
            btnCancel.onclick = null;
            btnYes.onclick = null;
            
            resolve(value); // Retorna true ou false
        };

        // 5. Mostrar o modal
        modalOverlay.style.display = 'flex';
        // Pequeno delay para permitir a animação de opacidade
        setTimeout(() => {
            modalOverlay.classList.add('active');
            // Foco no botão cancelar por segurança
            btnCancel.focus();
        }, 10);

        // 6. Ações dos Botões
        btnCancel.onclick = () => closeAndResolve(false);
        btnYes.onclick = () => closeAndResolve(true);
    });
}

// --- Funções de Formulário ---

function showForm() {
  if (!formArea) return;

  formArea.style.display = "block";
  setTimeout(() => {
      formArea.classList.add("show");
      overlay.classList.add("active");
      body.classList.add("modal-open");
  }, 10);

  if (addBtnContainer) addBtnContainer.style.display = "none";
}

function resetFormStateToNew() {
    editingReminder = null;
    if (submitBtn) {
        submitBtn.innerText = "✅ Adicionar Lembrete";
        submitBtn.onclick = addReminder;
    }
    clearForm();
}

function hideForm() {
    if (formArea) {
       setTimeout(() => {
          formArea.style.display = "none";
          if (addBtnContainer) {
              addBtnContainer.style.display = "flex"; 
          }
      }, 300); 

        formArea.classList.remove("show");
        overlay.classList.remove("active"); 
        body.classList.remove("modal-open"); 

        editingReminder = null;
        if (submitBtn) {
            submitBtn.innerText = "✅ Adicionar Lembrete";
            submitBtn.onclick = addReminder;
        }
        clearForm(); 
    }
}

if (overlay) {
    overlay.addEventListener('click', hideForm);
}

// --- Funções de Lembrete e Outras ---

function toggleType(tipo) {
    const hiddenTypeInput = document.getElementById("type");
    if (hiddenTypeInput) {
        hiddenTypeInput.value = tipo;
    } else {
        console.error("ERRO: Input #type não encontrado!");
        return;
    }
  
    const descLabel = document.querySelector('label[onclick*="DESCRICAO"]');
    const checkLabel = document.querySelector('label[onclick*="CHECKLIST"]');
  
    if (tipo === "DESCRICAO") {
        descContainer.classList.remove("d-none");
        checklistContainer.classList.add("d-none");
        
        if (descLabel && checkLabel) {
            descLabel.classList.add('active');
            checkLabel.classList.remove('active');
        }
  
    } else { 
        descContainer.classList.add("d-none");
        checklistContainer.classList.remove("d-none");
  
        if (descLabel && checkLabel) {
            descLabel.classList.remove('active');
            checkLabel.classList.add('active');
        }
    }
}

function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("priority").value = "low";
    
    if (document.getElementById("category")) { 
        document.getElementById("category").value = "";
    }
    
    checklistItems = [];
    renderChecklist();
    
    toggleType('DESCRICAO');
    
    const descLabel = document.querySelector('label[onclick*="DESCRICAO"]');
    const checkLabel = document.querySelector('label[onclick*="CHECKLIST"]');
    if (descLabel && checkLabel) {
        descLabel.classList.add('active');
        checkLabel.classList.remove('active');
        
        const descInput = document.getElementById('type-desc');
        const checkInput = document.getElementById('type-check');
        if(descInput) descInput.checked = true;
        if(checkInput) checkInput.checked = false;
    }
}

// Funções de Checklist
function addChecklistItem() {
    const input = document.getElementById("new-check");
    const text = input.value.trim();
    if (text) {
        checklistItems.push({ text, checked: false });
        input.value = "";
        renderChecklist();
    }
}

function renderChecklist() {
  if (!checklistItemsDiv) return; 
  checklistItemsDiv.innerHTML = "";

  checklistItems.forEach((item, index) => {
      const div = document.createElement("li"); 
      div.className = "d-flex align-items-center mb-2 list-group-item p-0 border-0 bg-transparent"; 
      div.style.listStyle = 'none';

      const input = document.createElement("input");
      input.type = "text";
      input.className = "form-control mr-2"; 
      input.style.flexGrow = 1;
      input.value = item.text;
      input.onchange = () => (checklistItems[index].text = input.value);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger"; 
      deleteBtn.innerText = "🗑";
      deleteBtn.onclick = async () => {
          const itemToDelete = checklistItems[index];

          if (itemToDelete.id) {
              try {
                  await fetch(`http://localhost:4000/checklist/items/${itemToDelete.id}`, {
                      method: "DELETE",
                      headers: {
                          "Authorization": `Bearer ${localStorage.getItem("token")}`
                      }
                  });
              } catch (e) {
                  console.error("Erro ao excluir item no banco:", e);
              }
          }

          checklistItems.splice(index, 1);
          renderChecklist();
      };

      div.appendChild(input);
      div.appendChild(deleteBtn);
      checklistItemsDiv.appendChild(div);
  });
}

function formatDateBr(dateStr) {
    if (!dateStr || !dateStr.includes('-')) return dateStr; 
    const [yyyy, mm, dd] = dateStr.split("T")[0].split("-");
    return `${dd}/${mm}/${yyyy}`;
}

function sortReminders() {
    const list = document.getElementById("reminder-list");
    if (!list) return; 
    const reminders = Array.from(list.children); 

    reminders.sort((a, b) => {
        const pA = a.dataset.priority;
        const pB = b.dataset.priority;
        const dA = a.dataset.date;
        const dB = b.dataset.date;

        if (PRIORITY_ORDER[pB] !== PRIORITY_ORDER[pA]) {
            return PRIORITY_ORDER[pB] - PRIORITY_ORDER[pA];
        }

        if (dA > dB) return 1;
        if (dA < dB) return -1;

        return 0;
    });

    reminders.forEach((reminder) => list.appendChild(reminder));
}

// Funções de Categoria
async function loadCategories() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) return;

  try {
    const response = await fetch(`http://localhost:4000/categorias/usuario/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Erro ao carregar categorias");

    const categoriasDoServidor = await response.json();
    userCategories = categoriasDoServidor.map(c => c.nome);
    updateCategoryDropdowns();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

function saveCategories() {
    localStorage.setItem('userCategories', JSON.stringify(userCategories));
}

function updateCategoryDropdowns() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return; 
    
    const selectedValue = categorySelect.value;
    
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    userCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    if (selectedValue && categorySelect.querySelector(`option[value="${selectedValue}"]`)) {
        categorySelect.value = selectedValue;
    }
    
    const filterDropdown = document.getElementById('category-filter');
    if (!filterDropdown) return;

    while (filterDropdown.options.length > 1) {
        filterDropdown.remove(1);
    }

    userCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `📂 ${category}`;
        filterDropdown.appendChild(option);
    });
}

function showNewCategoryInput() {
    document.getElementById('new-category-container').style.display = 'block';
    document.getElementById('new-category').focus();
}

async function addNewCategory() {
  const input = document.getElementById('new-category');
  const newCategory = input.value.trim();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!newCategory || userCategories.includes(newCategory)) {
    showToast('Categoria inválida ou já existe!', 'error'); 
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/categorias/criar/${userId}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ nome: newCategory })
    });

    if (!response.ok) throw new Error("Erro ao criar categoria");

    const categoriaCriada = await response.json();
    userCategories.push(categoriaCriada.nome);
    updateCategoryDropdowns();
    document.getElementById('category').value = categoriaCriada.nome;
    cancelNewCategory();

  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    showToast("Erro ao criar categoria.", 'error'); 
  }
}

function cancelNewCategory() {
    document.getElementById('new-category-container').style.display = 'none';
    document.getElementById('new-category').value = '';
}

function filterByCategory(category) {
    const reminders = document.querySelectorAll('.reminder-card');
    reminders.forEach(reminder => {
        const cardCategories = (reminder.getAttribute('data-category') || "").split(',');
        
        if (category === 'all' || cardCategories.includes(category)) {
            reminder.style.display = 'block'; 
        } else {
            reminder.style.display = 'none';
        }
    });
}

function createProgressBar() {
    const container = document.createElement('div');
    container.className = 'progress-container mt-2 mb-2'; 
    
    const progress = document.createElement('div');
    progress.className = 'progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.role = 'progressbar';
    progressBar.setAttribute('aria-valuenow', '0');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    
    progress.appendChild(progressBar);
    container.appendChild(progress);
    
    return container;
}

// Funções de Lembrete (ADICIONAR)
async function addReminder() {
    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value || new Date().toISOString().split("T")[0];
    const time = document.getElementById("time").value || "06:00";
    const priority = document.getElementById("priority").value;
    const type = document.getElementById("type").value; 
    const description = document.getElementById("description").value.trim();
    const categoryEl = document.getElementById("category"); 
    const category = categoryEl ? categoryEl.value : '';

    if (
        !title ||
        (type === "DESCRICAO" && !description) ||
        (type === "CHECKLIST" && checklistItems.length === 0)
    ) {
        showToast("Preencha todos os campos!", 'error'); 
        return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
        showToast("Usuário não está logado.", 'error'); 
        return;
    }

    const url = `http://localhost:4000/lembretes/criar/${userId}`;

    const lembrete = {
        titulo: title,
        data: date,
        hora: time,
        prioridade: priority,
        tipoConteudo: type,
        descricao: type === "DESCRICAO" ? description : null, 
        categorias: category
        .split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0),
        checklist: type === "CHECKLIST" ? checklistItems : null
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(lembrete)
        });

        if (!response.ok) {
            throw new Error("Erro ao criar lembrete");
        }

        const result = await response.json();
        await loadReminders();
        showToast("Lembrete criado!", 'success');
        clearForm();
        hideForm();
    } catch (error) {
        console.error("Erro ao criar lembrete:", error);
       
    }
}

// --- Funções de Progresso ---
function updateChecklistProgress(reminderCard, checklist) {
    const progressContainer = reminderCard.querySelector('.progress-container'); 
    if (!progressContainer || !checklist || checklist.length === 0) {
        if (progressContainer) progressContainer.style.display = 'none';
        return;
    }
    
    const totalItems = checklist.length;
    const checkedItems = checklist.filter(item => item.checked).length;
    const percentage = Math.round((checkedItems / totalItems) * 100);
    
    const progressBar = progressContainer.querySelector('.progress-bar');
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.textContent = `${percentage}%`;
    
    let bgClass = 'bg-primary'; 
    if (percentage < 30) {
        bgClass = 'bg-danger';
    } else if (percentage < 70) {
        bgClass = 'bg-warning';
    } else {
        bgClass = 'bg-success';
    }
    progressBar.className = `progress-bar ${bgClass}`; 
    
    progressContainer.style.display = checklist.length > 0 ? 'block' : 'none';
    
    return percentage;
}

function atualizarChecklist(itemId, checked) {
    const url = `http://localhost:4000/lembretes/checklist/${itemId}/${checked ? 'check' : 'uncheck'}`;

    return fetch(url, { 
        method: 'PUT',
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao atualizar checklist item ${itemId}`);
        }
        return response.json(); 
    })
    .catch(error => {
        console.error('Erro ao atualizar checklist:', error);
        return { error: true, itemId: itemId, message: error.message }; 
    });
}

function createReminderCard(id, title, date, time, priority, type, checklist, description, color, category, concluido) {
    const reminder = document.createElement("div");
    reminder.className = "card reminder-card"; 
    reminder.dataset.priority = priority;
    reminder.dataset.date = date;
    reminder.dataset.category = (category || []).join(','); 
    reminder.dataset.id = id
    reminder.classList.add(`priority-${priority}`); 

    const bar = document.createElement("div");
      bar.className = "reminder-color-bar";

      if (color) {
          bar.style.backgroundColor = color;
      } else {
          const priorityColors = {
              low: "var(--cor-prioridade-baixa)",
              medium: "var(--cor-prioridade-media)",
              high: "var(--cor-prioridade-alta)"
          };
          bar.style.backgroundColor = priorityColors[priority] || "var(--cor-prioridade-baixa)";
      }

      reminder.appendChild(bar);
    
    if (concluido) {
        reminder.classList.add("completed");
    }

    const header = document.createElement("div");
    header.className = "card-header d-flex justify-content-between align-items-center";
    
    const titleEl = document.createElement("strong");
    titleEl.textContent = title;

    const checkBtn = document.createElement("button");
    checkBtn.className = "btn btn-outline-success btn-sm"; 
    checkBtn.innerText = "✅";
    
    checkBtn.onclick = async () => {
        const lembreteId = reminder.dataset.id;
        const isCurrentlyCompleted = reminder.classList.contains("completed");
        
        const endpoint = isCurrentlyCompleted
            ? `http://localhost:4000/lembretes/desconcluir/${lembreteId}`
            : `http://localhost:4000/lembretes/concluir/${lembreteId}`; 
        
        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
        
            if (!response.ok) throw new Error("Erro ao atualizar o lembrete");
        
            const willBeCompleted = !isCurrentlyCompleted;
            reminder.classList.toggle("completed", willBeCompleted);
        
            if (type?.trim().toUpperCase() === "CHECKLIST" && checklist && checklist.length > 0) {
                const checkboxes = reminder.querySelectorAll('.checklist-list input[type="checkbox"]');
                const spans = reminder.querySelectorAll('.checklist-list .form-check-label');
                const updatePromises = [];
                
                checkboxes.forEach((checkbox, index) => {
                    checkbox.checked = willBeCompleted;
                    
                    if (spans[index]) {
                        spans[index].style.textDecoration = willBeCompleted ? "line-through" : "none";
                        spans[index].style.color = willBeCompleted ? "var(--cor-texto-secundario)" : "inherit";
                    }
                    
                    if (checklist[index] && checklist[index].id) {
                        checklist[index].checked = willBeCompleted;
                        updatePromises.push(atualizarChecklist(checklist[index].id, willBeCompleted));
                    }
                });
                
                await Promise.all(updatePromises);
                updateChecklistProgress(reminder, checklist);
            }
        } catch (error) {
            console.error("Erro ao atualizar lembrete:", error);
            showToast("Erro ao atualizar o lembrete.", 'error'); 
        }
    };

    header.appendChild(titleEl);
    header.appendChild(checkBtn);

    const bodyEl = document.createElement("div");
    bodyEl.className = "card-body";

    const dateEl = document.createElement("h6");
    dateEl.className = "card-subtitle mb-2 text-secondary"; 
    dateEl.textContent = `🗓 ${formatDateBr(date)} 🕒 ${time}`;
    
    const priorityEl = document.createElement("h6");
    priorityEl.className = "mb-2 font-weight-bold";
    
    const priorityLabels = { 
        low: `<span style="color: var(--cor-prioridade-baixa)">Baixa</span> 🔵`, 
        medium: `<span style="color: var(--cor-prioridade-media)">Média</span> 🟡`, 
        high: `<span style="color: var(--cor-prioridade-alta)">Alta</span> 🔴` 
    };
    priorityEl.innerHTML = `Prioridade: ${priorityLabels[priority]}`;
    
    bodyEl.appendChild(dateEl);
    bodyEl.appendChild(priorityEl);

    if (category && category.length > 0) {
        category.forEach(cat => {
            const categoryEl = document.createElement("span");
            categoryEl.className = "category-badge"; 
            categoryEl.textContent = `📂 ${cat}`;
            bodyEl.appendChild(categoryEl);
        });
    }

    if (description && description.trim() !== "") {
        const descriptionEl = document.createElement("p");
        descriptionEl.className = "card-text mt-2";
        descriptionEl.textContent = description;
        bodyEl.appendChild(descriptionEl);
    }

    const progressContainer = createProgressBar();
    progressContainer.style.display = type === "CHECKLIST" ? 'block' : 'none';
    bodyEl.appendChild(progressContainer);

    const content = document.createElement("div");
    content.className = "mt-3";
    
    if (type?.trim().toUpperCase() === "CHECKLIST") {
        if (checklist && checklist.length > 0) {
            const ul = document.createElement("ul");
            ul.className = "list-unstyled checklist-list"; 
    
            checklist.forEach((item, index) => {
                const li = document.createElement("li");
                li.className = "d-flex align-items-center mb-1"; 
    
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "form-check-input"; 
                checkbox.checked = item.checked;
                checkbox.disabled = false;
                checkbox.setAttribute('data-item-id', item.id); 
    
                const span = document.createElement("span");
                span.className = "form-check-label ml-3"; 
                span.textContent = item.text || "(Sem texto)";
    
                if (item.checked) {
                    span.style.textDecoration = "line-through";
                    span.style.color = "var(--cor-texto-secundario)"; 
                }
    
                checkbox.onchange = () => {
                    item.checked = checkbox.checked;
    
                    if (item.checked) {
                        span.style.textDecoration = "line-through";
                        span.style.color = "var(--cor-texto-secundario)";
                    } else {
                        span.style.textDecoration = "none";
                        span.style.color = "inherit";
                    }
    
                    atualizarChecklist(item.id, item.checked);
                    updateChecklistProgress(reminder, checklist); 
                };
    
                li.appendChild(checkbox);
                li.appendChild(span);
                ul.appendChild(li);
            });
    
            content.appendChild(ul);
            updateChecklistProgress(reminder, checklist);
    
        } else {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "(Sem itens no checklist)";
            content.appendChild(emptyMsg);
        }
    }

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-primary mr-2"; 
    editBtn.innerText = "✏️ Editar";
    editBtn.onclick = () => {
        editingReminder = reminder;
        const idField = document.getElementById("id");
        if (idField) idField.value = id; 
        
        document.getElementById("title").value = title;
        document.getElementById("date").value = date.split('T')[0]; 
        document.getElementById("time").value = time;
        document.getElementById("priority").value = priority;
        
        const categoryField = document.getElementById("category");
        if (categoryField) categoryField.value = (category || []).join(',');
        
        toggleType(type); 
        
        const descLabel = document.querySelector('label[onclick*="DESCRICAO"]');
        const checkLabel = document.querySelector('label[onclick*="CHECKLIST"]');
        if (descLabel && checkLabel) {
            if (type === 'DESCRICAO') {
                descLabel.classList.add('active');
                checkLabel.classList.remove('active');
            } else {
                descLabel.classList.remove('active');
                checkLabel.classList.add('active');
            }
        }
        
        document.getElementById("description").value = description;
        checklistItems = JSON.parse(JSON.stringify(checklist || [])); 
        renderChecklist();
        showForm();
        
        if (submitBtn) {
            submitBtn.innerText = "✅ Confirmar Edição";
            submitBtn.onclick = async () => {
              const lembreteId = editingReminder.dataset.id;

              const lembreteAtualizado = {
                  titulo: document.getElementById("title").value,
                  data: document.getElementById("date").value,
                  hora: document.getElementById("time").value,
                  prioridade: document.getElementById("priority").value,
                  tipoConteudo: document.getElementById("type").value,
                  descricao: document.getElementById("description").value,
                  categorias: (document.getElementById("category")?.value || "").split(",").map(c => c.trim()).filter(Boolean),
                  checklist: checklistItems
              };
          
                try {
                  const response = await fetch(`http://localhost:4000/lembretes/editar/${lembreteId}`, {
                      method: "PUT",
                      headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${localStorage.getItem("token")}`
                      },
                      body: JSON.stringify(lembreteAtualizado)
                  });
          
                  if (!response.ok) throw new Error("Erro ao atualizar lembrete");
                  const result = await response.json();
                  const newCard = createReminderCard(
                      result.id, result.titulo, result.data, result.hora,
                      result.prioridade, result.tipoConteudo, result.checklist,
                      result.descricao, result.cor, result.categorias, result.concluido
                  );
                  editingReminder.replaceWith(newCard);
                  showToast("Lembrete editado com sucesso!", "success");
                  sortReminders();
                  clearForm();
                  hideForm();
              }
              catch (error) {

              }
          };
        }
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-danger"; 
    delBtn.innerText = "🗑️ Excluir";

    // 🔴 AQUI ESTÁ A NOVA LÓGICA DE EXCLUSÃO
    delBtn.onclick = async () => {
        // Usando nossa função premium 'showCustomConfirm' em vez de 'confirm'
        const confirmar = await showCustomConfirm(
            "Excluir Lembrete?",
            "Tem certeza que deseja excluir este lembrete? Essa ação não pode ser desfeita."
        );

        if (!confirmar) return; // Se clicou em Cancelar, para aqui.

        try {
            const lembreteId = reminder.dataset.id;
            const response = await fetch(`http://localhost:4000/lembretes/deletar/${lembreteId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                reminder.remove(); 
            } else if (response.status === 404) {
                showToast("Lembrete não encontrado.", 'error'); 
            } else {
                showToast("Erro ao excluir o lembrete.", 'error'); 
            }
        } catch (error) {
            console.error("Erro na exclusão:", error);
            showToast("Erro de conexão com o servidor.", 'error'); 
        }
    };

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    bodyEl.appendChild(content);
    reminder.appendChild(header);
    reminder.appendChild(bodyEl);
    
    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.appendChild(btnGroup);
    reminder.appendChild(footer);

    updateChecklistProgress(reminder, checklist);
    return reminder;   
}

// Funções de Tema e Logout
function logoff() {
    document.body.classList.add('body-exit');
    setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "index.html";
    }, 900);
}

function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById("dark-mode-btn");
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("modoNoturno", isDark ? "sim" : "nao");
    
    if (btn) {
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    const modoSalvo = localStorage.getItem("modoNoturno");
    const hora = new Date().getHours();
    const btn = document.getElementById("dark-mode-btn");
    const horarioAutomatico = hora >= 19 || hora < 6;
    
    if (modoSalvo === "sim" || (!modoSalvo && horarioAutomatico)) {
        document.body.classList.add("dark");
        if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove("dark");
        if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    if (formArea) formArea.style.display = 'none';
    if (addBtnContainer) addBtnContainer.style.display = 'flex';

    const addReminderBtn = document.getElementById('add-reminder-btn');
    addReminderBtn.addEventListener("click", () => {
        resetFormStateToNew();
        showForm();
    });

    if (addReminderBtn) addReminderBtn.classList.add('animate-pulse'); 

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });
    }
    
    loadReminders();
    loadCategories();
});

async function loadReminders() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        window.location.href = "index.html"; 
        return;
    }

    const url = `http://localhost:4000/lembretes/usuario/${userId}`;

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        
        if (response.status === 401 || response.status === 403) {
              logoff(); 
              return;
        }
        if (!response.ok) throw new Error("Erro ao carregar lembretes");

        const reminders = await response.json();
        const reminderList = document.getElementById("reminder-list");
        
        if (reminderList) { 
            reminderList.innerHTML = "";
            reminders.forEach(reminder => {
                const card = createReminderCard(
                    reminder.id, reminder.titulo, reminder.data, reminder.hora,
                    reminder.prioridade, reminder.tipoConteudo, reminder.checklist,
                    reminder.descricao, reminder.cor, reminder.categorias, reminder.concluido
                );
                reminderList.appendChild(card);
                
                if (reminder.tipoConteudo === "CHECKLIST" && reminder.checklist) {
                    updateChecklistProgress(card, reminder.checklist);
                }
            });
            sortReminders();
            const categoryFilter = document.getElementById('category-filter');
            if(categoryFilter && categoryFilter.value) {
              filterByCategory(categoryFilter.value);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar lembretes:", error);
    }
} 

// Painel do Usuário
document.addEventListener("DOMContentLoaded", () => {
  const userBtn = document.getElementById("user-btn");
  const panel = document.getElementById("user-panel");
  const wrapper = document.getElementById("user-wrapper");
  const panelName = document.getElementById("panel-name");
  const panelEmail = document.getElementById("panel-email");
  const panelCreated = document.getElementById("panel-created");
  const panelBirth = document.getElementById("panel-birth");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userBtn || !panel) return;

  userBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      panelName.textContent = localStorage.getItem("userName") || "—";
      panelEmail.textContent = localStorage.getItem("userEmail") || "—";
      panelCreated.textContent = localStorage.getItem("userCreated") || "—";
      panelBirth.textContent = localStorage.getItem("userBirth") || "—";

      if (userId && token) {
          try {
              const resp = await fetch(`http://localhost:4000/user/${userId}`, {
                  method: "GET",
                  headers: {
                      "Authorization": `Bearer ${token}`,
                      "Content-Type": "application/json"
                  }
              });

              function formatDate(dateString) {
                  if (!dateString) return "—";
                  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                      const [year, month, day] = dateString.split("-");
                      return `${day}/${month}/${year}`;
                  }
                  const fixed = dateString.replace(" ", "T");
                  const d = new Date(fixed);
                  if (isNaN(d)) return "—";
                  return d.toLocaleDateString("pt-BR");
              }

              if (resp.ok) {
                  const user = await resp.json();
                  panelName.textContent = user.name;
                  panelEmail.textContent = user.email;
                  panelCreated.textContent = formatDate(user.data_criacao);
                  panelBirth.textContent = formatDate(user.data_nascimento);

                  localStorage.setItem("userName", user.name);
                  localStorage.setItem("userEmail", user.email);
                  localStorage.setItem("userCreated", formatDate(user.data_criacao));
                  localStorage.setItem("userBirth", formatDate(user.data_nascimento));
              }
          } catch (error) {
              console.error("Erro ao carregar usuário:", error);
          }
      }
      panel.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
          panel.classList.add("hidden");
      }
  });
  panel.addEventListener("click", (e) => e.stopPropagation());

  const applyDarkMode = () => {
      if (document.body.classList.contains("dark")) {
          panel.classList.add("dark-panel");
          userBtn.classList.add("dark-btn");
      } else {
          panel.classList.remove("dark-panel");
          userBtn.classList.remove("dark-btn");
      }
  };
  applyDarkMode(); 
  const observer = new MutationObserver(() => applyDarkMode());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
});
// Variáveis globais
const typeSelect = document.getElementById("type");
const descContainer = document.getElementById("desc-container");
const checklistContainer = document.getElementById("checklist-container");
const checklistItemsDiv = document.getElementById("checklist-items");
const formArea = document.getElementById("form-area");
const submitBtn = document.getElementById("submit-btn");
let checklistItems = [];
let editingReminder = null;
let userCategories = [];

// Prioridade - valores e ordem para ordenação
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

// Event Listeners
typeSelect.addEventListener("change", () => {
  if (typeSelect.value === "DESCRICAO") {
    descContainer.classList.remove("d-none");
    checklistContainer.classList.add("d-none");
  } else {
    descContainer.classList.add("d-none");
    checklistContainer.classList.remove("d-none");
  }
});

// Funções de Formulário
function showForm() {
  formArea.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideForm() {
  formArea.style.display = "none";
  editingReminder = null;
  submitBtn.innerText = "✅ Adicionar Lembrete";
  submitBtn.onclick = addReminder;
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("priority").value = "low";
  document.getElementById("category").value = "";
  document.getElementById("color").value = "#007bff";
  checklistItems = [];
  renderChecklist();
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
  checklistItemsDiv.innerHTML = "";
  checklistItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "form-check d-flex align-items-center mb-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = item.checked;
    checkbox.disabled = false;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control ml-2 mr-2";
    input.style.flexGrow = 1;
    input.value = item.text;
    input.onchange = () => (checklistItems[index].text = input.value);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.innerText = "🗑";
    deleteBtn.onclick = () => {
      checklistItems.splice(index, 1);
      renderChecklist();
    };

    div.appendChild(checkbox);
    div.appendChild(input);
    div.appendChild(deleteBtn);
    checklistItemsDiv.appendChild(div);
  });
}

// Funções de Data e Formatação
function formatDateBr(dateStr) {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

// Funções de Ordenação
function sortReminders() {
  const list = document.getElementById("reminder-list");
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
function loadCategories() {
  const savedCategories = localStorage.getItem('userCategories');
  if (savedCategories) {
    userCategories = JSON.parse(savedCategories);
  }
  updateCategoryDropdowns();
}

function saveCategories() {
  localStorage.setItem('userCategories', JSON.stringify(userCategories));
}

function updateCategoryDropdowns() {
  const categorySelect = document.getElementById('category');
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
  
  const filterDropdown = document.getElementById('category-filter-dropdown');
  const allCategoriesItem = filterDropdown.querySelector('[data-category="all"]');
  const divider = filterDropdown.querySelector('.dropdown-divider');
  
  filterDropdown.innerHTML = '';
  filterDropdown.appendChild(allCategoriesItem);
  filterDropdown.appendChild(divider);
  
  userCategories.forEach(category => {
    const item = document.createElement('a');
    item.className = 'dropdown-item';
    item.href = '#';
    item.setAttribute('data-category', category);
    item.textContent = category;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      filterByCategory(category);
    });
    filterDropdown.appendChild(item);
  });
  updateCategoryListUI(); 
}

function showNewCategoryInput() {
  document.getElementById('new-category-container').style.display = 'block';
  document.getElementById('new-category').focus();
}



function cancelNewCategory() {
  document.getElementById('new-category-container').style.display = 'none';
  document.getElementById('new-category').value = '';
}

function filterByCategory(category) {
  const dropdownItems = document.querySelectorAll('#category-filter-dropdown .dropdown-item');
  dropdownItems.forEach(item => {
    if (item.getAttribute('data-category') === category) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  const filterButton = document.getElementById('category-filter-btn');
  filterButton.textContent = category === 'all' ? '📂 Categorias' : `📂 ${category}`;
  
  const reminders = document.querySelectorAll('.reminder-card');
  reminders.forEach(reminder => {
    if (category === 'all' || reminder.getAttribute('data-category') === category) {
      reminder.style.display = 'block';
    } else {
      reminder.style.display = 'none';
    }
  }); 
}



// Criar elemento da barra de progresso
function createProgressBar() {
  const container = document.createElement('div');
  container.className = 'progress-container';
  
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


// Funções de Lembrete
async function addReminder() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value || new Date().toISOString().split("T")[0];
  const time = document.getElementById("time").value || "06:00";
  const priority = document.getElementById("priority").value;
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value.trim();
  const color = document.getElementById("color").value;
  const category = document.getElementById("category").value;

  if (
    !title ||
    (type === "DESCRICAO" && !description) ||
    (type === "CHECKLIST" && checklistItems.length === 0)
  ) {
    alert("Preencha todos os campos!");
    return;
  }

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Usuário não está logado.");
    return;
  }

  const url = `http://127.0.0.1:8080/lembretes/criar/${userId}`;

  const lembrete = {
    titulo: title,
    data: date,
    hora: time,
    prioridade: priority,
    tipoConteudo: type,
    descricao: description,
    cor: color,
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(lembrete)
    });

    if (!response.ok) {
      throw new Error("Erro ao criar lembrete");
    }

    const result = await response.json();
    alert("Lembrete criado com sucesso!");
    console.log("Resposta do servidor:", result);
    await loadReminders();
    clearForm();
    hideForm();
  } catch (error) {
    console.error("Erro ao criar lembrete:", error);
    alert("Erro ao criar lembrete.");
  }
}
// Funções de Progresso
function updateChecklistProgress(reminderCard, checklist) {
  const progressContainer = reminderCard.querySelector('.progress-container');
  if (!progressContainer || checklist.length === 0) return;
  
  // Calcular porcentagem
  const totalItems = checklist.length;
  const checkedItems = checklist.filter(item => item.checked).length;
  const percentage = Math.round((checkedItems / totalItems) * 100);
  
  // Atualizar barra de progresso
  const progressBar = progressContainer.querySelector('.progress-bar');
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute('aria-valuenow', percentage);
  progressBar.textContent = `${percentage}%`;
  
  // Definir a cor com base no progresso
  if (percentage < 30) {
    progressBar.className = 'progress-bar bg-danger';
  } else if (percentage < 70) {
    progressBar.className = 'progress-bar bg-warning';
  } else {
    progressBar.className = 'progress-bar bg-success';
  }
  
  // Mostrar ou esconder a barra de progresso conforme necessário
  progressContainer.style.display = checklist.length > 0 ? 'block' : 'none';
  
  return percentage;
}


function createReminderCard(id, title, date, time, priority, type, checklist, description, color, category, concluido) {
  const reminder = document.createElement("div");
  reminder.className = "card reminder-card";
  reminder.dataset.priority = priority;
  reminder.dataset.date = date;
  reminder.dataset.category = category; 
  reminder.dataset.id = id
  reminder.classList.add(`priority-${priority}`);
  
    
  if (concluido) {
    reminder.classList.add("completed");
  }

  const header = document.createElement("div");
  header.className = "card-header d-flex justify-content-between align-items-center";
  header.style.backgroundColor = color;

  const titleEl = document.createElement("strong");
  titleEl.textContent = title;

  const checkBtn = document.createElement("button");
  checkBtn.className = "btn btn-light btn-sm";
  checkBtn.innerText = "✅";
  checkBtn.onclick = async () => {
    const lembreteId = reminder.dataset.id;
    const isCompleted = reminder.classList.contains("completed");
  
    const endpoint = isCompleted
      ? `http://localhost:8080/lembretes/desconcluir/${lembreteId}`
      : `http://localhost:8080/lembretes/concluir/${lembreteId}`;   
  
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
      });
  
      if (!response.ok) throw new Error("Erro ao atualizar o lembrete");
  
      reminder.classList.toggle("completed");
  
      console.log(isCompleted ? "Lembrete desmarcado como concluído." : "Lembrete marcado como concluído.");
    } catch (error) {
      console.error("Erro ao atualizar lembrete:", error);
      alert("Erro ao atualizar o lembrete.");
    }
  };

  header.appendChild(titleEl);
  header.appendChild(checkBtn);

  const body = document.createElement("div");
  body.className = "card-body";

  const dateEl = document.createElement("h6");
  dateEl.className = "card-subtitle mb-2 text-muted";
  dateEl.textContent = `🗓 ${formatDateBr(date)} 🕒 ${time}`;
  
  const priorityEl = document.createElement("h6");
  priorityEl.className = "mb-2 font-weight-bold";
  const priorityLabels = { low: "Baixa 🔵", medium: "Média 🟠", high: "Alta 🔴" };
  priorityEl.textContent = `Prioridade: ${priorityLabels[priority]}`;
  
  const categoryEl = document.createElement("span");
  if (category) {
    categoryEl.className = "category-badge";
    categoryEl.textContent = `📂 ${category}`;
  }

  body.appendChild(dateEl);
  body.appendChild(priorityEl);
  if (category) {
    body.appendChild(categoryEl);
  }

  if (description && description.trim() !== "") {
    const descriptionEl = document.createElement("p");
    descriptionEl.className = "card-text mt-2";
    descriptionEl.textContent = description;
    body.appendChild(descriptionEl);
  }

  const progressContainer = createProgressBar();
progressContainer.style.display = type === "CHECKLIST" ? 'block' : 'none';
body.appendChild(progressContainer);

  const content = document.createElement("div");
  content.className = "mt-3";
  
  
  if (type?.trim().toUpperCase() === "CHECKLIST") {
    if (checklist && checklist.length > 0) {
      updateChecklistProgress(reminder, checklist); // <<<< 1. Atualiza logo ao iniciar
  
      const ul = document.createElement("ul");
      ul.className = "checklist-list";
  
      checklist.forEach(item => {
        const li = document.createElement("li");
  
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.disabled = false;
  
        const span = document.createElement("span");
        span.textContent = item.text || "(Sem texto)";
  
        if (item.checked) {
          span.style.textDecoration = "line-through";
          span.style.color = "#777";
        }
  
        checkbox.onchange = () => {
          item.checked = checkbox.checked;
  
          if (item.checked) {
            span.style.textDecoration = "line-through";
            span.style.color = "#777";
          } else {
            span.style.textDecoration = "none";
            span.style.color = "inherit";
          }
  
          atualizarChecklist(item.id, item.checked);
          updateChecklistProgress(reminder, checklist); // continua atualizando no onchange
        };
  
        li.appendChild(checkbox);
        li.appendChild(span);
        ul.appendChild(li);
      });
  
      content.appendChild(ul);
  
      updateChecklistProgress(reminder, checklist); // <<<< 2. Atualiza após montar lista
  
    } else {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = "(Sem itens no checklist)";
      content.appendChild(emptyMsg);
    }
  }
  
  // <<<< 3. Atualiza a barra ao carregar a página/recarregar
  document.addEventListener('DOMContentLoaded', () => {
    if (type?.trim().toUpperCase() === "CHECKLIST" && checklist?.length > 0) {
      updateChecklistProgress(reminder, checklist);
    }
  });
  // Apenas para TESTAR: atualiza barra a cada 1 segundo
setInterval(() => {
  if (type?.trim().toUpperCase() === "CHECKLIST" && checklist?.length > 0) {
    updateChecklistProgress(reminder, checklist);
  }
}, 100);

  function atualizarChecklist(itemId, checked) {
    const url = `http://localhost:8080/lembretes/checklist/${itemId}/${checked ? 'check' : 'uncheck'}`;
  
    fetch(url, {
      method: 'PUT'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao atualizar checklist');
      }
      console.log('Checklist item atualizado:', itemId);
    })
    .catch(error => {
      console.error('Erro ao atualizar checklist:', error);
    });
  }

  const btnGroup = document.createElement("div");
  btnGroup.className = "mt-3 d-flex justify-content-between";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-sm btn-primary";
  editBtn.innerText = "✏️ Editar";
  editBtn.onclick = () => {
    editingReminder = reminder;
    document.getElementById("id").value = id;
    document.getElementById("title").value = title;
    document.getElementById("date").value = date;
    document.getElementById("time").value = time;
    document.getElementById("priority").value = priority;
    document.getElementById("type").value = type; 
    document.getElementById("category").value = category || "";
    typeSelect.dispatchEvent(new Event("change"));
    document.getElementById("description").value = description;
    document.getElementById("color").value = color;
    checklistItems = JSON.parse(JSON.stringify(checklist));
    
    renderChecklist();
    showForm();
    submitBtn.innerText = "✅ Confirmar Edição";
    submitBtn.onclick = async () => {
      const updatedTitle = document.getElementById("title").value.trim();
      const updatedDate = document.getElementById("date").value || new Date().toISOString().split("T")[0];
      const updatedTime = document.getElementById("time").value || "00:00";
      const updatedPriority = document.getElementById("priority").value;
      const updatedType = document.getElementById("type").value;
      const updatedDescription = document.getElementById("description").value.trim();
      const updatedColor = document.getElementById("color").value;
      const updatedCategory = document.getElementById("category").value;
      
      const lembreteId = editingReminder.dataset.id; 

      const lembreteAtualizado = {
      id: document.getElementById("id").value,
      titulo: document.getElementById("title").value,
      data: document.getElementById("date").value,
      hora: (() => {
        const timeValue = document.getElementById("time").value;
        return timeValue.length === 5 ? timeValue + ":00" : timeValue;
      })(),
      prioridade: document.getElementById("priority").value,
      tipoConteudo: document.getElementById("type").value,
      descricao: document.getElementById("description").value,
      cor: document.getElementById("color").value,
      categorias: document.getElementById("category").value
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0),
      checklist: checklistItems
      };

      try {
        const response = await fetch(`http://localhost:8080/lembretes/editar/${lembreteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lembreteAtualizado)
        });
  
        if (!response.ok) throw new Error("Erro ao atualizar lembrete");
  
        const lembreteAtualizadoDoServidor = await response.json();
  
        // Atualiza o card no front com os dados do servidor
        const newCard = createReminderCard(
          lembreteAtualizadoDoServidor.id,  
          lembreteAtualizadoDoServidor.titulo,
          lembreteAtualizadoDoServidor.data,
          lembreteAtualizadoDoServidor.hora,
          lembreteAtualizadoDoServidor.prioridade,
          lembreteAtualizadoDoServidor.tipoConteudo,
          lembreteAtualizadoDoServidor.checklist,
          lembreteAtualizadoDoServidor.descricao,
          lembreteAtualizadoDoServidor.cor,
          lembreteAtualizadoDoServidor.categorias
        );
  
        document.getElementById("reminder-list").replaceChild(newCard, editingReminder);
        sortReminders();
        clearForm();
        hideForm();
      } catch (error) {
        alert(error.message);
      }
    };
  };

  const delBtn = document.createElement("button");
delBtn.className = "btn btn-sm btn-danger";
delBtn.innerText = "🗑️ Excluir";

delBtn.onclick = async () => {
  const confirmar = confirm("Tem certeza que deseja excluir este lembrete?");
  if (!confirmar) return;

  try {
    const lembreteId = reminder.dataset.id;
    const response = await fetch(`http://localhost:8080/lembretes/deletar/${lembreteId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      reminder.remove(); // Remove da interface
    } else if (response.status === 404) {
      alert("Lembrete não encontrado.");
    } else {
      alert("Erro ao excluir o lembrete.");
    }
  } catch (error) {
    console.error("Erro na exclusão:", error);
    alert("Erro de conexão com o servidor.");
  }
};

  btnGroup.appendChild(editBtn);
  btnGroup.appendChild(delBtn);

  body.appendChild(content);
  body.appendChild(btnGroup);

  reminder.appendChild(header);
  reminder.appendChild(body);
  return reminder;
}

// Funções de Tema e Logout
function logoff() {
  document.body.classList.add('body-exit');

  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById("dark-mode-btn");

  body.classList.toggle("dark");

  const isDark = body.classList.contains("dark");
  localStorage.setItem("modoNoturno", isDark ? "sim" : "nao");

  btn.innerHTML = isDark ? "🌞 Modo Claro" : "🌙 Modo Noturno";
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const modoSalvo = localStorage.getItem("modoNoturno");
  const hora = new Date().getHours();
  const btn = document.getElementById("dark-mode-btn");
  const horarioAutomatico = hora >= 19 || hora < 6;

  if (modoSalvo === "sim" || (!modoSalvo && horarioAutomatico)) {
    document.body.classList.add("dark");
    btn.innerHTML = "🌞 Modo Claro";
  } else {
    document.body.classList.remove("dark");
    btn.innerHTML = "🌙 Modo Noturno";
  }

  const allCategoriesItem = document.querySelector('[data-category="all"]');
  if (allCategoriesItem) {
    allCategoriesItem.addEventListener('click', (e) => {
      e.preventDefault();
      filterByCategory('all');
    });
  }
  
  loadReminders();
  loadCategories();
});

async function loadReminders() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Usuário não está logado.");
    return;
  }

  const url = `http://127.0.0.1:8080/lembretes/usuario/${userId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao carregar lembretes");

    const reminders = await response.json();
    const reminderList = document.getElementById("reminder-list");
    reminderList.innerHTML = ""; // limpa a lista antes de renderizar

    reminders.forEach(reminder => {
      const card = createReminderCard(
        reminder.id,
        reminder.titulo,
        reminder.data,
        reminder.hora,
        reminder.prioridade,
        reminder.tipoConteudo,
        reminder.checklist,
        reminder.descricao,
        reminder.cor,
        reminder.categorias,
        reminder.concluido
      );
      reminderList.appendChild(card);
    });

    sortReminders(); // opcional: se você tem ordenação
  } catch (error) {
    console.error("Erro ao carregar lembretes:", error);
    alert("Erro ao carregar lembretes.");
  }
}
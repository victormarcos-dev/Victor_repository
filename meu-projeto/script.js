const API_URL = 'http://localhost:3000/tarefas';

// 1. Função para buscar as tarefas do servidor (READ)
async function carregarTarefas() {
    const resposta = await fetch(API_URL);
    const tarefas = await resposta.json();
    
    const lista = document.getElementById('listaTarefas');
    lista.innerHTML = ''; // Limpa a lista antes de mostrar tudo

    tarefas.forEach(tarefa => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${tarefa.titulo}</span>
            <button class="btn-delete" onclick="deletarTarefa(${tarefa.id})">Apagar</button>
        `;
        lista.appendChild(li);
    });
}

// 2. Função para enviar uma tarefa nova (CREATE)
async function adicionarTarefa() {
    const input = document.getElementById('tarefaInput');
    const titulo = input.value;

    if (!titulo) return alert("Digite algo antes de salvar!");

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: titulo })
    });

    input.value = ''; // Limpa o campo
    carregarTarefas(); // Atualiza a lista na tela
}

// 3. Função para apagar uma tarefa (DELETE)
async function deletarTarefa(id) {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    carregarTarefas(); // Atualiza a lista na tela
}

// Carregar as tarefas assim que abrir o site
carregarTarefas();
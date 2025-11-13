
const display = document.getElementById('display');

function adicionar(valor) {
    display.value += valor;
}
function limpar() {
    display.value = '';
}
function apagar() {
    display.value = display.value.slice(0, -1);
}
function calcular() {
    try {
    display.value = eval(display.value);
} catch (e) {
    display.value = 'Erro';
}
}
document.addEventListener('keydown', function(event) {
  const tecla = event.key;

  if (!isNaN(tecla) || tecla === '.') {
    adicionar(tecla);
  }

  if (['+', '-', '*', '/'].includes(tecla)) {
    adicionar(tecla);
  }

  if (tecla === 'Enter' || tecla === '=') {
    event.preventDefault();
    calcular();
  }

  if (tecla === 'Backspace') {
    apagar();
  }

  if (tecla === 'Escape') {
    limpar();
  }
  if (tecla === 'Delete') {
    limpar();
  }
})

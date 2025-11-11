const textarea = document.getElementById('texto');
const contador = document.getElementById('contador');

textarea.addEventListener('input', () => {
  const quantidade = textarea.value.length;
  contador.textContent = `${quantidade} caracteres`;
});

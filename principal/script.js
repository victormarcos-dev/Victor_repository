
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');


menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active'); 
});


function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}


const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('show');
    }
  });
});


document.querySelectorAll('.hidden').forEach((el) => observador.observe(el));


const modoBtn = document.getElementById('modo-btn');

if (modoBtn) {
  modoBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    modoBtn.classList.toggle('fa-moon');
    modoBtn.classList.toggle('fa-sun');
  });
}


const typingElement = document.getElementById('typing');
const palavras = ["Victor Gomes", "Desenvolvedor Júnior e estudante", "Criador de Experiências"]; 
let index = 0;
let charIndex = 0;

function digitar() {
  if (charIndex < palavras[index].length) {
    typingElement.textContent += palavras[index].charAt(charIndex);
    charIndex++;
    setTimeout(digitar, 100);
  } else {
    setTimeout(apagar, 1700); 
  }
}

function apagar() {
  if (charIndex > 0) {
    typingElement.textContent = palavras[index].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(apagar, 50);
  } else {
    index = (index + 1) % palavras.length;
    setTimeout(digitar, 700);
  }
}

digitar();

function enviarFormulario(event) {
  event.preventDefault();
  const nome = document.getElementById('nome').value;
  alert(`Obrigado, ${nome}! Sua mensagem foi enviada com sucesso.`);
  document.querySelector('form').reset();
}

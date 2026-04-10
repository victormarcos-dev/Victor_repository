document.addEventListener('DOMContentLoaded', () => {
    // Seletores de elementos HTML
    const passwordDisplay = document.getElementById('passwordDisplay');
    const passwordLength = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const includeUppercase = document.getElementById('includeUppercase');
    const includeLowercase = document.getElementById('includeLowercase');
    const includeNumbers = document.getElementById('includeNumbers');
    const includeSymbols = document.getElementById('includeSymbols');
    const generateButton = document.getElementById('generatePassword');
    const copyButton = document.getElementById('copyPassword');
    const copyMessage = document.getElementById('copyMessage');
    const strengthIndicator = document.getElementById('strengthIndicator');

    // Conjuntos de caracteres
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    // Adicionei mais alguns símbolos comuns para robustez
    const symbolChars = '!@#$%^&*()_-+=<>?/{}[]|.,:;~`'; 

    // Atualiza o valor do slider no span
    passwordLength.addEventListener('input', () => {
        lengthValue.textContent = passwordLength.value;
        // Opcional: Gerar senha automaticamente ao mudar o comprimento
        // generatePassword();
        // Atualiza a força da senha exibida, se houver uma
        if (passwordDisplay.value && passwordDisplay.value !== 'Selecione pelo menos um tipo de caractere!') {
            updateStrength(passwordDisplay.value);
        }
    });

    // Função para gerar a senha
    const generatePassword = () => {
        const length = parseInt(passwordLength.value);
        let characters = ''; // Conjunto total de caracteres disponíveis para a senha
        let generatedPasswordArray = []; // Array para construir a senha e depois embaralhar

        // Constrói o conjunto de caracteres a serem usados
        if (includeUppercase.checked) characters += uppercaseChars;
        if (includeLowercase.checked) characters += lowercaseChars;
        if (includeNumbers.checked) characters += numberChars;
        if (includeSymbols.checked) characters += symbolChars;

        // Validação: Nenhum tipo de caractere selecionado
        if (characters === '') {
            passwordDisplay.value = 'Selecione pelo menos um tipo de caractere!';
            updateStrength(''); // Limpa o indicador de força
            return;
        }

        // Garante que pelo menos um caractere de cada tipo selecionado esteja na senha
        // Isso melhora a robustez da senha e a "percepção" de força.
        if (includeUppercase.checked) {
            generatedPasswordArray.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
        }
        if (includeLowercase.checked) {
            generatedPasswordArray.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
        }
        if (includeNumbers.checked) {
            generatedPasswordArray.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
        }
        if (includeSymbols.checked) {
            generatedPasswordArray.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
        }

        // Preenche o restante da senha até o comprimento desejado
        // Certifica-se de que não tentamos adicionar mais caracteres do que o comprimento total permite
        for (let i = generatedPasswordArray.length; i < length; i++) {
            generatedPasswordArray.push(characters[Math.floor(Math.random() * characters.length)]);
        }

        // Embaralha a senha para garantir que os caracteres obrigatórios não fiquem sempre no início
        // `sort(() => Math.random() - 0.5)` é uma maneira comum de embaralhar arrays em JS.
        generatedPasswordArray = generatedPasswordArray.sort(() => Math.random() - 0.5);

        // Junta o array de caracteres para formar a string final da senha
        const finalPassword = generatedPasswordArray.join('');

        passwordDisplay.value = finalPassword; // Exibe a senha
        updateStrength(finalPassword); // Atualiza o indicador de força
    };

    // Função para avaliar a força da senha (Exemplo simples e visual)
    const updateStrength = (password) => {
        let score = 0; // Pontuação para determinar a força

        // Pontuação baseada no comprimento
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (password.length >= 16) score++; // Forte acima de 16

        // Pontuação baseada na inclusão de tipos de caracteres
        if (includeUppercase.checked) score++;
        if (includeLowercase.checked) score++;
        if (includeNumbers.checked) score++;
        if (includeSymbols.checked) score++;

        strengthIndicator.className = ''; // Limpa classes CSS anteriores
        strengthIndicator.classList.add('strength-indicator'); // Adiciona a classe base

        if (password.length === 0 || password === 'Selecione pelo menos um tipo de caractere!') {
            strengthIndicator.textContent = ''; // Limpa o texto se não houver senha ou for mensagem de erro
            strengthIndicator.style.width = '0%'; // Garante que a barra esteja vazia
        } else if (score <= 3) {
            strengthIndicator.textContent = 'Fraca';
            strengthIndicator.classList.add('weak');
            strengthIndicator.style.width = '30%'; // Exemplo visual de barra
        } else if (score <= 5) {
            strengthIndicator.textContent = 'Média';
            strengthIndicator.classList.add('medium');
            strengthIndicator.style.width = '60%'; // Exemplo visual de barra
        } else { // Senha forte
            strengthIndicator.textContent = 'Forte';
            strengthIndicator.classList.add('strong');
            strengthIndicator.style.width = '100%'; // Exemplo visual de barra
        }
    };

    // Função para copiar a senha para a área de transferência
    const copyPassword = () => {
        passwordDisplay.select(); // Seleciona o texto no input
        passwordDisplay.setSelectionRange(0, 99999); // Para mobile
        navigator.clipboard.writeText(passwordDisplay.value)
            .then(() => {
                copyMessage.textContent = 'Copiado!';
                copyMessage.classList.add('show'); // Exibe a mensagem de copiado
                setTimeout(() => {
                    copyMessage.classList.remove('show');
                    copyMessage.textContent = ''; // Limpa a mensagem
                }, 1500); // Esconde após 1.5 segundos
            })
            .catch(err => {
                console.error('Erro ao copiar a senha:', err);
                copyMessage.textContent = 'Falha ao copiar!';
                copyMessage.classList.add('show', 'error');
                setTimeout(() => {
                    copyMessage.classList.remove('show', 'error');
                    copyMessage.textContent = '';
                }, 1500);
            });
    };

    // Adiciona event listeners aos botões e checkboxes
    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyPassword);

    // Event listeners para as checkboxes, para regenerar a senha e atualizar a força
    [includeUppercase, includeLowercase, includeNumbers, includeSymbols].forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            generatePassword();
        });
    });

    // Gera uma senha inicial quando a página é carregada
    generatePassword();
});
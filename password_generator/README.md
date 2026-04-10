# Gerador de Senhas Fortes (Web - HTML, CSS, JavaScript)

## Visão Geral do Projeto

Este projeto é um gerador de senhas robusto e interativo desenvolvido com HTML, CSS e JavaScript puros. Ele oferece uma interface amigável para que os usuários possam criar senhas fortes e personalizadas, definindo o comprimento e os tipos de caracteres a serem incluídos.

É um excelente projeto para adicionar ao seu portfólio, demonstrando suas habilidades em:
* **Desenvolvimento Front-end:** Construção de interfaces de usuário responsivas e interativas.
* **HTML:** Estrutura semântica de páginas web.
* **CSS:** Estilização moderna e responsiva, incluindo customização de elementos de formulário.
* **JavaScript:** Lógica de manipulação de DOM, tratamento de eventos, geração de conteúdo dinâmico, uso da API Clipboard para copiar texto e algoritmos de aleatoriedade/embaralhamento.
* **Experiência do Usuário (UX):** Feedback visual para força da senha e confirmação de cópia.

## Funcionalidades

* **Comprimento Configurável:** Slider para ajustar o comprimento da senha (4 a 32 caracteres).
* **Seleção de Tipos de Caracteres:** Checkboxes para incluir ou excluir:
    * Letras maiúsculas (A-Z)
    * Letras minúsculas (a-z)
    * Números (0-9)
    * Símbolos especiais (!@#$%...)
* **Garantia de Diversidade:** A senha gerada garante que, se um tipo de caractere for selecionado, pelo menos um caractere desse tipo será incluído, aumentando a complexidade.
* **Embaralhamento Inteligente:** A senha é embaralhada para garantir a máxima aleatoriedade e prevenir padrões previsíveis.
* **Indicador Visual de Força:** Uma barra de progresso colorida que avalia e exibe a força da senha em tempo real (Fraca, Média, Forte).
* **Cópia Rápida:** Botão para copiar instantaneamente a senha gerada para a área de transferência, com feedback visual.
* **Responsivo:** Design adaptado para funcionar bem em dispositivos móveis e desktops.

## Tecnologias Utilizadas

* **HTML5:** Estrutura da página web.
* **CSS3:** Estilização e responsividade da interface.
* **JavaScript (ES6+):** Lógica principal, manipulação de DOM, eventos, algoritmo de geração de senha e API de Clipboard.
* **Google Fonts:** Utilizado para melhorar a tipografia (`Roboto` e `Space Mono`).

## Como Configurar e Executar

### Pré-requisitos

* Um navegador web moderno (Google Chrome, Firefox, Edge, Safari).

### 1. Clonar o Repositório (ou baixar os arquivos)

Primeiro, clone este repositório para sua máquina local:

```bash
git clone [https://github.com/SEU_USUARIO/password_generator_web.git](https://github.com/SEU_USUARIO/password_generator_web.git)
cd password_generator_web
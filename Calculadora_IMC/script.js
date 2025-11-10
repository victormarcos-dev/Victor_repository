document.getElementById("calcular").addEventListener("click", function() {
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const resultado = document.getElementById("resultado");

    if (!peso || !altura) {
        resultado.innerHTML = "Preencha todos os campos!";
        resultado.style.color = "red";
        return;
    }

    const imc = peso / (altura * altura);
    let classificacao = "";

    if (imc < 18.5) {
        classificacao = "Abaixo do peso";
    } else if (imc < 24.9) {
        classificacao = "Peso normal";
    } else if (imc < 29.9) {
        classificacao = "Sobrepeso";
    } else if (imc < 34.9) {
        classificacao = "Obesidade grau I";
    } else if (imc < 39.9) {
        classificacao = "Obesidade grau II";
    } else {
        classificacao = "Obesidade grau III";
    }

    resultado.innerHTML = `Seu IMC é <strong>${imc.toFixed(2)}</strong> (${classificacao})`;
    if (imc < 18.5) {
        resultado.style.color = "#da7422"
    }
    else if (imc < 24.9) {
       resultado.style.color = "#88ff00ff" 
    }
    else {
       resultado.style.color = "#ff0000ff"; 
    }
    
});

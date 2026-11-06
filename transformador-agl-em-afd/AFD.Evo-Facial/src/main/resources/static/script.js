document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const fileLabel = document.getElementById('fileLabel');
    const btnConverter = document.getElementById('btnConverter');
    const resultadoDiv = document.getElementById('resultado');
    const erroBox = document.getElementById('erroBox');
    const downloadLink = document.getElementById('downloadLink');

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            fileLabel.textContent = fileInput.files[0].name;
            btnConverter.disabled = false;
            erroBox.style.display = 'none';
            resultadoDiv.style.display = 'none';
        }
    });

    btnConverter.addEventListener('click', processarFicheiro);

    function processarFicheiro() {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const conteudo = e.target.result;
                const linhas = conteudo.split(/\r?\n/);
                const marcacoes = [];

                for (let i = 0; i < linhas.length; i++) {
                    let linha = linhas[i].trim();
                    if (!linha) continue;

                    // Ignora a linha de cabeçalho inicial (ex: começa com "No")
                    if (i === 0 && linha.toLowerCase().includes('no') && linha.toLowerCase().includes('datetime')) {
                        continue;
                    }

                    // 1. TENTA LER NO FORMATO TABULAR DO AGL (Ex: 2  1  16  DANIELE... 0  8  2024/12/17 17:17:00)
                    // Procura por uma data no formato YYYY/MM/DD ou YYYY-MM-DD seguida de hora HH:MM:SS no fim da linha
                    const matchDataHora = linha.match(/(\d{4}[-/]\d{2}[-/]\d{2})\s+(\d{2}:\d{2}:\d{2})/);
                    
                    if (matchDataHora) {
                        const dataOriginal = matchDataHora[1]; // YYYY/MM/DD ou YYYY-MM-DD
                        const horaCompleta = matchDataHora[2]; // HH:MM:SS
                        const hora = horaCompleta.substring(0, 5); // HH:MM

                        // Divide a linha por espaços múltiplos para pegar as colunas
                        const partes = linha.split(/\s+/);
                        
                        // O EnNo (Matrícula/ID) geralmente está na 3ª coluna (índice 2)
                        // Vamos garantir que apanhamos um número de matrícula válido
                        let identificador = null;
                        if (partes.length >= 3) {
                            // Tenta pegar o terceiro elemento se for numérico
                            if (/^\d+$/.test(partes[2])) {
                                identificador = partes[2];
                            }
                        }

                        // Se não pegou pela 3ª coluna, procura o primeiro número grande após o TMNo
                        if (!identificador) {
                            for (let p = 1; p < partes.length; p++) {
                                if (/^\d{1,12}$/.test(partes[p]) && partes[p] !== partes[0]) {
                                    identificador = partes[p];
                                    break;
                                }
                            }
                        }

                        if (identificador) {
                            // Formata data de YYYY/MM/DD para DD/MM/YYYY
                            const dataLimpa = dataOriginal.replace(/-/g, '/');
                            const [ano, mes, dia] = dataLimpa.split('/');
                            const dataBr = `${dia}/${mes}/${ano}`;

                            marcacoes.push(`${identificador}\t${dataBr}\t${hora}`);
                            continue;
                        }
                    }

                    // 2. TENTA PROCESSAR COMO AFD OFICIAL (Portaria 671) caso venha misturado
                    const matchIso = linha.match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
                    if (matchIso) {
                        const dataIso = matchIso[1];
                        const hora = matchIso[2].substring(0, 5);
                        const matchPis = linha.match(/T\d{2}:\d{2}:\d{2}[+-]\d{4}(\d{11,12})/);
                        let identificador = matchPis ? matchPis[1] : null;

                        if (!identificador) {
                            const digits = linha.match(/\b\d{11,12}\b/);
                            if (digits) identificador = digits[0];
                        }

                        if (identificador) {
                            const [ano, mes, dia] = dataIso.split('-');
                            const dataBr = `${dia}/${mes}/${ano}`;
                            marcacoes.push(`${identificador}\t${dataBr}\t${hora}`);
                        }
                    }
                }

                if (marcacoes.length === 0) {
                    throw new Error("Nenhuma marcação válida foi encontrada no ficheiro. Verifique o formato.");
                }

                // Gera o conteúdo final para download
                const textoFinal = marcacoes.join('\r\n');
                const blob = new Blob([textoFinal], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                downloadLink.href = url;
                resultadoDiv.style.display = 'block';
                erroBox.style.display = 'none';

            } catch (err) {
                erroBox.textContent = err.message;
                erroBox.style.display = 'block';
                resultadoDiv.style.display = 'none';
            }
        };
        reader.readAsText(file, 'UTF-8');
    }
});

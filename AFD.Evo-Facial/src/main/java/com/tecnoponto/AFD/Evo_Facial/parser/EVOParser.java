package com.tecnoponto.AFD.Evo_Facial.parser;

import com.tecnoponto.AFD.Evo_Facial.model.Marcacao;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class EVOParser {

    private static final DateTimeFormatter FORMATO_DATA_HORA =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXX");

    public List<Marcacao> interpretar(List<String> linhas) {

        List<Marcacao> marcacoes = new ArrayList<>();

        for (int i = 0; i < linhas.size(); i++) {
            String linha = linhas.get(i);

            if (linha == null || linha.isBlank()) {
                continue;
            }

            // Remove possível BOM no início do arquivo
            if (i == 0) {
                linha = linha.replace("\uFEFF", "");
            }

            // Só processa registros do tipo 7 (marcação de ponto REP-P)
            if (linha.length() < 10 || linha.charAt(9) != '7') {
                continue;
            }

            try {
                // NSR           → posições 1-9
                // Tipo          → posição 10 (já validamos que é '7')
                // DataHora Marc → posições 11-34 (24 caracteres)
                // CPF           → posições 35-46 (12 caracteres)

                String dataHoraMarcacaoStr = linha.substring(10, 34);
                String cpf = linha.substring(34, 46).trim();

                LocalDateTime dataHora = LocalDateTime.parse(dataHoraMarcacaoStr, FORMATO_DATA_HORA);

                LocalDate data = dataHora.toLocalDate();
                LocalTime hora = dataHora.toLocalTime();

                // Remove zeros à esquerda do CPF se quiser (opcional)
                // cpf = cpf.replaceFirst("^0+(?!$)", "");

                marcacoes.add(new Marcacao(cpf, data, hora));

            } catch (Exception e) {
                throw new IllegalArgumentException(
                        "Erro ao processar linha " + (i + 1) + ": " + e.getMessage()
                );
            }
        }

        if (marcacoes.isEmpty()) {
            throw new IllegalArgumentException(
                    "Nenhuma marcação do tipo 7 (REP-P) foi encontrada no arquivo."
            );
        }

        return marcacoes;
    }
}
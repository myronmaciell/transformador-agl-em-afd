package com.tecnoponto.AFD.Evo_Facial.service;

import com.tecnoponto.AFD.Evo_Facial.model.Marcacao;
import com.tecnoponto.AFD.Evo_Facial.parser.EVOParser;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class ArquivoBatidasEVOService {

    private final EVOParser evoParser = new EVOParser();

    public List<Marcacao> lerArquivo(Path caminho) {

        try {
            List<String> linhas = Files.readAllLines(
                    caminho,
                    StandardCharsets.UTF_8
            );

            return evoParser.interpretar(linhas);

        } catch (IOException e) {

            throw new RuntimeException(

                    "Erro ao ler o arquivo EVO: " + e.getMessage(), e
            );
        }
    }
}
package br.com.fecaf.controller;

import br.com.fecaf.model.Lembrete;
import br.com.fecaf.model.LembreteChecklist;
import br.com.fecaf.model.User;
import br.com.fecaf.repository.UserRepository;
import br.com.fecaf.services.LembreteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lembretes")
@CrossOrigin(origins = "http://localhost/5500", allowedHeaders = "*")
public class LembreteController {

    @Autowired
    private LembreteService lembreteService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/criar/{userId}")
    public ResponseEntity<Lembrete> criarLembrete(@RequestBody Lembrete lembrete, @PathVariable int userId) {

        System.out.println("Cheguei aqui");
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        lembrete.setUsuario(user);

        if (lembrete.getChecklist() != null) {
            lembrete.getChecklist().forEach(item -> item.setLembrete(lembrete));
        }

        Lembrete salvo = lembreteService.salvar(lembrete);
        return ResponseEntity.ok(salvo);
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Lembrete>> listarLembretes(@PathVariable int userId) {
        List<Lembrete> lembretes = lembreteService.listarPorUsuario(userId);
        return ResponseEntity.ok(lembretes);
    }

    @PutMapping("/editar/{lembreteId}")
    public ResponseEntity<Lembrete> editarLembrete(@RequestBody Lembrete lembreteAtualizado, @PathVariable int lembreteId) {
        Lembrete existente = lembreteService.buscarPorId(lembreteId);

        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        // Atualiza os campos
        existente.setTitulo(lembreteAtualizado.getTitulo());
        existente.setData(lembreteAtualizado.getData());
        existente.setHora(lembreteAtualizado.getHora());
        existente.setPrioridade(lembreteAtualizado.getPrioridade());
        existente.setTipoConteudo(lembreteAtualizado.getTipoConteudo());
        existente.setDescricao(lembreteAtualizado.getDescricao());
        existente.setCor(lembreteAtualizado.getCor());
        existente.setCategorias(lembreteAtualizado.getCategorias());

        if (lembreteAtualizado.getChecklist() != null) {
            List<LembreteChecklist> checklistExistente = existente.getChecklist();
            checklistExistente.clear();
            for (LembreteChecklist item : lembreteAtualizado.getChecklist()) {
                item.setLembrete(existente);
                checklistExistente.add(item);
            }
        }

        Lembrete salvo = lembreteService.salvar(existente);
        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/deletar/{lembreteId}")
    public ResponseEntity<Void> deletarLembrete(@PathVariable Long lembreteId){
        Lembrete existente = lembreteService.buscarPorId(lembreteId);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        lembreteService.deletar(lembreteId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/concluir/{lembreteId}")
    public ResponseEntity<?> concluirLembrete(@PathVariable Long lembreteId) {
        Lembrete lembrete = lembreteService.buscarPorId(lembreteId);
        if (lembrete == null) {
            return ResponseEntity.notFound().build();
        }
        lembrete.setConcluido(true);
        lembreteService.salvar(lembrete);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/desconcluir/{lembreteId}")
    public ResponseEntity<?> desconcluirLembrete(@PathVariable Long lembreteId) {
        Lembrete lembrete = lembreteService.buscarPorId(lembreteId);
        if (lembrete == null) {
            return ResponseEntity.notFound().build();
        }
        lembrete.setConcluido(false);
        lembreteService.salvar(lembrete);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/checklist/{itemId}/check")
    public ResponseEntity<Void> marcarChecklist(@PathVariable int itemId) {
        lembreteService.marcarChecklist(itemId, true);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/checklist/{itemId}/uncheck")
    public ResponseEntity<Void> desmarcarChecklist(@PathVariable int itemId) {
        lembreteService.marcarChecklist(itemId, false);
        return ResponseEntity.ok().build();
    }
}
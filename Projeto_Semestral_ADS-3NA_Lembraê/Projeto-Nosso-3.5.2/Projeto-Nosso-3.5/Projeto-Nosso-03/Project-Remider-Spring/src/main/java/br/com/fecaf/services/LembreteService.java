package br.com.fecaf.services;

import br.com.fecaf.model.Lembrete;
import br.com.fecaf.model.LembreteChecklist;
import br.com.fecaf.repository.LembreteChecklistRepository;
import br.com.fecaf.repository.LembreteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LembreteService {

    @Autowired
    private LembreteRepository lembreteRepository;

    public Lembrete buscarPorId(long id) {
        return lembreteRepository.findById(id).orElse(null);
    }

    public List<Lembrete> listarPorUsuario(int userId) {
        return lembreteRepository.findByUsuarioId(userId);
    }

    public Lembrete salvar(Lembrete lembrete) {
        return lembreteRepository.save(lembrete);
    }

    public void deletar(Long id) {
        lembreteRepository.deleteById(id);
    }

    @Autowired
    private LembreteChecklistRepository checklistRepository;

    public void marcarChecklist(int itemId, boolean checked) {
        LembreteChecklist item = checklistRepository.findById(itemId).orElse(null);
        if (item != null) {
            item.setChecked(checked);
            checklistRepository.save(item);
        }
    }
}

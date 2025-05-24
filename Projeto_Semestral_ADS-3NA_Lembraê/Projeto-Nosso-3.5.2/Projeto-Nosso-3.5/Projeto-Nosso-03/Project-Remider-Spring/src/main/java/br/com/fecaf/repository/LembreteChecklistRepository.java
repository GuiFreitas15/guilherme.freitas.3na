package br.com.fecaf.repository;

import br.com.fecaf.model.LembreteChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LembreteChecklistRepository extends JpaRepository<LembreteChecklist, Integer> {
}
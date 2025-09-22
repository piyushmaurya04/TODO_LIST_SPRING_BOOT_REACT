package com.Todo.todo_list.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Todo.todo_list.Entity.Todo;
import com.Todo.todo_list.Entity.User;
import com.Todo.todo_list.Repository.TodoRepository;

@Service
@Transactional
public class TodoServices {

    private final TodoRepository todoRepository;

    // Constructor injection
    public TodoServices(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    // User-specific methods
    public List<Todo> findByUser(User user) {
        return todoRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Todo findByIdAndUser(Long id, User user) {
        Optional<Todo> todo = todoRepository.findByIdAndUser(id, user);
        return todo.orElse(null);
    }

    public List<Todo> findByUserAndCompleted(User user, boolean completed) {
        return todoRepository.findByUserAndCompleted(user, completed);
    }

    public List<Todo> findByUserAndStatus(User user, Todo.Status status) {
        return todoRepository.findByUserAndStatus(user, status);
    }

    public List<Todo> findByUserAndPriority(User user, Todo.Priority priority) {
        return todoRepository.findByUserAndPriority(user, priority);
    }

    public List<Todo> searchTodos(User user, String searchTerm) {
        return todoRepository.findByUserAndTitleOrDescriptionContaining(user, searchTerm);
    }

    public long countByUserAndCompleted(User user, boolean completed) {
        return todoRepository.countByUserAndCompleted(user, completed);
    }

    public long countByUserAndStatus(User user, Todo.Status status) {
        return todoRepository.countByUserAndStatus(user, status);
    }

    // Legacy methods (for backward compatibility)
    public List<Todo> findByCompleted() {
        return todoRepository.findAll();
    }

    public List<Todo> findAll() {
        return todoRepository.findAll();
    }

    public Todo save(Todo todo) {
        return todoRepository.save(todo);
    }

    public void deleteById(Long id) {
        todoRepository.deleteById(id);
    }

    public Optional<Todo> findById(Long id) {
        return todoRepository.findById(id);
    }

}

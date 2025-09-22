package com.Todo.todo_list.Controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Todo.todo_list.Entity.Todo;
import com.Todo.todo_list.Entity.User;
import com.Todo.todo_list.Service.TodoServices;
import com.Todo.todo_list.Service.AuthService;

@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:8080" }, allowCredentials = "true")
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoServices todoServices;

    @Autowired
    private AuthService authService;

    /**
     * Get all todos for the authenticated user
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTodos(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            List<Todo> todos = todoServices.findByUser(currentUser);
            response.put("success", true);
            response.put("todos", todos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch todos");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Create a new todo for the authenticated user
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTodo(@RequestBody TodoRequest todoRequest, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            Todo todo = new Todo();
            todo.setTitle(todoRequest.getTitle());
            todo.setDescription(todoRequest.getDescription());
            todo.setDate(todoRequest.getDate());
            todo.setUser(currentUser);

            // Set priority, default to MEDIUM if not provided
            if (todoRequest.getPriority() != null) {
                todo.setPriority(Todo.Priority.valueOf(todoRequest.getPriority().toUpperCase()));
            } else {
                todo.setPriority(Todo.Priority.MEDIUM);
            }

            // Set status, default to PENDING if not provided
            if (todoRequest.getStatus() != null) {
                todo.setStatus(Todo.Status.valueOf(todoRequest.getStatus().toUpperCase()));
            } else {
                todo.setStatus(Todo.Status.PENDING);
            }
            // Set completed flag based on status
            if (todo.getStatus() == Todo.Status.COMPLETED) {
                todo.setCompleted(true);
            } else {
                todo.setCompleted(false);
            }

            Todo savedTodo = todoServices.save(todo);

            response.put("success", true);
            response.put("todo", savedTodo);
            response.put("message", "Todo created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create todo: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update a todo for the authenticated user
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTodo(@PathVariable Long id, @RequestBody TodoRequest todoRequest,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            Todo existingTodo = todoServices.findByIdAndUser(id, currentUser);
            if (existingTodo == null) {
                response.put("success", false);
                response.put("message", "Todo not found or access denied");
                return ResponseEntity.notFound().build();
            }

            // Update fields
            existingTodo.setTitle(todoRequest.getTitle());
            existingTodo.setDescription(todoRequest.getDescription());
            existingTodo.setDate(todoRequest.getDate());
            existingTodo.setCompleted(todoRequest.isCompleted());

            if (todoRequest.getPriority() != null) {
                existingTodo.setPriority(Todo.Priority.valueOf(todoRequest.getPriority().toUpperCase()));
            }

            // Fix: update status if provided
            if (todoRequest.getStatus() != null) {
                existingTodo.setStatus(Todo.Status.valueOf(todoRequest.getStatus().toUpperCase()));
                // Set completed flag based on status
                if (existingTodo.getStatus() == Todo.Status.COMPLETED) {
                    existingTodo.setCompleted(true);
                } else {
                    existingTodo.setCompleted(false);
                }
            }

            Todo updatedTodo = todoServices.save(existingTodo);

            response.put("success", true);
            response.put("todo", updatedTodo);
            response.put("message", "Todo updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update todo: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete a todo for the authenticated user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTodo(@PathVariable Long id, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            Todo existingTodo = todoServices.findByIdAndUser(id, currentUser);
            if (existingTodo == null) {
                response.put("success", false);
                response.put("message", "Todo not found or access denied");
                return ResponseEntity.notFound().build();
            }

            todoServices.deleteById(id);

            response.put("success", true);
            response.put("message", "Todo deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete todo: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Toggle todo completion status
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleTodoCompletion(@PathVariable Long id, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User currentUser = authService.getCurrentUser(session);
        if (currentUser == null) {
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        try {
            Todo existingTodo = todoServices.findByIdAndUser(id, currentUser);
            if (existingTodo == null) {
                response.put("success", false);
                response.put("message", "Todo not found or access denied");
                return ResponseEntity.notFound().build();
            }

            existingTodo.setCompleted(!existingTodo.isCompleted());
            Todo updatedTodo = todoServices.save(existingTodo);

            response.put("success", true);
            response.put("todo", updatedTodo);
            response.put("message", "Todo status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to toggle todo: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // DTO for todo requests
    public static class TodoRequest {
        private String title;
        private String description;
        private String date;
        private String priority;
        private String status;
        private boolean completed;

        // Getters and setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public boolean isCompleted() {
            return completed;
        }

        public void setCompleted(boolean completed) {
            this.completed = completed;
        }
    }

}

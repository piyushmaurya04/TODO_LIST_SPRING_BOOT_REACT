package com.Todo.todo_list.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Todo.todo_list.Entity.Todo;
import com.Todo.todo_list.Entity.User;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // Find all todos for a specific user
    List<Todo> findByUserOrderByCreatedAtDesc(User user);

    // Find todos by user ID
    List<Todo> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find completed todos for a user
    List<Todo> findByUserAndCompleted(User user, boolean completed);

    // Find todos by status for a user
    List<Todo> findByUserAndStatus(User user, Todo.Status status);

    // Find todos by priority for a user
    List<Todo> findByUserAndPriority(User user, Todo.Priority priority);

    // Find todo by ID and user (for security - user can only access their own
    // todos)
    Optional<Todo> findByIdAndUser(Long id, User user);

    // Search todos by title or description for a user
    @Query("SELECT t FROM Todo t WHERE t.user = :user AND " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Todo> findByUserAndTitleOrDescriptionContaining(@Param("user") User user,
            @Param("searchTerm") String searchTerm);

    // Count todos by status for a user
    long countByUserAndStatus(User user, Todo.Status status);

    // Count completed vs pending todos for a user
    long countByUserAndCompleted(User user, boolean completed);

    // Delete all todos for a user
    void deleteByUser(User user);

    // Legacy methods for backward compatibility
    List<Todo> findByCompleted(boolean completed);
}

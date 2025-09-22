package com.Todo.todo_list.Repository;

import com.Todo.todo_list.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by username
    Optional<User> findByUsername(String username);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Find user by username or email
    Optional<User> findByUsernameOrEmail(String username, String email);

    // Check if username exists
    boolean existsByUsername(String username);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find active users
    List<User> findByIsActiveTrue();

    // Find users by first or last name (case insensitive)
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByFirstNameOrLastNameContainingIgnoreCase(@Param("name") String name);

    // Find user with their todos
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.todos WHERE u.username = :username")
    Optional<User> findByUsernameWithTodos(@Param("username") String username);
}
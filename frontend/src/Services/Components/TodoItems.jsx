import { useState, useEffect } from 'react';
import './TodoItems.css';

function TodoItems({ todo, updateTodo, deleteTodo, animationDelay = 0 }) {
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Always use backend enum values for status in editForm
    const [editForm, setEditForm] = useState({ title: todo.title, description: todo.description, date: todo.date, priority: todo.priority, status: todo.status });

    // Keep editForm.status in sync with todo.status
    useEffect(() => {
        setEditForm(prev => ({ ...prev, status: todo.status }));
    }, [todo.status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, animationDelay * 1000);
        return () => clearTimeout(timer);
    }, [animationDelay]);

    const handleUpdate = async () => {
        if (todo.status === 'Completed') return;

        setIsCompleting(true);
        const updatedTodo = { ...todo, status: 'Completed' };

        setTimeout(() => {
            updateTodo(todo.id, updatedTodo);
            setIsCompleting(false);
        }, 800);
    };


    const handleDelete = () => {
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = () => {
        setIsDeleting(true);
        setShowDeletePopup(false);
        setTimeout(() => {
            deleteTodo(todo.id);
        }, 500);
    };

    const handleCancelDelete = () => {
        setShowDeletePopup(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditForm({
            title: todo.title,
            description: todo.description,
            date: todo.date,
            priority: todo.priority,
            status: todo.status
        });
    };

    const handleSaveEdit = async () => {
        try {
            // Always send backend enum value
            const updatedTodo = { ...todo, ...editForm, status: editForm.status };
            await updateTodo(todo.id, updatedTodo);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            title: todo.title,
            description: todo.description,
            date: todo.date,
            priority: todo.priority,
            status: todo.status
        });
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getCardClasses = () => {
        let classes = ['todo-card'];

        if (!isVisible) classes.push('entering');
        if (isCompleting) classes.push('completing');
        if (isDeleting) classes.push('deleting');
        if (isEditing) classes.push('editing');
        if (todo.status === 'Completed') classes.push('completed');

        // Priority classes
        if (todo.priority === 'High') classes.push('high-priority');
        else if (todo.priority === 'Medium') classes.push('medium-priority');
        else if (todo.priority === 'Low') classes.push('low-priority');

        return classes.join(' ');
    };

    return (
        <>
            <div className={getCardClasses()}>
                {showDeletePopup ? (
                    <div className="delete-confirm-inline">
                        <div className="delete-confirm-message">
                            <span className="delete-popup-icon">🗑️</span>
                            <div>Are you sure you want to delete <b>{todo.title}</b>?</div>
                        </div>
                        <div className="delete-confirm-actions">
                            <button className="delete-cancel-btn" onClick={handleCancelDelete}>Cancel</button>
                            <button className="delete-confirm-btn" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                ) : isEditing ? (
                    <>
                        {/* Edit Mode */}
                        <div className="edit-form">
                            {/* ...existing code... */}
                        </div>
                    </>
                ) : (
                    <>
                        {/* View Mode */}
                        <div className="todo-header">
                            <h3 className="todo-title">{todo.title}</h3>
                            <span className={`priority-badge ${todo.priority && todo.priority.toLowerCase()}`}>{todo.priority}</span>
                        </div>

                        <p className="todo-description">{todo.description}</p>

                        <div className="todo-meta">
                            <div className="todo-date">{todo.date}</div>
                            <div className={`todo-status ${todo.status && todo.status.toLowerCase().replace('_', '-')}`}>{
                                ['PENDING', 'Pending'].includes(todo.status) ? 'Pending' :
                                    ['IN_PROGRESS', 'In Progress'].includes(todo.status) ? 'In Progress' :
                                        ['COMPLETED', 'Completed'].includes(todo.status) ? 'Completed' : todo.status
                            }</div>
                        </div>
                        {!isEditing && (
                            <div className="todo-actions">
                                <button
                                    className="action-btn complete-btn"
                                    onClick={handleUpdate}
                                    disabled={todo.status === 'Completed' || isCompleting}
                                >
                                    <span className="btn-icon">
                                        {todo.status === 'Completed' ? '✅' : '✓'}
                                    </span>
                                    {todo.status === 'Completed' ? 'Completed' : 'Complete'}
                                </button>

                                <button
                                    className="action-btn edit-btn"
                                    onClick={handleEdit}
                                    disabled={isEditing}
                                >
                                    <span className="btn-icon">✏️</span>
                                    Edit
                                </button>

                                <button
                                    className="action-btn delete-btn"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <span className="btn-icon">🗑️</span>
                                    Delete
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default TodoItems;

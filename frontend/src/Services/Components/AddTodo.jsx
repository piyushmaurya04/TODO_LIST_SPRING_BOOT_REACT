import { useState } from "react";
import './AddTodo.css';

function AddTodo({ addtodo }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('Pending');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!date) {
            newErrors.date = 'Due date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Map status to backend enum
            let backendStatus = status;
            if (status === 'In Progress') backendStatus = 'IN_PROGRESS';
            else if (status === 'Pending') backendStatus = 'PENDING';
            else if (status === 'Completed') backendStatus = 'COMPLETED';
            await addtodo(title, description, date, priority, backendStatus);

            // Show success feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            // Reset form
            setTitle('');
            setDescription('');
            setDate('');
            setPriority('Medium');
            setStatus('Pending');
            setErrors({});

        } catch (error) {
            console.error('Error adding todo:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="add-todo-container">
            <div className="form-header">
                <h2 className="form-title">Create New Todo</h2>
                <p className="form-subtitle">Add a new task to your productivity journey</p>
            </div>

            <form className="todo-form" onSubmit={handleSubmit}>
                {/* Title Field */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <span className="input-icon">📝</span>
                        <input
                            type="text"
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                clearError('title');
                            }}
                            placeholder="Enter todo title..."
                            required
                        />
                    </div>
                    <label className="form-label">Title</label>
                    {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                {/* Due Date Field */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <span className="input-icon">📅</span>
                        <input
                            type="date"
                            className={`form-input ${errors.date ? 'error' : ''}`}
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                clearError('date');
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <label className="form-label">Due Date</label>
                    {errors.date && <div className="error-message">{errors.date}</div>}
                </div>

                {/* Description Field */}
                <div className="form-group full-width">
                    <div className="input-with-icon">
                        <span className="input-icon">📋</span>
                        <textarea
                            className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                clearError('description');
                            }}
                            placeholder="Describe your todo in detail..."
                            rows="3"
                            required
                        />
                    </div>
                    <label className="form-label">Description</label>
                    {errors.description && <div className="error-message">{errors.description}</div>}
                </div>

                {/* Priority Selection */}
                <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <div className="priority-selector">
                        <div
                            className={`priority-option low ${priority === 'Low' ? 'active' : ''}`}
                            onClick={() => setPriority('Low')}
                        >
                            🟢 Low
                        </div>
                        <div
                            className={`priority-option medium ${priority === 'Medium' ? 'active' : ''}`}
                            onClick={() => setPriority('Medium')}
                        >
                            🟡 Medium
                        </div>
                        <div
                            className={`priority-option high ${priority === 'High' ? 'active' : ''}`}
                            onClick={() => setPriority('High')}
                        >
                            🔴 High
                        </div>
                    </div>
                </div>

                {/* Status Field */}
                <div className="form-group">
                    <div className="input-with-icon">
                        <span className="input-icon">🔄</span>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Pending">📋 Pending</option>
                            <option value="In Progress">⚡ In Progress</option>
                            <option value="Completed">✅ Completed</option>
                        </select>
                    </div>
                    <label className="form-label">Initial Status</label>
                </div>

                {/* Submit Button */}
                <div className="submit-button-container">
                    <button
                        type="submit"
                        className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Todo...' : '✨ Create Todo'}
                    </button>
                </div>
            </form>

            {/* Success Feedback */}
            {showSuccess && (
                <div className="success-feedback">
                    🎉 Todo created successfully!
                </div>
            )}
        </div>
    );
}
export default AddTodo;

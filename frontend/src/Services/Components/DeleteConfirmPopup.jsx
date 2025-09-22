import './DeleteConfirmPopup.css';

function DeleteConfirmPopup({ open, onCancel, onConfirm, todoTitle }) {
    if (!open) return null;
    return (
        <div className="delete-popup-backdrop show">
            <div className="delete-popup popup-in">
                <div className="delete-popup-header">
                    <span className="delete-popup-icon">🗑️</span>
                    <h3>Delete Todo?</h3>
                </div>
                <div className="delete-popup-body">
                    <p>Are you sure you want to delete <b>{todoTitle}</b>?</p>
                </div>
                <div className="delete-popup-actions">
                    <button className="delete-cancel-btn" onClick={onCancel}>Cancel</button>
                    <button className="delete-confirm-btn" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}


export default DeleteConfirmPopup;

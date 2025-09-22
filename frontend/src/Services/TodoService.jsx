import axios from 'axios';

class TodoService {
    constructor() {
        // Use relative URL for production (same server) or localhost for development
        this.API_URL = process.env.NODE_ENV === 'production' ? "/api/todos" : "http://localhost:8080/api/todos";

        // Configure axios defaults for this service
        this.axiosConfig = {
            withCredentials: true, // Include cookies for session-based auth
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }

    async getAllTodos() {
        const response = await axios.get(this.API_URL, this.axiosConfig);
        return response.data;
    }

    async createTodo(todo) {
        const response = await axios.post(this.API_URL, todo, this.axiosConfig);
        return response.data;
    }

    async updateTodo(id, todo) {
        const response = await axios.put(`${this.API_URL}/${id}`, todo, this.axiosConfig);
        return response.data;
    }

    async deleteTodo(id) {
        const response = await axios.delete(`${this.API_URL}/${id}`, this.axiosConfig);
        return response.status === 200;
    }
}

export default new TodoService();
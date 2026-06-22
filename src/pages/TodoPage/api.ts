import type { Todo } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://paxyo.com/backend/todos.php';

const HABIT_DELIMITER = ' ||| ';

function mapToTodo(data: any): Todo {
    let text = String(data.text || '');
    let habit: import('./types').HabitMetadata | undefined;

    if (text.includes(HABIT_DELIMITER)) {
        const parts = text.split(HABIT_DELIMITER);
        text = parts[0];
        try {
            const parsed = JSON.parse(parts[1]);
            // Ensure history is a proper record, not an array
            if (Array.isArray(parsed.history)) {
                parsed.history = {};
            }
            habit = parsed;
        } catch (e) {
            console.error('Failed to parse habit metadata', e);
        }
    }

    return {
        id: Number(data.id),
        user_id: Number(data.user_id),
        user_name: data.user_name || undefined,
        text: text,
        completed: data.completed === true || data.completed === 1 || data.completed === '1' || data.completed === 'true',
        completed_by: data.completed_by ? Number(data.completed_by) : undefined,
        created_at: String(data.created_at || ''),
        habit
    };
}

export async function fetchTodos(userId: number): Promise<Todo[]> {
    const response = await fetch(`${API_BASE}?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    const data = await response.json();
    return Array.isArray(data) ? data.map(mapToTodo) : [];
}

export async function addTodo(userId: number, text: string, habit?: import('./types').HabitMetadata, userName?: string): Promise<Todo> {
    const payloadText = habit ? `${text}${HABIT_DELIMITER}${JSON.stringify(habit)}` : text;
    const response = await fetch(`${API_BASE}?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payloadText, user_name: userName }),
    });
    if (!response.ok) throw new Error('Failed to add todo');
    const data = await response.json();
    return mapToTodo(data);
}

export async function updateTodo(userId: number, todoId: number, updates: Partial<Pick<Todo, 'completed' | 'text' | 'habit'>>): Promise<Todo> {
    const body: any = { ...updates };
    if (updates.text !== undefined || updates.habit !== undefined) {
        let newText = updates.text;
        if (updates.habit) {
            if (newText === undefined) throw new Error("Cannot update habit without providing text");
            newText = `${newText}${HABIT_DELIMITER}${JSON.stringify(updates.habit)}`;
            body.text = newText;
            delete body.habit;
        }
    }

    const response = await fetch(`${API_BASE}?user_id=${userId}&id=${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    const data = await response.json();
    return mapToTodo(data);
}

export async function deleteTodo(userId: number, todoId: number): Promise<void> {
    const response = await fetch(`${API_BASE}?user_id=${userId}&id=${todoId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
}

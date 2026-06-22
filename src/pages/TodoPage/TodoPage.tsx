import { useState, useEffect, useCallback, useMemo, type FC, memo } from 'react';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import type { Todo, Member } from './types';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api';
import {
    hapticSelection,
    hapticImpact,
    hapticNotification,
    showConfirm
} from '../../helpers/telegram';
import './TodoPage.css';

// ═══════════════════════════════════════════════════════════════
// MEMBER COLORS - Refined for distinction
// ═══════════════════════════════════════════════════════════════

const MEMBER_COLORS = [
    '#3498db', // Blue
    '#2ecc71', // Green
    '#e74c3c', // Red
    '#f1c40f', // Yellow
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e67e22', // Orange
    '#e91e63', // Pink
    '#bdc3c7', // Silver
    '#34495e', // Charcoal
];

const getColorForUser = (userId: any): string => {
    const idNum = Number(userId) || 0;
    // Hash shuffle for better distribution
    const hash = (idNum ^ (idNum >>> 16)) * 0x45d9f3b;
    const finalHash = (hash ^ (hash >>> 16)) >>> 0;
    const index = finalHash % MEMBER_COLORS.length;
    return MEMBER_COLORS[index];
};

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getWeekday = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
};

const parseDate = (dateStr: string): Date => {
    const cleaned = dateStr.replace(' ', 'T');
    return new Date(cleaned);
};

const TODAY = formatDate(new Date());

const isFutureDate = (dateStr: string) => dateStr > TODAY;
const isBeforeCreation = (dateStr: string, createdAt: string) => {
    if (!createdAt) return false;
    return dateStr < formatDate(parseDate(createdAt));
};

const getLastDays = (count: number) => {
    const days = [];
    for (let i = 0; i < count; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            date: formatDate(d),
            weekday: getWeekday(d),
            dayNum: d.getDate(),
            isToday: i === 0
        });
    }
    return days;
};

// ═══════════════════════════════════════════════════════════════
// HABIT ROW COMPONENT
// ═══════════════════════════════════════════════════════════════

const HabitRow = memo(({
    habit,
    displayDays,
    onToggle,
    onDelete
}: {
    habit: Todo,
    displayDays: any[],
    onToggle: (todo: Todo, dateStr: string) => void,
    onDelete: (id: number) => void
}) => {
    const creatorColor = getColorForUser(habit.user_id);

    return (
        <li className="habit-row">
            <div className="habit-info">
                <div className="habit-content">
                    {/* CREATOR: HOLLOW RING (Identity) */}
                    <div
                        className="creator-ring"
                        style={{ borderColor: creatorColor }}
                    />
                    <span className="habit-text">{habit.text}</span>
                </div>
            </div>

            {displayDays.map(day => {
                const checkerId = habit.habit?.history?.[day.date];
                const isDone = checkerId !== undefined;
                const isDisabled = isFutureDate(day.date) || isBeforeCreation(day.date, habit.created_at);

                // CHECKER: SOLID FILL (Action)
                const checkerColor = isDone ? getColorForUser(checkerId) : 'transparent';

                return (
                    <div
                        key={day.date}
                        className={`cell ${isDisabled ? 'disabled' : ''} ${isDone ? 'done' : ''}`}
                        style={{ backgroundColor: isDone ? checkerColor : undefined }}
                        onClick={() => !isDisabled && onToggle(habit, day.date)}
                    >
                        <span className="mark">
                            {isDisabled ? '·' : isDone ? '✓' : '○'}
                        </span>
                    </div>
                );
            })}
            <button className="del-btn" onClick={() => onDelete(habit.id)}>×</button>
        </li>
    );
});

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export const TodoPage: FC = () => {
    const initDataState = useSignal(initData.state);
    const userId = initDataState?.user?.id || 12345;
    const userName = initDataState?.user?.first_name || 'You';

    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'incomplete'>('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

    const displayDays = useMemo(() => getLastDays(5), []);

    const loadTodos = useCallback(async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const data = await fetchTodos(userId);
            setTodos(prev => {
                // Cheap heuristic: skip update if same length and same IDs  
                if (prev.length === data.length &&
                    prev.every((t, i) => t.id === data[i].id)) {
                    // Deep check only when structure matches (rare path)
                    const prevStr = JSON.stringify(prev);
                    const dataStr = JSON.stringify(data);
                    if (prevStr === dataStr) return prev;
                }
                return data;
            });
        } catch (err) { console.error(err); }
        finally { if (!silent) setIsLoading(false); }
    }, [userId]);

    useEffect(() => {
        loadTodos();
        const interval = setInterval(() => loadTodos(true), 12000);
        return () => clearInterval(interval);
    }, [loadTodos]);

    const members = useMemo((): Member[] => {
        const memberMap = new Map<number, Member>();
        memberMap.set(userId, { id: userId, name: userName, color: getColorForUser(userId) });

        todos.forEach(todo => {
            if (todo.user_id && !memberMap.has(todo.user_id)) {
                memberMap.set(todo.user_id, {
                    id: todo.user_id,
                    name: todo.user_name || `User ${todo.user_id}`,
                    color: getColorForUser(todo.user_id)
                });
            }
            if (todo.habit?.history) {
                Object.values(todo.habit.history).forEach(cId => {
                    const cidNum = Number(cId);
                    if (!memberMap.has(cidNum)) {
                        memberMap.set(cidNum, {
                            id: cidNum,
                            name: `User ${cidNum}`,
                            color: getColorForUser(cidNum)
                        });
                    }
                });
            }
        });
        return Array.from(memberMap.values());
    }, [todos, userId, userName]);

    const handleAddHabit = async () => {
        if (!inputValue.trim()) return;
        const textToSubmit = inputValue.trim();
        setInputValue('');
        const tempId = -Math.floor(Math.random() * 1000000);
        const tempTodo: Todo = {
            id: tempId, user_id: userId, user_name: userName, text: textToSubmit,
            completed: false, created_at: new Date().toISOString(),
            habit: { frequency: 'daily', streak: 0, history: {} }
        };
        setTodos(prev => [tempTodo, ...prev]);
        hapticNotification('success'); // FEEDBACK

        try {
            const newTodo = await addTodo(userId, textToSubmit, { frequency: 'daily', streak: 0, history: {} }, userName);
            setTodos(prev => prev.map(t => t.id === tempId ? newTodo : t));
        } catch (err) {
            setTodos(prev => prev.filter(t => t.id !== tempId));
            console.error(err);
            hapticNotification('error');
        }
    };

    const handleDayToggle = useCallback(async (todo: Todo, dateStr: string) => {
        if (!todo.habit || isFutureDate(dateStr) || isBeforeCreation(dateStr, todo.created_at)) return;

        hapticSelection(); // FEEDBACK

        const history = todo.habit.history || {};
        const isCompletedOnDate = history[dateStr] !== undefined;
        let newHistory = { ...history };
        if (isCompletedOnDate) {
            if (history[dateStr] === userId) delete newHistory[dateStr];
            else return;
        } else {
            newHistory[dateStr] = userId;
        }
        const newHabit = { ...todo.habit, history: newHistory };
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, habit: newHabit } : t));
        try { await updateTodo(userId, todo.id, { text: todo.text, habit: newHabit }); }
        catch (err) { loadTodos(true); console.error(err); }
    }, [userId, loadTodos]);

    const handleDelete = useCallback(async (todoId: number) => {
        // Native Telegram Confirm
        const confirmed = await showConfirm('Delete this habit?');
        if (!confirmed) return;

        hapticImpact('heavy'); // FEEDBACK
        setTodos(prev => prev.filter(t => t.id !== todoId));
        try { await deleteTodo(userId, todoId); }
        catch (err) { loadTodos(true); console.error(err); }
    }, [userId, loadTodos]);

    const filteredHabits = useMemo(() => {
        return todos.filter(t => t.habit).filter(habit => {
            const isTodayDone = habit.habit?.history?.[TODAY] !== undefined;
            if (filterMode === 'completed') return isTodayDone;
            if (filterMode === 'incomplete') return !isTodayDone;
            return true;
        });
    }, [todos, filterMode]);

    return (
        <div className="habits-container">
            <header className="habits-header">
                <h1 className="habits-title">Habits</h1>
                <div className="header-actions">
                    <button className="header-btn" onClick={() => setShowMembersModal(true)}>
                        <span className="member-count">{members.length}</span> 👥
                    </button>
                    <div className="filter-wrapper">
                        <button className={`header-btn ${filterMode !== 'all' ? 'active' : ''}`} onClick={() => setShowFilterMenu(!showFilterMenu)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                        </button>
                        {showFilterMenu && (
                            <div className="filter-menu">
                                <button className={`filter-option ${filterMode === 'all' ? 'selected' : ''}`} onClick={() => { setFilterMode('all'); setShowFilterMenu(false); }}>All</button>
                                <button className={`filter-option ${filterMode === 'completed' ? 'selected' : ''}`} onClick={() => { setFilterMode('completed'); setShowFilterMenu(false); }}>Done</button>
                                <button className={`filter-option ${filterMode === 'incomplete' ? 'selected' : ''}`} onClick={() => { setFilterMode('incomplete'); setShowFilterMenu(false); }}>Todo</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="days-header">
                <div className="days-header-spacer"></div>
                {displayDays.map(day => (
                    <div key={day.date} className={`day-col ${day.isToday ? 'today' : ''}`}>
                        <span className="day-letter">{day.weekday}</span>
                        <span className="day-num">{day.dayNum}</span>
                    </div>
                ))}
                <div className="del-col"></div>
            </div>

            <div className="add-section">
                <input className="add-input" placeholder="New habit..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()} />
                <button className="add-btn" onClick={handleAddHabit} disabled={!inputValue.trim()}>+</button>
            </div>

            {isLoading ? <div className="loading"><div className="spinner" /></div> : (
                <ul className="habits-list">
                    {filteredHabits.map(habit => (
                        <HabitRow key={habit.id} habit={habit} displayDays={displayDays} onToggle={handleDayToggle} onDelete={handleDelete} />
                    ))}
                </ul>
            )}

            {showMembersModal && (
                <>
                    <div className="overlay" onClick={() => setShowMembersModal(false)} />
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Members ({members.length})</h2>
                            <button className="close-btn" onClick={() => setShowMembersModal(false)}>×</button>
                        </div>
                        <ul className="members-list">
                            {members.map(member => (
                                <li key={member.id} className="member-item">
                                    <span className="member-dot" style={{ backgroundColor: member.color }}></span>
                                    <span className="member-name">{member.name}{member.id === userId && <span className="you-badge"> (you)</span>}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
            {showFilterMenu && <div className="overlay" onClick={() => setShowFilterMenu(false)} />}
        </div>
    );
};

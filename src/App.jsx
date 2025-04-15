import styles from './App.module.css';
import Table from './components/Table';
import { Form } from './components/Form';
import { SearchForm } from './components/SearchForm';
import { useEffect, useState, useRef } from 'react';

export const App = () => {
	const [todos, setTodos] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedTodo, setEditedTodo] = useState(null);
	const formInputRef = useRef(null);
	const [reset, setReset] = useState(false);

	const table = {
		title: {
			name: 'Задача',
		},

		edit: {
			name: 'Действие',
			component: (todo) => {
				return (
					<button onClick={() => editRegime(todo)} className={styles.editBtn}>
						Изменить
					</button>
				);
			},
		},
		delete: {
			name: 'Действие',
			component: (todo) => {
				return (
					<button onClick={() => delTodo(todo.id)} className={styles.delBtn}>
						Удалить
					</button>
				);
			},
		},
	};

	useEffect(() => {
		setIsLoading(true);
		fetch('http://localhost:3000/todos')
			.then((response) => response.json())
			.then((data) => {
				setTodos(data);
			})
			.finally(() => setIsLoading(false));
	}, [reset]);

	const newTodo = async (title) => {
		setIsLoading(true);
		try {
			const response = await fetch('http://localhost:3000/todos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json;charset=utf-8' },
				body: JSON.stringify({
					title: title,
				}),
			});
			const newTodo = await response.json();
			setTodos((prevTodos) => [...prevTodos, newTodo.title]);
			setIsLoading(false);
		} catch (error) {
			setError(error.message);
			setIsLoading(false);
		}
	};

	const delTodo = async (id) => {
		setIsLoading(true);
		try {
			fetch(`http://localhost:3000/todos/${id}`, {
				method: 'DELETE',
			});
			setTodos(todos.filter((todo) => todo.id !== id));
			setIsLoading(false);
		} catch (error) {
			setError(error.message);
			setIsLoading(false);
		}
	};

	const editTodo = async (todo) => {
		setIsLoading(true);
		try {
			const response = await fetch('http://localhost:3000/todos/' + editedTodo.id, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json;charset=utf-8' },
				body: JSON.stringify({
					title: todo.title,
				}),
			});
			const updatedTodo = await response.json();
			setEditedTodo(null);
			setIsEditing(false);
			setTodos(
				todos.map((curTodo) =>
					curTodo.id === updatedTodo.id ? updatedTodo : curTodo,
				),
			);
			setIsLoading(false);
		} catch (error) {
			setError(error.message);
			setIsLoading(false);
		}
	};

	const editRegime = (todo) => {
		setIsEditing(true);
		setEditedTodo(todo);
		formInputRef.current.value = todo.title;
		formInputRef.current.focus();
	};

	const formProps = isEditing
		? {
				request: editTodo,
				isCreating,
				isEditing,
				editedTodo,
				formInputRef,
			}
		: {
				request: newTodo,
				isCreating,
				isEditing,
				editedTodo,
				formInputRef,
			};

	return (
		<div className={styles.app}>
			<h1>Список задач</h1>
			<Form {...formProps} />
			<SearchForm
				todos={todos}
				setTodos={setTodos}
				reset={reset}
				setReset={setReset}
			/>

			{isLoading ? (
				<div className={styles.loader}></div>
			) : (
				<div>
					{Object.keys(todos).length > 0 && (
						<Table
							table={table}
							todos={todos}
							setEditedTodo={setEditedTodo}
						/>
					)}
				</div>
			)}
		</div>
	);
};

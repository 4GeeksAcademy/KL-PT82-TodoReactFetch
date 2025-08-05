import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const groupTasksByDate = (tasks) => {
  return tasks.reduce((groups, task) => {
    if (!task.createdAt) return groups;
    const date = task.createdAt.split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});
};

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        "https://playground.4geeks.com/todo/users/kelvinL"
      );
      const data = await res.json();
      setTasks(data.todos);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const addTask = async (task) => {
    try {
      const res = await fetch(
        "https://playground.4geeks.com/todo/todos/kelvinL",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: task.label,
            done: task.done,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to add task");
      const newTaskFromAPI = await res.json();
      setTasks((prev) => [
        ...prev,
        { ...newTaskFromAPI, text: newTaskFromAPI.label },
      ]);
    } catch (err) {
      console.error("Add task error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      const newTask = {
        label: input.trim(),
        done: false,
        text: input.trim(),
      };
      addTask(newTask);
      setInput("");
    }
  };

  const toggleDone = async (index) => {
    const updatedTask = { ...tasks[index], done: !tasks[index].done };
    try {
      const res = await fetch(
        `https://playground.4geeks.com/todo/todos/kelvinL/${updatedTask.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: updatedTask.label,
            done: updatedTask.done,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update task");
      const newTasks = [...tasks];
      newTasks[index] = { ...updatedTask, text: updatedTask.label };
      setTasks(newTasks);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const deleteTask = async (indexToDelete) => {
    try {
      const res = await fetch(
        `https://playground.4geeks.com/todo/todos/${indexToDelete}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Object.keys(groupedTasks).sort((a, b) =>
    a < b ? 1 : -1
  );

  return (
    <div className="container mt-5">
      <h1 className="text-center fw-bold mb-4">To-Do List</h1>

      <div className="card p-4 mb-4 shadow-sm">
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Add a new task and press Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-muted fst-italic">No tasks, add a task</p>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="card mb-4 shadow-sm rounded-4">
            <div className="card-header fw-semibold">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <ul className="list-group list-group-flush">
              {groupedTasks[date].map((task, idx) => {
                const taskIndex = tasks.findIndex((t) => t === task);
                return (
                  <li
                    key={taskIndex}
                    className={`list-group-item d-flex justify-content-between align-items-center
                      ${task.done ? "list-group-item-success" : ""}
                    `}
                    title={undefined}
                  >
                    <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={task.done}
                        onChange={() => toggleDone(taskIndex)}
                        id={`task-checkbox-${taskIndex}`}
                      />
                      <label
                        htmlFor={`task-checkbox-${taskIndex}`}
                        className={`form-check-label ${
                          task.done ? "text-decoration-line-through text-muted" : ""
                        }`}
                        style={{ marginBottom: 0, flex: 1, userSelect: "none" }}
                      >
                        {task.text}
                      </label>
                    </div>
                    <button
                      className="btn btn-sm btn-link text-danger"
                      onClick={() => deleteTask(taskIndex)}
                      aria-label="Delete task"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;

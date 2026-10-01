"use strict";

(() => {
  const STORAGE_KEY = "test.tasks.v1";
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const clearButton = document.getElementById("clear-completed");
  const warning = document.getElementById("storage-warning");
  const announcement = document.getElementById("announcement");
  let filter = "all";
  let tasks = loadTasks();

  function showStorageWarning(message) {
    warning.textContent = message;
    warning.hidden = false;
  }

  function loadTasks() {
    let saved;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      showStorageWarning("Browser storage is unavailable. Your tasks will only last for this visit.");
      return [];
    }
    if (saved === null) return [];
    try {
      const parsed = JSON.parse(saved);
      const ids = new Set();
      if (!Array.isArray(parsed)) throw new Error("Invalid task list");
      const valid = parsed.filter((task) => {
        if (!task || typeof task.id !== "string" || !task.id ||
            typeof task.text !== "string" || !task.text.trim() ||
            typeof task.completed !== "boolean" || ids.has(task.id)) return false;
        ids.add(task.id);
        return true;
      });
      if (valid.length !== parsed.length) {
        showStorageWarning("Some saved tasks could not be read. Your remaining tasks are ready.");
      }
      return valid.map(({ id, text, completed }) => ({ id, text, completed }));
    } catch {
      showStorageWarning("Saved tasks could not be read. Add a task to start a fresh list.");
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      warning.hidden = true;
    } catch {
      showStorageWarning("Your latest changes could not be saved. Keep this page open to retain them.");
    }
  }

  function announce(message) {
    announcement.textContent = message;
  }

  function createTaskItem(task) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;
    item.dataset.id = task.id;

    const label = document.createElement("label");
    label.className = "task-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      const index = visibleTasks().findIndex((entry) => entry.id === task.id);
      task.completed = checkbox.checked;
      saveTasks();
      render();
      focusTask(task.id, index);
      announce(task.completed ? "Task completed. Nice work!" : "Task marked active.");
    });
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    label.append(checkbox, text);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "delete-button";
    removeButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    removeButton.title = "Delete task";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "16");
    icon.setAttribute("height", "16");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "1.6");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7");
    icon.append(path);
    removeButton.append(icon);
    removeButton.addEventListener("click", () => {
      const index = visibleTasks().findIndex((entry) => entry.id === task.id);
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      render();
      focusTask(null, index);
      announce("Task deleted.");
    });
    item.append(label, removeButton);
    return item;
  }

  function visibleTasks() {
    return tasks.filter((task) => filter === "all" || (filter === "done" ? task.completed : !task.completed));
  }

  function focusTask(id, previousIndex) {
    const items = [...list.children];
    const target = items.find((item) => item.dataset.id === id) || items[Math.min(previousIndex, items.length - 1)];
    if (target) target.querySelector("input").focus();
    else input.focus();
  }

  function render() {
    const visible = visibleTasks();
    const completed = tasks.filter((task) => task.completed).length;
    const active = tasks.length - completed;
    const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    const fragment = document.createDocumentFragment();
    visible.forEach((task) => fragment.append(createTaskItem(task)));
    list.replaceChildren(fragment);
    document.getElementById("active-count").textContent = `${active} left`;
    document.getElementById("progress-count").textContent = `${completed} of ${tasks.length} done`;
    document.getElementById("progress").value = percentage;
    document.getElementById("progress").textContent = `${percentage}%`;
    document.getElementById("progress-message").textContent = !tasks.length
      ? "Your next step starts here."
      : active === 0 ? "All done. Take a breath — you earned it."
      : completed === 0 ? "Pick one small step. You’ve got this."
      : "Look at you making progress. Keep going.";
    document.getElementById("list-summary").textContent = !tasks.length
      ? "Make a little room for what matters."
      : `${active} ${active === 1 ? "task" : "tasks"} left. One step at a time.`;
    clearButton.disabled = completed === 0;
    filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));
    document.getElementById("empty-state").hidden = visible.length > 0;
    const emptyContent = !tasks.length
      ? ["A fresh start looks good on you.", "Add your first task above. Small is a great place to start."]
      : filter === "done"
        ? ["Good things take a first step.", "Check off a task and your wins will show up here."]
        : ["All clear. Nicely done.", "You’ve finished every task. Enjoy a little breathing room."];
    document.getElementById("empty-title").textContent = emptyContent[0];
    document.getElementById("empty-copy").textContent = emptyContent[1];
  }

  input.addEventListener("input", () => input.setCustomValidity(""));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.setCustomValidity("Add a few words for your next step.");
      input.reportValidity();
      return;
    }
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tasks.push({ id, text, completed: false });
    if (filter === "done") filter = "active";
    input.value = "";
    saveTasks();
    render();
    input.focus();
    announce("Task added.");
  });

  filters.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    render();
    announce(`Showing ${filter === "all" ? "all" : filter === "done" ? "completed" : "active"} tasks.`);
  }));

  clearButton.addEventListener("click", () => {
    const count = tasks.filter((task) => task.completed).length;
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    render();
    filters.find((button) => button.dataset.filter === filter).focus();
    announce(`Cleared ${count} completed ${count === 1 ? "task" : "tasks"}.`);
  });

  render();
})();

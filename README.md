# test

A small, polished task tracker built with plain HTML, CSS, and JavaScript. Add what needs doing, mark it complete, and keep your day moving.

## Features

- Add, complete, reopen, and delete tasks.
- Filter by all, active, or completed tasks.
- Clear completed tasks in one click.
- Save tasks automatically in your browser using localStorage.
- Responsive layout for desktop and mobile, with keyboard-friendly controls.
- No dependencies, build tools, accounts, or API keys.

## Run it

Open `index.html` in your browser to get started. For a consistent local address and browser storage, serve the folder:

```bash
git clone https://github.com/shlbi/test.git
cd test
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open **http://localhost:8000**. On Windows, use `py` instead of `python3` if needed.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and accessible controls |
| `styles.css` | Responsive styling |
| `app.js` | Task management, filtering, and local storage |

## Storage

Tasks stay in the current browser profile and are not sent to a server. They do not sync between devices. Clearing site data removes saved tasks. If storage is unavailable, the app still works for the current session and shows a notice.

## Stack

HTML5 · CSS3 · Vanilla JavaScript

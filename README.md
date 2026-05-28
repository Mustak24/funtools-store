# @funtools/store

# @funtools/store

> Lightweight external store for React, React Native and Next.js

[![npm version](https://img.shields.io/npm/v/@funtools/store.svg)](https://www.npmjs.com/package/@funtools/store)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This README documents the current API and usage based on the library source in `src/`.

**Highlights**
- Small, zero-dependency runtime for shared state
- Auto-generated handlers for arrays, objects and booleans
- `createStore` for global stores and `createStoreProvider` for scoped stores

## Quick install

Install the published package or use the repo build for local development:

```bash
npm install @funtools/store
```

To develop locally, build the package output (`dist/`):

```bash
npm run build
```

## Exports

- `createStore(options)` — Create a global store for React usage.
- `createStoreProvider(options)` — Returns `{ Provider, useStore, useHandlers }` for scoped stores.

These are exported from the library root and from `react`.

## Basic concepts

- `states`: initial state object you pass when creating the store.
- `syncHandlers`: optional object of synchronous custom handlers.
- `asyncHandlers`: optional object of asynchronous custom handlers (returning Promises).
- `useStore(selector)`: React hook to read part of the state. Components re-render only when selected snapshot changes.
- `useHandlers()`: returns handlers (auto-generated + custom) to mutate state.

## API examples

Create a simple store:

```tsx
import { createStore } from "@funtools/store";

const counterStore = createStore({
    states: { count: 0 },
    syncHandlers: {
        increment: ({ states }) => { states.count += 1; }
    },
    asyncHandlers: {
        fetchAndSet: async ({ states }, url: string) => {
            const r = await fetch(url);
            const data = await r.json();
            states.count = data.value;
        }
    }
});

function Counter() {
    const count = counterStore.useStore(s => s.count);
    const handlers = counterStore.useHandlers();

    return (
        <div>
            <div>{count}</div>
            <button onClick={() => handlers.increment()}>+1</button>
            <button onClick={() => handlers.count.set((v) => v + 5)}>+5</button>
            <button onClick={() => handlers.count.reset()}>reset</button>
        </div>
    );
}
```

Provider (scoped store) usage:

```tsx
import {createStoreProvider} from "@funtools/store";

const { Provider, useStore, useHandlers } = createStoreProvider({
    states: { theme: 'light' }
});

function App() {
    return (
        <Provider>
            <Toolbar />
        </Provider>
    );
}

function Toolbar() {
    const theme = useStore(s => s.theme);
    const handlers = useHandlers();

    return <button onClick={() => handlers.theme.set(theme === 'light' ? 'dark' : 'light')}>Toggle</button>
}
```

## Auto-generated handlers

For each key in `states` the library generates handlers under `handlers.<key>`:

- `set(action)` — set a value or pass a function `(prev) => next` (uses `runAction`).
- `reset()` — restore the initial default value.

Additionally, based on the value type:

- Arrays: `push`, `pop`, `shift`, `unShift`, `update(index, action)`, `remove(index)`
- Booleans: `toggle()`
- Objects: `update(path, action)` (dot-paths supported), `updateMany(partial)`

Custom handlers declared in `syncHandlers` and `asyncHandlers` are wrapped so they receive `{ states, handlers }` as first argument and trigger notifications after execution.

Example of using array handlers:

```ts
handlers.fruits.push('apple');
handlers.fruits.update(0, (v) => v.toUpperCase());
```

## React behavior and snapshots

- `useStore(selector)` uses `useSyncExternalStore` internally. You should pass a selector returning the piece of state your component needs.
- The library caches snapshots per-hook instance and uses shallow equality to avoid unnecessary re-renders.

## Types (TypeScript)

Types are inferred from `states` and custom handlers. The main helper types live under `src/core/configStore/types.ts` and the public hooks return typed handlers and state slices.

## Project layout and developing locally

- `src/` — source files (entry is `src/index.ts`).
- `app.test/` — small Vite React app that demonstrates library usage.

Commands:

```bash
# build library
npm run build

# development watch
npm run dev

# run example app
cd app.test
npm install
npm run dev
```

Tip: `app.test` depends on the built package. Use the `dev:yalc` script or publish locally with `yalc` to test changes without publishing to npm.

## Contributing

Open an issue or PR, follow standard GitHub contribution flow. See `package.json` for build scripts.

## License

MIT

---

If you'd like, I can also:
- run `npm run build` and confirm `dist/` is produced,
- start the example app (`app.test`) to verify the README examples work.
Tell me which one you'd like me to run next.
        name: "John",
        age: 25,
    },
});

const handlers = store.useHandlers();

// ✅ Set to a new value
handlers.name.set("Jane");
handlers.age.set(26);

// ✅ Set using current value
handlers.age.set((currentAge) => currentAge + 1);

// ✅ Reset to initial value
handlers.name.reset(); // Back to "John"
handlers.age.reset(); // Back to 25

### For Boolean (True/False)

```tsx
const store = createStore({
    states: {
        isOpen: false,
        isDarkMode: true,
    },
});

const handlers = store.useHandlers();

// ✅ Toggle (switch between true/false)
handlers.isOpen.toggle();

// ✅ Set to specific value
handlers.isDarkMode.set(false);

// ✅ Reset to initial value
handlers.isOpen.reset();
```

### For Arrays (Lists)

```tsx
const store = createStore({
    states: {
        fruits: ["apple", "banana"],
        numbers: [1, 2, 3],
    },
});

const handlers = store.useHandlers();

// ✅ Add to end
handlers.fruits.push("orange");
// Result: ["apple", "banana", "orange"]

// ✅ Add to beginning
handlers.fruits.unShift("mango");
// Result: ["mango", "apple", "banana", "orange"]

// ✅ Remove from end
handlers.fruits.pop();
// Result: ["mango", "apple", "banana"]

// ✅ Remove from beginning
handlers.fruits.shift();
// Result: ["apple", "banana"]

// ✅ Update item at specific position
handlers.fruits.update(0, "grape");
// Result: ["grape", "banana"]

// ✅ Update item using current value
handlers.numbers.update(1, (current) => current * 2);

// ✅ Remove item at specific position
handlers.fruits.remove(1);
// Result: ["grape"]

// ✅ Set entire array
handlers.fruits.set(["kiwi", "melon"]);

// ✅ Reset to initial value
handlers.fruits.reset();
// Result: ["apple", "banana"]
```

### For Objects

```tsx
const store = createStore({
    states: {
        user: {
            name: "John",
            email: "john@example.com",
            settings: {
                theme: "light",
                notifications: true,
            },
        },
    },
});

const handlers = store.useHandlers();

// ✅ Update single property
handlers.user.update("name", "Jane");

// ✅ Update with current value
handlers.user.update("name", (currentName) => currentName.toUpperCase());

// ✅ Update nested property (use dot notation)
handlers.user.update("settings.theme", "dark");

// ✅ Update multiple properties at once
handlers.user.updateMany({
    name: "Jane",
    email: "jane@example.com",
});

// ✅ Update nested properties
handlers.user.updateMany({
    settings: {
        theme: "dark",
    },
});

// ✅ Set entire object
handlers.user.set({
    name: "Bob",
    email: "bob@example.com",
    settings: { theme: "blue", notifications: false },
});

// ✅ Reset to initial value
handlers.user.reset();
```

## 🔧 Custom Handlers

Sometimes you need custom logic. Create your own handlers!

### Sync Handlers (Instant Changes)

```tsx
const store = createStore({
    states: {
        count: 0,
        firstName: "John",
        lastName: "Doe",
    },

    // Define your custom handlers here
    syncHandlers: {
        // Handler with no parameters
        increment: (state) => {
            state.count = state.count + 1;
        },

        // Handler with parameters
        incrementBy: (state, amount: number) => {
            state.count = state.count + amount;
        },

        // Handler that changes multiple values
        setFullName: (state, first: string, last: string) => {
            state.firstName = first;
            state.lastName = last;
        },
    },
});

// Use them in components
function MyComponent() {
    const handlers = store.useHandlers();

    return (
        <div>
            <button onClick={() => handlers.increment()}>Add 1</button>
            <button onClick={() => handlers.incrementBy(5)}>Add 5</button>
            <button onClick={() => handlers.setFullName("Jane", "Smith")}>
                Change Name
            </button>
        </div>
    );
}
```

### Async Handlers (For API Calls)

Perfect for fetching data from servers!

```tsx
const store = createStore({
    states: {
        user: null,
        loading: false,
        error: null,
    },

    asyncHandlers: {
        // Fetch user from API
        fetchUser: async (state, userId: string) => {
            // Set loading to true
            state.loading = true;
            state.error = null;

            try {
                // Fetch from API
                const response = await fetch(
                    `https://api.example.com/users/${userId}`,
                );
                const data = await response.json();

                // Update state with data
                state.user = data;
            } catch (err) {
                // Handle errors
                state.error = "Failed to fetch user";
            } finally {
                // Set loading to false
                state.loading = false;
            }
        },
    },
});

// Use in component
function UserProfile() {
    const { user, loading } = store.useStore((state) => ({
        user: state.user,
        loading: state.loading,
    }));
    const handlers = store.useHandlers();

    return (
        <div>
            <button onClick={() => handlers.fetchUser("123")}>Load User</button>
            {loading && <p>Loading...</p>}
            {user && <p>Name: {user.name}</p>}
        </div>
    );
}
```

## 🎁 Using Providers (Scoped Stores)

Sometimes you want a store that only works within a specific part of your app. Use `createStoreProvider`!

```tsx
import { createStoreProvider } from "@funtools/store";

// Create a provider
const { Provider, useStore, useHandlers } = createStoreProvider({
    states: {
        theme: "light",
        language: "en",
    },
});

// Wrap part of your app
function App() {
    return (
        <Provider>
            <Header />
            <Content />
        </Provider>
    );
}

// Use in any child component
function Header() {
    const theme = useStore((state) => state.theme);
    const handlers = useHandlers();

    return (
        <button
            onClick={() =>
                handlers.theme.set(theme === "light" ? "dark" : "light")
            }>
            Current theme: {theme}
        </button>
    );
}
```

**The difference:**

- `createStore` = Global (available everywhere)
- `createStoreProvider` = Scoped (only available inside `<Provider>`)

## 💡 Performance Tips

### Only Re-render When Needed

Components only re-render when the data they use changes:

```tsx
// ❌ BAD: Component re-renders on ANY state change
const allState = store.useStore((state) => state);

// ✅ GOOD: Component only re-renders when count changes
const count = store.useStore((state) => state.count);

// ✅ GOOD: Component only re-renders when name or age change
const { name, age } = store.useStore((state) => ({
    name: state.name,
    age: state.age,
}));
```

## 📚 Real-World Examples

### Example 1: Todo App

```tsx
const todoStore = createStore({
    states: {
        todos: [] as Array<{ id: number; text: string; done: boolean }>,
    },

    syncHandlers: {
        addTodo: (state, text: string) => {
            state.todos.push({
                id: Date.now(),
                text: text,
                done: false,
            });
        },

        toggleTodo: (state, id: number) => {
            const todo = state.todos.find((t) => t.id === id);
            if (todo) {
                todo.done = !todo.done;
            }
        },

        deleteTodo: (state, id: number) => {
            state.todos = state.todos.filter((t) => t.id !== id);
        },
    },
});

function TodoApp() {
    const todos = todoStore.useStore((state) => state.todos);
    const handlers = todoStore.useHandlers();
    const [input, setInput] = React.useState("");

    return (
        <div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a todo..."
            />
            <button
                onClick={() => {
                    handlers.addTodo(input);
                    setInput("");
                }}>
                Add
            </button>

            {todos.map((todo) => (
                <div key={todo.id}>
                    <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => handlers.toggleTodo(todo.id)}
                    />
                    <span
                        style={{
                            textDecoration: todo.done ? "line-through" : "none",
                        }}>
                        {todo.text}
                    </span>
                    <button onClick={() => handlers.deleteTodo(todo.id)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
```

### Example 2: Shopping Cart

```tsx
const cartStore = createStore({
    states: {
        items: [] as Array<{
            id: number;
            name: string;
            price: number;
            quantity: number;
        }>,
        total: 0,
    },

    syncHandlers: {
        addItem: (
            state,
            product: { id: number; name: string; price: number },
        ) => {
            // Check if item already exists
            const existing = state.items.find((item) => item.id === product.id);

            if (existing) {
                // Increase quantity
                existing.quantity++;
            } else {
                // Add new item
                state.items.push({ ...product, quantity: 1 });
            }

            // Update total
            state.total = state.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            );
        },

        removeItem: (state, id: number) => {
            state.items = state.items.filter((item) => item.id !== id);
            state.total = state.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            );
        },

        clearCart: (state) => {
            state.items = [];
            state.total = 0;
        },
    },
});
```

### Example 3: User Authentication

```tsx
const authStore = createStore({
    states: {
        user: null as { id: string; name: string; email: string } | null,
        isAuthenticated: false,
        isLoading: false,
    },

    asyncHandlers: {
        login: async (state, email: string, password: string) => {
            state.isLoading = true;

            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                state.user = data.user;
                state.isAuthenticated = true;
            } catch (error) {
                console.error("Login failed:", error);
            } finally {
                state.isLoading = false;
            }
        },

        logout: async (state) => {
            await fetch("/api/logout", { method: "POST" });
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});
```

## 🎓 TypeScript Support

The library works great with TypeScript! You get autocomplete and type safety.

### Defining State Types

```tsx
// Define your state shape
type UserState = {
    name: string;
    age: number;
    email: string;
};

const store = createStore({
    states: {
        count: 0,
        user: {
            name: "John",
            age: 25,
            email: "john@example.com",
        } as UserState,
    },

    syncHandlers: {
        // TypeScript knows the state type!
        updateUser: (state, newUser: UserState) => {
            state.user = newUser;
        },
    },
});

// TypeScript will catch errors
const handlers = store.useHandlers();
handlers.updateUser({
    name: "Jane",
    age: 26,
    // ❌ Error: missing 'email' property
});
```

## ❓ Common Questions

### Q: When should I use a global store vs provider?

**Use Global Store (`createStore`) when:**

- Data is needed across your entire app (like user auth, theme)
- You want simple setup without wrapping components

**Use Provider (`createStoreProvider`) when:**

- Data is only needed in a specific section
- You want better component isolation
- You're building reusable components

### Q: How is this different from useState?

`useState` is great for local component state. Use `@funtools/store` when:

- Multiple components need the same data
- You want to avoid prop drilling
- You need more powerful update functions

### Q: Can I use multiple stores?

Yes! Create as many stores as you need:

```tsx
const userStore = createStore({ states: { user: null } });
const cartStore = createStore({ states: { items: [] } });
const themeStore = createStore({ states: { theme: "light" } });
```

## 🤝 Contributors

This project is open source and welcomes contributions from the community! We appreciate all the developers who have helped make this library better.

### How to Contribute

We welcome contributions of all kinds:

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 💡 Suggestions and ideas

To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Our Contributors

Thanks to all the amazing people who have contributed to this project! 🎉

<!-- Contributors list will be automatically updated -->

Want to see your name here? [Start contributing today!](https://github.com/funtools24/funtools-store/contribute)

## 🔗 Links

- [GitHub Repository](https://github.com/mustak24/funtools-store)
- [Report Issues](https://github.com/mustak24/funtools-store/issues)
- [NPM Package](https://www.npmjs.com/package/@funtools/store)

---

**Made with ❤️ for developers who value simplicity by @funtools24**

Happy coding! 🚀

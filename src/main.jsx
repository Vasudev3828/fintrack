import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```
Click **Commit changes**.

---

**Step 3 — Create `src/App.jsx`**

Click **"Add file" → "Create new file"**, name it `src/App.jsx`, then paste the **entire contents** of your `finance-tracker.jsx` file. Click **Commit changes**.

---

**Step 4 — Create the workflow file** ← most important!

Click **"Add file" → "Create new file"**, name it:
```
.github/workflows/build-apk.yml

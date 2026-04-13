# Project Icarus
> **"The AI wrote it is never an acceptable answer. If you can’t explain your work, it’s not your work."**

Project Icarus is an automated **Socratic Gatekeeper** designed for the modern era of AI-assisted creation. It bridges the gap between AI-generated output and human accountability by identifying "Complexity Hotspots" and forcing the creator to defend their logic through a Socratic audit.

---

## 🏛️ The Vision
We are living in an era where anyone can "create" using AI, but few can "explain." Like the mythical Icarus, many developers are flying with wings they didn't build and don't understand. 

This project is a personal mission to ensure that human intelligence remains the master of the tool. Icarus doesn't just check if your project is finished—it checks if **you** were the one who finished it.

---

## 🛠️ System Architecture (The "No-Rework" Stack)

I have architected Icarus as a **Decoupled Web Application** to ensure high performance and cross-platform flexibility.

* **Frontend:** [Angular](https://angular.io/) (TypeScript)
    * *Role:* The Auditor’s Dashboard.
    * *Why:* Chosen for its strict, opinionated structure and "Signals" for reactive, high-performance UI.
* **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
    * *Role:* The Reasoning Engine.
    * *Why:* Leverages Python’s AI ecosystem. FastAPI handles asynchronous processing of project files via a **REST API**.
* **Intelligence:** [Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/)
    * *Role:* The Senior Architect.
    * *Why:* Utilizes a 2M token context window to understand the *entire* project structure simultaneously.
* **Persistence:** [PostgreSQL](https://www.postgresql.org/)
    * *Role:* The Memory.
    * *Why:* Stores audit history, logic defense records, and Integrity Scores.

---

## 🔍 How It Works: The "Audit of Understanding"

### 1. The Integrity Scan (Melt Analysis)
The backend performs an entropy analysis to find sections of code that are statistically likely to be unverified AI-slop. It flags these as **"Complexity Hotspots."**

### 2. Socratic Interrogation
Instead of providing fixes, the app generates a **Mandatory Defense Checklist**. 
* *Example:* "You used this specific recursion logic on Line 82. Explain the memory trade-off you made here versus an iterative method."

### 3. The Wax Meter
A real-time dashboard visualizing **Project Health vs. Project Risk**. 
* **High Wax (Red):** The user cannot explain the foundations; the project is fragile.
* **Solidified (Green):** The user has successfully defended the logic; the "wings" are solid.



---

## 📱 Platform Strategy
* **Cross-Platform Web App:** Built to be fully responsive.
* **PWA Ready:** Future-proofed to be installed on Windows, Mac, Android, and iOS without the need for an App Store.
* **RESTful Design:** The frontend and backend are completely separate, allowing for future expansion into Browser Extensions or Mobile Apps without rewriting the core logic.

---

## 🎯 Success Metrics
* **Verification:** Catching hallucinated or unverified logic before it hits production.
* **Accountability:** Ensuring every "Audit Rule" is mapped to a human explanation.
* **Zero-Slop Policy:** Making the "Saturday Defense" a standard of excellence.

---

## 🏗️ Development Status
I am building Icarus at my own pace, starting with the **FastAPI Reasoning Engine** before moving to the **Angular Dashboard**. Every line of code in this repository is subject to the Icarus Rule: *If I can't explain it, I don't commit it.*

---

**Lead Architect:** Randel Serafica
**"Don't just fly. Know how you fly."**

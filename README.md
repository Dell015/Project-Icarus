# icarus icarus 🌊
> **"The AI wrote it is never an acceptable answer. If you can’t explain your work, it’s not your work."**

Project Icarus is an automated **Socratic Gatekeeper** designed for the modern era of AI-assisted creation. It bridges the gap between AI-generated output and human accountability by identifying "Complexity Hotspots" and forcing the creator to defend their logic through a Socratic audit.

---

## 🏛️ The Vision
We are living in an era where anyone can "create" using AI, but few can "explain." Like the mythical Icarus, many developers are flying with wings they didn't build and don't understand. 

This project is a personal mission to ensure that human intelligence remains the master of the tool. Icarus doesn't just check if your project is finished—it checks if **you** were the one who finished it.

---

## 🛠️ System Architecture (The "No-Rework" Stack)

I have architected Icarus as a **Decoupled Web Application** using a Polyglot stack to ensure peak performance and industrial-grade stability.

### **Core Stack**
* **Frontend:** [Angular](https://angular.io/) (TypeScript)
    * *Role:* The Auditor’s Dashboard (PWA).
    * *Why:* Strict, opinionated structure with **Signals** for reactive, high-performance UI.
* **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
    * *Role:* The Reasoning Engine & REST API.
    * *Why:* Asynchronous processing for handling heavy AI workloads without bottlenecking.
* **Intelligence:** [Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/) + **LangGraph**
    * *Role:* The Senior Architect.
    * *Why:* 2M token context window and agentic loops to manage the Socratic dialogue flow.
* **Persistence:** [PostgreSQL](https://www.postgresql.org/) (via **Supabase**)
    * *Role:* The Memory & Auth.
    * *Why:* Utilizing **pgvector** for semantic search and audit-history tracking.

### **Infrastructure & Deployment**
* **Hosting (FE):** [Vercel](https://vercel.com/) (Global Edge Delivery).
* **Hosting (BE):** [Railway](https://railway.app/) (Containerized Python Environment).
* **DevOps:** [Docker](https://www.docker.com/) (Environment Consistency).
* **CI/CD:** [GitHub Actions](https://github.com/features/actions) (Automated Integrity Checks).

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
* **Cross-Platform Web App:** Fully responsive design for desktop and mobile.
* **PWA Ready:** Installable on Windows, Mac, Android, and iOS.
* **RESTful Design:** Modular architecture allows for future expansion into Browser Extensions or Mobile Apps without core logic rework.

---

## 🎯 Success Metrics
* **Verification:** Catching hallucinated or unverified logic before it hits production.
* **Accountability:** Ensuring every "Audit Rule" is mapped to a human explanation.
* **Zero-Slop Policy:** Turning "AI-assisted" back into "Human-led."

---

## 🏗️ Development Status
I am building Icarus as a personal project, prioritizing the **FastAPI Reasoning Engine** and **Dockerization** first. Every line of code in this repository is subject to the Icarus Rule: *If I can't explain it, I don't commit it.*

---

**Lead Architect:** Randel Serafica  
**"Don't just fly. Know how you fly."**

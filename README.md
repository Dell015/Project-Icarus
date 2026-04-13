# Project Icarus 🌊
> **"The AI wrote it is never an acceptable answer. If you can’t explain your work, it’s not your work."**

Project Icarus is a **Universal Integrity & Logic Auditor**. In an era where AI can generate essays, code, and research in seconds, Icarus acts as the necessary friction to ensure human accountability. It identifies "Wax Wings"—unverified, AI-generated, or poorly understood logic—and forces the creator to defend their work through a Socratic audit before it is allowed to "fly."

---

## 🏛️ The Vision
We are living in an era where anyone can "create" using AI, but few can "explain." Like the mythical Icarus, many are flying with wings they didn't build and don't understand. 

Icarus is a personal mission to bridge the gap between AI-generated output and true human mastery. Whether you are submitting a line of code, a legal brief, or a research paper, Icarus ensures that **human intelligence remains the architect**, and the AI remains the tool.

---

## 🛠️ System Architecture (The "No-Rework" Stack)

I have architected Icarus as a **Decoupled, Universal Web Application** to ensure high performance and cross-platform flexibility across all document types.

### **Core Stack**
* **Frontend:** [Angular](https://angular.io/) (TypeScript)
    * *Role:* The Auditor’s Dashboard (PWA).
    * *Why:* Rigid structure with **Signals** for a reactive UI that works seamlessly on desktop and mobile.
* **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
    * *Role:* The Universal Reasoning Engine.
    * *Why:* Python’s ecosystem allows for advanced parsing of various file types (.py, .docx, .pdf) and asynchronous AI processing.
* **Intelligence:** [Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/) + **LangGraph**
    * *Role:* The Socratic Auditor.
    * *Why:* Uses a 2M token context window to analyze the internal consistency of massive projects or long-form documents.
* **Persistence:** [PostgreSQL](https://www.postgresql.org/) (via **Supabase**)
    * *Role:* The Memory Vault.
    * *Why:* Using **pgvector** for semantic search to compare user defenses against the original document logic.

### **Infrastructure**
* **Deployment:** [Vercel](https://vercel.com/) (Frontend) & [Railway](https://railway.app/) (Backend).
* **DevOps:** [Docker](https://www.docker.com/) for environment parity and [GitHub Actions](https://github.com/features/actions) for automated logic-gate checks.

---

## 🔍 How It Works: The "Audit of Understanding"

### 1. Integrity Scanning (The "Melt" Analysis)
Icarus identifies **"Complexity Hotspots"**—sections of a project that exhibit high entropy or "vague zones" typically associated with unverified AI generation or logical leaps.

### 2. Socratic Interrogation
Instead of a simple "Pass/Fail," the app generates a **Mandatory Defense Checklist**. 
* **For Code:** "Explain the trade-off of this specific algorithm on Line 42."
* **For Prose:** "You made a specific claim about X. Walk through the evidence used to reach this conclusion."

### 3. The Wax Meter
A real-time dashboard visualizing **Project Health vs. Project Risk**. 
* **High Wax (Red):** The creator cannot explain the foundations; the project is at risk of "melting" under scrutiny.
* **Solidified (Green):** The creator has successfully verified and defended the logic.

---

## 📱 Platform Strategy: Universal & Adaptive
* **Beyond Code:** Designed for students, developers, and professionals alike.
* **PWA Ready:** Installable on Windows, Mac, Android, and iOS.
* **RESTful Design:** Modular API-first architecture allows for future expansion into Browser Extensions (to audit Google Docs/GitHub) without backend rework.

---

## 🎯 Success Metrics
* **Verification:** Catching "AI-slop" and unverified claims before they are published.
* **Accountability:** Mapping every major decision in a project to a human explanation.
* **Human-Led Design:** Ensuring AI serves as a catalyst for deeper understanding, not a shortcut for it.

---

## 🏗️ Development Status
Built at a personal pace. Currently focusing on the **Universal File Parser** (Python) to support multi-format audits before finalizing the **Angular Dashboard**.

---

**Lead Architect:** Randel Serafica  
**"Don't just fly. Know how you fly."**

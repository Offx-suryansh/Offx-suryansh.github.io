const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector("#nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const copyButton = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const email = copyButton.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = "Copied";
      if (copyStatus) copyStatus.textContent = "Email address copied to clipboard.";
    } catch {
      if (copyStatus) copyStatus.textContent = `Copy not available here. Email me at ${email}.`;
    }
    window.setTimeout(() => { copyButton.textContent = "Copy email"; }, 1800);
  });
}

const printButton = document.querySelector("#print-resume");
if (printButton) printButton.addEventListener("click", () => window.open("resume.html", "_blank", "noopener,noreferrer"));

const terminalForm = document.querySelector("#terminal-form");
const terminalInput = document.querySelector("#terminal-input");
const terminalOutput = document.querySelector("#terminal-output");
const terminalCommands = {
  help: ["Available commands: about, projects, skills, certificates, contact, resume, clear"],
  about: ["I'm Suryansh Sharma, a Computer Science and Engineering student at Lamrin Tech Skills University Punjab.", "I enjoy learning web technologies and building practical projects."],
  projects: ["Voice Presentation Controller — live demo: https://suryanshsharma.runs-at.dev/voice-presentation-controller/", "Other projects: Crypto Tracker, CINEVERSE, and ULTRON PRIME. Open the Projects section for repository links."],
  skills: ["Web: HTML, CSS, JavaScript, Bootstrap", "Programming/backend: Java, Spring Boot (beginner)", "Databases and tools: MongoDB, SQL Server, Git, GitHub, VS Code"],
  certificates: ["AVR Bootcamp — NIELIT Ropar", "Web Development Internship — Internboot", "Open the Experience section to follow the LinkedIn certificate links."],
  contact: ["Email: sharmasuryansh159@gmail.com", "GitHub: https://github.com/Offx-suryansh", "LinkedIn: https://www.linkedin.com/in/offxsuryansh/", "Instagram: https://www.instagram.com/offx.suryansh/"],
  resume: ["Open the Resume section and choose View resume to see the print-ready version."],
  clear: []
};

if (terminalForm && terminalInput && terminalOutput) {
  terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = terminalInput.value.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") {
      terminalOutput.replaceChildren();
      terminalInput.value = "";
      return;
    }
    const commandLine = document.createElement("p");
    commandLine.className = "terminal-command";
    commandLine.textContent = `› ${command}`;
    terminalOutput.append(commandLine);
    const responses = terminalCommands[command] || [`Command not found: ${command}. Type help to see available commands.`];
    responses.forEach((response) => {
      const line = document.createElement("p");
      line.className = "terminal-result";
      line.textContent = response;
      terminalOutput.append(line);
    });
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    terminalInput.value = "";
  });
}

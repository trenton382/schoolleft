const schoolStart = new Date("2025-09-02T12:30:00");
const schoolEnd = new Date("2026-06-11T11:30:00");
const totalSchoolDays = 171;

const nonSchoolDates = [
  // 2025
  "2025-10-02", "2025-10-03",
  "2025-10-16", "2025-10-17",
  "2025-11-26", "2025-11-27", "2025-11-28",
  "2025-12-01",
  "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25", "2025-12-26",
  "2025-12-29", "2025-12-30", "2025-12-31",

  // 2026
  "2026-01-01", "2026-01-02",
  "2026-01-19",
  "2026-01-26",
  "2026-02-16",
  "2026-02-26", "2026-02-27",
  "2026-03-02",
  "2026-03-30", "2026-03-31", "2026-04-01", "2026-04-02", "2026-04-03",
  "2026-05-22",
  "2026-05-25"
];

const schoolHours = {
  Mon: { start: "08:05", end: "15:30" },
  Tue: { start: "08:05", end: "15:30" },
  Wed: { start: "08:05", end: "14:30" },
  Thu: { start: "08:05", end: "15:30" },
  Fri: { start: "08:05", end: "15:30" }
};

function isWeekend(date) {
  return [0, 6].includes(date.getDay());
}

function isNonSchoolDay(date) {
  return nonSchoolDates.includes(date.toISOString().split("T")[0]);
}

function getSchoolHours(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return schoolHours[days[date.getDay()]];
}

function getTimeLeftInSchool() {
  const now = new Date();
  if (now < schoolStart) return 0;
  if (now > schoolEnd) return 0;
  let total = 0;
  let current = new Date(now);

  while (current <= schoolEnd) {
    const ymd = current.toISOString().split("T")[0];
    if (!isWeekend(current) && !isNonSchoolDay(current)) {
      const hours = getSchoolHours(current);
      if (hours) {
        const start = new Date(current);
        const [sh, sm] = hours.start.split(":").map(Number);
        start.setHours(sh, sm, 0, 0);

        const end = new Date(current);
        const [eh, em] = (ymd === "2026-06-11") ? [11, 30] : hours.end.split(":").map(Number);
        end.setHours(eh, em, 0, 0);

        if (current < end) {
          total += Math.max(0, (end - (current > start ? current : start)) / 1000);
        }
      }
    }
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  return total;
}

function formatVerbose(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs} hour${hrs !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
}

function countSchoolDaysRemaining(fromDate = new Date()) {
  let current = new Date(fromDate);
  let count = 0;
  while (current <= schoolEnd) {
    if (!isWeekend(current) && !isNonSchoolDay(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getSchoolDaysPassed() {
  return totalSchoolDays - countSchoolDaysRemaining();
}

function updatePage() {
  const now = new Date();

  // Before school starts
  if (now < schoolStart) {
    document.getElementById("timer").textContent = "School hasn’t started yet!";
    document.getElementById("days-remaining").textContent = `${totalSchoolDays} school days left`;
    document.getElementById("progress-bar").style.width = `0%`;
    document.getElementById("progress-label").textContent = `0.0% complete — 0 of ${totalSchoolDays} days`;
    return;
  }

  // After school ends
  if (now > schoolEnd) {
    document.getElementById("timer").textContent = "School is out! 🎉";
    document.getElementById("days-remaining").textContent = "0 school days remaining.";
    document.getElementById("progress-bar").style.width = `100%`;
    document.getElementById("progress-label").textContent = `100% complete — ${totalSchoolDays} of ${totalSchoolDays} days`;
    return;
  }

  // During school year
  const secondsLeft = getTimeLeftInSchool();
  const daysRemaining = countSchoolDaysRemaining(now);
  const daysPassed = getSchoolDaysPassed();
  const percent = ((daysPassed / totalSchoolDays) * 100).toFixed(1);

  document.getElementById("timer").textContent =
    `Time left in school: ${formatVerbose(secondsLeft)}`;
  document.getElementById("days-remaining").textContent =
    `${daysRemaining} school day${daysRemaining !== 1 ? 's' : ''} remaining.`;
  document.getElementById("progress-bar").style.width = `${percent}%`;
  document.getElementById("progress-label").textContent =
    `${percent}% complete — ${daysPassed} of ${totalSchoolDays} days`;
}

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  html.setAttribute("data-theme", newTheme);
  document.getElementById("theme-toggle").textContent = newTheme === "light" ? "🌙" : "☀️";
});

// Play e.mp3 repeatedly when "e" key is held down
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "e") {
    const audio = new Audio("e.mp3");
    audio.play();
  }
});

setInterval(updatePage, 1000);
updatePage();

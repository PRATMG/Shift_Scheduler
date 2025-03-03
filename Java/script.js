// Employee Shift Scheduler with Review & Edit Feature

const schedule = {
    Monday: { Morning: [], Afternoon: [], Evening: [] },
    Tuesday: { Morning: [], Afternoon: [], Evening: [] },
    Wednesday: { Morning: [], Afternoon: [], Evening: [] },
    Thursday: { Morning: [], Afternoon: [], Evening: [] },
    Friday: { Morning: [], Afternoon: [], Evening: [] },
    Saturday: { Morning: [], Afternoon: [], Evening: [] },
    Sunday: { Morning: [], Afternoon: [], Evening: [] }
};

const employeeWorkdays = {};

function assignEmployeeForWeek() {
    let name = document.getElementById("employeeName").value.trim();
    let firstChoice = document.getElementById("shift1").value;
    let secondChoice = document.getElementById("shift2").value;

    if (!name || !firstChoice || !secondChoice) {
        alert("Please fill in all fields.");
        return;
    }

    if (firstChoice === secondChoice) {
        alert("First and second choice must be different.");
        return;
    }

    if (!employeeWorkdays[name]) employeeWorkdays[name] = 0;

    let assignedDays = 0;
    let reviewAssignments = [];

    for (let day in schedule) {
        if (assignedDays >= 5) break;
        if (isEmployeeAssignedToDay(name, day)) continue;

        let assignedShift = "";

        if (schedule[day][firstChoice].length < 2) {
            schedule[day][firstChoice].push(name);
            assignedShift = firstChoice;
        } else if (schedule[day][secondChoice].length < 2) {
            schedule[day][secondChoice].push(name);
            assignedShift = secondChoice;
        } else {
            for (let shift in schedule[day]) {
                if (schedule[day][shift].length < 2) {
                    schedule[day][shift].push(name);
                    assignedShift = shift;
                    break;
                }
            }
        }

        if (assignedShift) {
            assignedDays++;
            employeeWorkdays[name]++;
            reviewAssignments.push({ day, shift: assignedShift });
        }
    }

    showReviewTable(name, reviewAssignments);
}

function showReviewTable(name, assignments) {
    let table = document.getElementById("reviewTable");
    table.innerHTML = `<tr><th>Day</th><th>Shift</th><th>Actions</th></tr>`;

    if (assignments.length === 0) {
        table.innerHTML += `<tr><td colspan="3">No shifts assigned. Please try again.</td></tr>`;
        return;
    }

    assignments.forEach((entry, index) => {
        let shiftOptions = ["Morning", "Afternoon", "Evening"]
            .map(shift => {
                let disabled = isShiftFull(entry.day, shift) ? "disabled" : "";
                return `<option value="${shift}" ${entry.shift === shift ? "selected" : ""} ${disabled}>${shift}</option>`;
            })
            .join("");

        table.innerHTML += `
            <tr>
                <td>${entry.day}</td>
                <td>
                    <select id="shiftSelect-${index}" onchange="validateShiftChange('${name}', '${entry.day}', ${index})">
                        ${shiftOptions}
                    </select>
                </td>
                <td><button onclick="removeShift('${name}', '${entry.day}')">❌ Remove</button></td>
            </tr>
        `;
    });

    table.innerHTML += `<tr><td colspan="3"><button onclick="confirmSchedule('${name}')">✅ Confirm Schedule</button></td></tr>`;
}

function validateShiftChange(name, day, index) {
    let newShift = document.getElementById(`shiftSelect-${index}`).value;

    // First, remove the employee's old shift from consideration
    for (let shift in schedule[day]) {
        schedule[day][shift] = schedule[day][shift].filter(emp => emp !== name);
    }

    // Now check if the new shift already has the employee
    if (isEmployeeAssignedToDay(name, day)) {
        alert("An employee cannot have multiple shifts in a day!");
        document.getElementById(`shiftSelect-${index}`).value = ""; // Reset selection
        return false;
    }

    // Assign the employee to the new shift in the review table (not final yet)
    schedule[day][newShift].push(name);

    return true;
}


// Check if an employee is already assigned to a day
function isEmployeeAssignedToDay(name, day) {
    return Object.values(schedule[day]).some(shift => shift.includes(name));
}

// Check if a shift is full
function isShiftFull(day, shift) {
    return schedule[day][shift].length >= 2;
}

// Remove an employee from a shift but prevent rule violations
function removeShift(name, day) {
    for (let shift in schedule[day]) {
        if (schedule[day][shift].includes(name)) {
            if (schedule[day][shift].length <= 2) {
                alert("Cannot remove! At least 2 employees are required in a shift.");
                return;
            }
            schedule[day][shift] = schedule[day][shift].filter(emp => emp !== name);
            employeeWorkdays[name]--;
            break;
        }
    }
    showReviewTable(name, getAssignments(name)); // Refresh the review table
}

// Get assigned shifts for an employee
function getAssignments(name) {
    let assignments = [];
    for (let day in schedule) {
        for (let shift in schedule[day]) {
            if (schedule[day][shift].includes(name)) {
                assignments.push({ day, shift });
            }
        }
    }
    return assignments;
}

// Confirm and save schedule with validation
function confirmSchedule(name) {
    let rows = document.querySelectorAll("#reviewTable tr");
    let updatedAssignments = [];

    rows.forEach((row, index) => {
        if (index === 0 || index === rows.length - 1) return;

        let day = row.cells[0].textContent;
        let newShift = document.getElementById(`shiftSelect-${index - 1}`).value;

        if (!newShift) {
            alert("Shift selection is required for all days!");
            return;
        }

        // Remove employee from old shift
        for (let shift in schedule[day]) {
            schedule[day][shift] = schedule[day][shift].filter(emp => emp !== name);
        }

        // Assign to new shift
        schedule[day][newShift].push(name);
        updatedAssignments.push({ day, shift: newShift });
    });

    updateScheduleTable();
    document.getElementById("reviewTable").innerHTML = ""; // Clear review table after confirming
    alert(`${name}'s schedule has been confirmed!`);
}


function updateScheduleTable() {
    let table = document.getElementById("scheduleTable");
    table.innerHTML = `
        <tr>
            <th>Day</th> <th>Morning</th> <th>Afternoon</th> <th>Evening</th>
        </tr>
    `;

    for (let day in schedule) {
        let row = `<tr><td>${day}</td>`;
        row += `<td>${schedule[day].Morning.join(", ") || "-"}</td>`;
        row += `<td>${schedule[day].Afternoon.join(", ") || "-"}</td>`;
        row += `<td>${schedule[day].Evening.join(", ") || "-"}</td>`;
        row += `</tr>`;
        table.innerHTML += row;
    }
}

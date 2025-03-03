import random

# Dictionary to store the weekly schedule
schedule = {
    "Monday": {"Morning": [], "Afternoon": [], "Evening": []},
    "Tuesday": {"Morning": [], "Afternoon": [], "Evening": []},
    "Wednesday": {"Morning": [], "Afternoon": [], "Evening": []},
    "Thursday": {"Morning": [], "Afternoon": [], "Evening": []},
    "Friday": {"Morning": [], "Afternoon": [], "Evening": []},
    "Saturday": {"Morning": [], "Afternoon": [], "Evening": []},
    "Sunday": {"Morning": [], "Afternoon": [], "Evening": []},
}

# Track how many shifts each employee has worked
employee_workdays = {}

def validate_shift_input(shift):
    """Ensure user inputs a valid shift."""
    valid_shifts = ["Morning", "Afternoon", "Evening"]
    while shift not in valid_shifts:
        shift = input(f"Invalid shift '{shift}'. Please enter a valid shift (Morning/Afternoon/Evening): ").capitalize()
    return shift

def assign_employee_for_week(name, first_choice, second_choice):
    """Assign an employee shifts for the week following given constraints."""
    if name not in employee_workdays:
        employee_workdays[name] = 0

    assigned_days = 0
    for day in schedule:
        if assigned_days >= 5:
            break  # Stop once 5 shifts are assigned
        if is_employee_assigned_to_day(name, day):
            continue  # Skip if already assigned on this day
        if employee_workdays[name] >= 5:
            print(f"{name} has already reached the max of 5 shifts. Skipping assignment.")
            break

        # Prioritize 1st choice
        if len(schedule[day][first_choice]) < 2:
            schedule[day][first_choice].append(name)
            assigned_days += 1
            employee_workdays[name] += 1
        # Fallback to 2nd choice
        elif len(schedule[day][second_choice]) < 2:
            schedule[day][second_choice].append(name)
            assigned_days += 1
            employee_workdays[name] += 1

def is_employee_assigned_to_day(name, day):
    """Check if an employee is already assigned to a shift that day."""
    return any(name in shift for shift in schedule[day].values())

def reassign_unfilled_shifts():
    """Ensure all shifts have at least 2 employees if possible."""
    for day in schedule:
        for shift in schedule[day]:
            if len(schedule[day][shift]) < 2:  # If shift is not full
                for employee in employee_workdays:
                    if employee_workdays[employee] < 5 and not is_employee_assigned_to_day(employee, day):
                        schedule[day][shift].append(employee)
                        employee_workdays[employee] += 1
                        if len(schedule[day][shift]) == 2:  # Stop when shift is full
                            break

def confirm_schedule():
    """Finalize and display the schedule."""
    reassign_unfilled_shifts()
    print("\nFinal Weekly Schedule")
    print("-" * 50)
    print("Day         | Morning       | Afternoon     | Evening")
    print("-" * 50)

    for day, shifts in schedule.items():
        morning = ", ".join(shifts["Morning"]) if shifts["Morning"] else "-"
        afternoon = ", ".join(shifts["Afternoon"]) if shifts["Afternoon"] else "-"
        evening = ", ".join(shifts["Evening"]) if shifts["Evening"] else "-"
        print(f"{day:<10} | {morning:<12} | {afternoon:<12} | {evening:<12}")

# Main execution loop
def main():
    while True:
        name = input("\nEnter Employee Name (or 'exit' to finish): ").strip()
        if name.lower() == "exit":
            break

        first_choice = validate_shift_input(input("Enter 1st preferred shift (Morning/Afternoon/Evening): ").capitalize())
        second_choice = validate_shift_input(input("Enter 2nd preferred shift (Morning/Afternoon/Evening): ").capitalize())

        if first_choice == second_choice:
            print("❌ Error: First and second choice must be different.")
            continue

        assign_employee_for_week(name, first_choice, second_choice)

    confirm_schedule()

# Run the scheduler
if __name__ == "__main__":
    main()

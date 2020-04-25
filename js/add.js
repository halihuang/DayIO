export function loadAssignmentForm() {
  document.getElementById("assignmentsForm").style.display = "block";
  document.getElementById("meetingsForm").style.display = "none";
}

export function loadMeetingForm() {
  document.getElementById("assignmentsForm").style.display = "none";
  document.getElementById("meetingsForm").style.display = "block";
}

export function loadCourses() {
  document.getElementById("courseRadios").innerHTML = "Course:";
}

/**
 * Formats a date into "DD-MM-YYYY, hh:mm am/pm"
 */
const formatDeadline = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
};

/**
 * Generates a Google Calendar "Action Template" URL for a mission.
 * @param {Object} task - The mission object (title, description, deadline, etc.)
 */
export const generateGoogleCalendarLink = (task) => {
  const baseUrl = "https://calendar.google.com/calendar/render";
  const action = "TEMPLATE";
  
  // Project Prefix as requested
  const text = encodeURIComponent(`(DTMS) ${task.title}`);
  
  const deadlineDate = new Date(task.deadline);
  const startDate = new Date(deadlineDate.getTime() - (60 * 60 * 1000)); // 1 hour before
  
  const formatDateForGoogle = (date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const dates = `${formatDateForGoogle(startDate)}/${formatDateForGoogle(deadlineDate)}`;
  const displayDeadline = formatDeadline(task.deadline);
  
  const details = encodeURIComponent(
    `MISSION DEADLINE: ${displayDeadline}\n\nMISSION BRIEF:\n${task.description}\n\n---\nAutomated via Digital Talent Management System (DTMS)`
  );
  
  return `${baseUrl}?action=${action}&text=${text}&dates=${dates}&details=${details}`;
};

//for storing data and time in a standard format
const date = new Date(); // Assuming this is the date object you have

// Set the timezone to 'Asia/Kolkata' (Indian Standard Time)
process.env.TZ = 'Asia/Kolkata';



// Format the time with options for local time
const orderedTime = date.toLocaleTimeString('en-US', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});


// Manually construct the date string in 'day-month-year' order
const orderedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;

module.exports = {
    orderedDate,
    orderedTime,
}
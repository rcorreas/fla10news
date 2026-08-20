const now = new Date("2026-08-20T01:30:00Z"); // 1:30 AM UTC
const utcHours = now.getUTCHours();
const gmt3Date = new Date(now.getTime());
gmt3Date.setUTCHours(utcHours - 3);
console.log(gmt3Date.toISOString().split('T')[0]);

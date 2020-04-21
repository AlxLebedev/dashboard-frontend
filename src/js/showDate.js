function formatDate(value) {
  return value < 10 ? `0${value}` : value;
}

export default function showDate(value) {
  const currentDate = new Date(value);
  const day = formatDate(currentDate.getDate());
  const month = formatDate(currentDate.getMonth() + 1);
  const year = formatDate(currentDate.getFullYear());
  const hour = formatDate(currentDate.getHours());
  const min = formatDate(currentDate.getMinutes());
  const sec = formatDate(currentDate.getSeconds());
  return `${hour}:${min}:${sec} ${day}.${month}.${year}`;
}

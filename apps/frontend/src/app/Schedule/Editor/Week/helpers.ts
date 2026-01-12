// Local getY function that starts at midnight (12 AM) instead of 6 AM
export const getY = (time: string) => {
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);
  return hourNum * 60 + minuteNum;
};
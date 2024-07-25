export const getY = (time: string) => {
  const [hour, minute] = time.split(":");
  return (parseInt(hour) - 6) * 60 + parseInt(minute);
};

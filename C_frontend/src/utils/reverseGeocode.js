export const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${Number(
      lat
    )}&lon=${Number(lng)}`
  );

  const data = await res.json();

  return {
    city:
      data.address.city ||
      data.address.town ||
      data.address.village ||
      "",
    state: data.address.state || "",
    country: data.address.country || "",
  };
};

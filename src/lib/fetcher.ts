export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      const error = new Error("An error occurred while fetching the data.");
      error.cause = res.status;
      throw error;
    }
  });

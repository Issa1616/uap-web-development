import fetch from "node-fetch";

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export async function searchBooks(query: string, maxResults = 10) {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`
    );
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
      publishedDate: item.volumeInfo.publishedDate || "",
    }));
  } catch (err) {
    console.error("Error en Google Books search:", err);
    return [];
  }
}

export async function getBookDetails(bookId: string) {
  if (!bookId) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${API_KEY}`
    );
    const data = await res.json();
    return {
      id: data.id,
      title: data.volumeInfo.title,
      authors: data.volumeInfo.authors || [],
      description: data.volumeInfo.description || "",
      pageCount: data.volumeInfo.pageCount || 0,
      categories: data.volumeInfo.categories || [],
      averageRating: data.volumeInfo.averageRating || null,
      thumbnail: data.volumeInfo.imageLinks?.thumbnail || "",
    };
  } catch (err) {
    console.error("Error en Google Books details:", err);
    return null;
  }
}

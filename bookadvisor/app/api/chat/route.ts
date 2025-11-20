import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import fetch from "node-fetch";

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { query, userId = 1 } = await req.json();

    if (!query) return NextResponse.json({ tool: "error", error: "Falta query" });

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("libros") || lowerQuery.includes("románticos") || lowerQuery.includes("famosos")) {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=5`
      );
      const data = await res.json();
      const books = (data.items || []).map((b: any) => ({
        bookId: b.id,
        title: b.volumeInfo.title || "Sin título",
        authors: Array.isArray(b.volumeInfo.authors) ? b.volumeInfo.authors : ["Desconocido"],
        pageCount: b.volumeInfo.pageCount || 0,
        description: b.volumeInfo.description || "",
        thumbnail: b.volumeInfo.imageLinks?.thumbnail || null,
      }));
      return NextResponse.json({ tool: "searchBooks", books });
    }

    if (lowerQuery.includes("cuéntame") || lowerQuery.includes("detalles") || lowerQuery.includes("más sobre")) {
      const bookIdMatch = query.match(/(?:sobre|cuéntame|detalles)\s(.+)/i);
      if (!bookIdMatch) return NextResponse.json({ tool: "error", error: "No se encontró libro" });

      const bookId = bookIdMatch[1].trim().replace(/\s/g, "_");

      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`);
      if (!res.ok) return NextResponse.json({ tool: "error", error: "Libro no encontrado en Google Books" });
      const data = await res.json();
      const b = data.volumeInfo;

      return NextResponse.json({
        tool: "getBookDetails",
        book: {
          bookId: data.id,
          title: b.title || "Sin título",
          authors: Array.isArray(b.authors) ? b.authors : ["Desconocido"],
          pageCount: b.pageCount || 0,
          description: b.description || "",
          thumbnail: b.imageLinks?.thumbnail || null,
        },
      });
    }

    if (lowerQuery.includes("pon en mi lista") || lowerQuery.includes("agrega a mi lista")) {
      const titleMatch = query.match(/libro (.+)/i);
      const title = titleMatch ? titleMatch[1] : query;
      const bookId = title.replace(/\s/g, "_");

      const existing = await prisma.readingList.findFirst({ where: { userId, bookId } });
      if (existing) return NextResponse.json({ tool: "addToReadingList", result: { already: true } });

      await prisma.readingList.create({
        data: { userId, bookId, title, authors: "Varios autores" },
      });

      return NextResponse.json({ tool: "addToReadingList", result: { already: false } });
    }

    if (lowerQuery.includes("mi lista") || lowerQuery.includes("qué libros")) {
      const list = await prisma.readingList.findMany({ where: { userId } });
      return NextResponse.json({ tool: "getReadingList", list });
    }

    if (lowerQuery.includes("ya lei") || lowerQuery.includes("terminé")) {
      const titleMatch = query.match(/libro (.+)/i);
      if (!titleMatch) return NextResponse.json({ tool: "error", error: "No se encontró libro" });
      const bookId = titleMatch[1].replace(/\s/g, "_");

      const book = await prisma.readingList.findFirst({ where: { userId, bookId } });
      if (book) {
        await prisma.readingList.delete({ where: { id: book.id } });
        await prisma.booksRead.create({
          data: { userId, bookId, title: book.title, authors: book.authors, finishedAt: new Date() },
        });
      }
      return NextResponse.json({ tool: "markAsRead" });
    }

    if (lowerQuery.includes("estadísticas") || lowerQuery.includes("stats")) {
      const totalRead = await prisma.booksRead.count({ where: { userId } });
      const totalReading = await prisma.readingList.count({ where: { userId } });
      const pagesTotalAgg = await prisma.booksRead.aggregate({
        _sum: { pages: true },
        where: { userId },
      });

      return NextResponse.json({
        tool: "getReadingStats",
        stats: {
          totalRead,
          totalReading,
          pagesTotal: pagesTotalAgg._sum.pages || 0,
        },
      });
    }

    return NextResponse.json({ tool: "error", error: "No entendí la solicitud" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ tool: "error", error: err.message || "Error desconocido" });
  }
}

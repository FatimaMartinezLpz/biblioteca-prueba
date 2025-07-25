import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Libro {
    id?: number;
    title: string;
    author: string;
    description?: string;
    category: string;
    price: number;
    stock: number;
    cover_url?: string;
}


@Injectable({
    providedIn: 'root'
})
export class BookService {
    private readonly API_URL = 'http://127.0.0.1:8000/api/books';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getLibros(): Observable<Libro[]> {
        return this.http.get<Libro[]>(this.API_URL);
    }

    addLibro(libro: Libro): Observable<Libro> {
        return this.http.post<Libro>(this.API_URL, libro, {
            headers: this.getHeaders()
        });
    }

    deleteLibro(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`, {
            headers: this.getHeaders()
        });
    }

    updateLibro(id: number, libro: Libro): Observable<Libro> {
        return this.http.put<Libro>(`${this.API_URL}/${id}`, libro, {
            headers: this.getHeaders()
        });
    }
}

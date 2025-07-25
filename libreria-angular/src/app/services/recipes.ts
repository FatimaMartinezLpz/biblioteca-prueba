import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private apiUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) { }

  getRecipes() {
    return this.http.get(`${this.apiUrl}/search.php?s=`);
  }

  searchRecipes(term: string) {
    return this.http.get(`${this.apiUrl}/search.php?s=${term}`);
  }
}
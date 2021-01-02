import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap, switchMap, toArray } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Movie, MovieSearch, MovieSearchItem } from '../models/';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private url = environment.movieUrl + environment.apiKey;

  constructor(private http: HttpClient) { }

  public getMoviesByTitle(title: string): Observable<Array<Movie>> {
    return this.http.get<MovieSearch>(`${this.url}&s=${title}&type=movie`).pipe(
      // Observable MovieSearch
      switchMap((movies: MovieSearch) => {
        // Observable Array<MovieSearchItem>
        return from(movies.Search).pipe(
          // Observable MovieSearchItem
          mergeMap((movie: MovieSearchItem) => {
            // Observable Movie
            return this.http.get<Movie>(`${this.url}&i=${movie.imdbID}`);
          }),
          // Observable Array<Movie>
          toArray()
        );
      })
    );
  }

}

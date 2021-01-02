import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-reactive-movie-ui',
  templateUrl: './reactive-movie-ui.component.html',
  styleUrls: ['./reactive-movie-ui.component.scss'],
})
export class ReactiveMovieUiComponent implements OnInit {
  public movies$: Observable<Array<Movie>>;
  public filteredMovies$: Observable<Array<Movie>>;

  public numberOrder = true;
  public search = new FormControl('');
  public title = new FormControl('');

  private _releasedOrder = undefined;
  public get releasedOrder(): boolean {
    return this._releasedOrder;
  }
  public set releasedOrder(v: boolean) {
    this._releasedOrder = v;
    this.releasedOrderSubject.next(v);
  }
  private releasedOrderSubject = new BehaviorSubject<boolean>(
    this.releasedOrder
  );

  constructor(private service: MovieService) {}

  ngOnInit(): void {
    this.movies$ = this.search.valueChanges.pipe(
      debounceTime(1000),
      switchMap((next) => {
        if (next) {
          return this.service.getMoviesByTitle(next);
        }
        return of([]);
      })
    );

    this.filteredMovies$ = combineLatest([
      this.movies$,
      this.title.valueChanges.pipe(startWith(''), debounceTime(500)),
      this.releasedOrderSubject.asObservable(),
    ]).pipe(
      map(([movies, title, released]: [Array<Movie>, string, boolean]) => {
        const moviesOrderByName = [...movies].sort((a, b) => {
          return a.Title < b.Title ? -1 : a.Title > b.Title ? 1 : 0;
        });
        const moviesFilteredByTitle = title.length > 0 ? moviesOrderByName.filter(m => m.Title.toLowerCase().includes(title.toLowerCase())) : moviesOrderByName;
        const moviesOrderedByReleased = released === undefined ? moviesFilteredByTitle : released ? [...moviesFilteredByTitle].sort((a, b) => new Date(b.Released).getTime() - new Date(a.Released).getTime())
            : [...moviesFilteredByTitle].sort((a, b) => new Date(a.Released).getTime() - new Date(b.Released).getTime());
        return moviesOrderedByReleased;
      })
    );
  }
}

export interface MovieSearch {
    Search: Array<MovieSearchItem>;
    totalResults: number;
    Response: boolean;
}

export interface MovieSearchItem {
    Title: string;
    Year: number;
    imdbID: string;
    Type: string;
    Poster: string;
}

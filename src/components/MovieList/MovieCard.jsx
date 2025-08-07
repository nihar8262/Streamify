import React from "react";
import { Link } from 'react-router-dom';
import "./MovieCard.css";
import Star from "../../assets/star.png";

const MovieCard = ({ movie }) => {

    
    return (
        <div className='movie_card'>
        <Link to={`/movie/${movie.id}`} className='movie_link'>
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt='movie poster'
                className='movie_poster'
            />
            
            <div className='movie_details'>
                <h3 className='movie_details_heading'>
                    {movie.original_title}
                </h3>
                <div className='align_center movie_date_rate'>
                    <p>{movie.release_date}</p>
                    <p className='align_center'>
                        {movie.vote_average}
                        <img
                            src={Star}
                            alt='rating icon'
                            className='card_emoji'
                        />
                    </p>
                </div>
            </div>
        </Link>
    </div>
    );
};



export default MovieCard;

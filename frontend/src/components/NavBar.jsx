import { Link } from 'react-router-dom';

export function NavBar ({name,link}) {
    return (
    <nav className = 'NavBar'>
        <Link className='nb-lista' to={link}>
            {name}
        </Link>
    </nav> 
 )

}
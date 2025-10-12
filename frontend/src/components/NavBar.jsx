export function NavBar ({name,link}) {
    return (
    <nav className = 'NavBar'>
            <a className = 'nb-lista' href={link}>{name}</a>
    </nav> )
}
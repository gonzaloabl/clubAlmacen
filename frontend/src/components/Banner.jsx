export function Banner ({texto,subtitulo,imagen,fondo}) {
    return (
        
        <article className ='c-banner'>
            <div className="contenedor-imagen">
            <img className='fondo' src={fondo}></img>
            </div>
            <div className="contenedor-textos">
            <div className="b-textos">
                <div className="b-tittle">{texto}</div>
                <div className="b-subtittle">{subtitulo}</div>
            </div>
            </div>
        </article>
    )
}   
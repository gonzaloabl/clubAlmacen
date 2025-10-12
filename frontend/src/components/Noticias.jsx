export function Noticias ({}) {
    return (
        <section className="noticias">
            <article className="card-noticia">
                <img src="https://img.freepik.com/vector-gratis/grafico-noticias-ultima-hora-directo_1308-180321.jpg?semt=ais_hybrid&w=740&q=80" alt="Noticia 1" className="card-img" />
                <div className="card-contenido">
                <h3 className="card-titulo">Título de la noticia</h3>
                <p className="card-descripcion">
                Breve resumen o introducción de la noticia para invitar a leer más.
                </p>
        <button className="card-boton">Leer más</button>
    </div>
  </article>

  {/* Duplica el bloque anterior para más noticias */}
</section>

    )
}
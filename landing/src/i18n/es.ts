import type { Dict } from './en';

export const es: Dict = {
  meta: {
    landing: {
      title: 'Tagr: editor de metadatos de música self hosted para MP3 y FLAC',
      description:
        'Tagr es un editor de metadatos de música self hosted y de código abierto. Explora, filtra, reproduce y edita etiquetas de MP3, FLAC, M4A y Opus desde el navegador.',
      ogTitle: 'Tagr: el editor de metadatos de música self hosted para toda tu biblioteca',
    },
    docs: {
      title: 'Instalar Tagr: guía de Docker y configuración',
      description:
        'Cómo instalar y configurar Tagr, el editor de metadatos de música self hosted. Docker Compose, variables de entorno, montaje de carpetas de música y resolución de problemas.',
      ogTitle: 'Instalar Tagr: Docker y configuración',
    },
    notFound: {
      title: 'Página no encontrada: Tagr',
      description: 'Esa página no existe. Vuelve a la portada de Tagr o a la guía de instalación.',
    },
  },

  common: {
    skipToContent: 'Saltar al contenido',
    copy: 'Copiar',
    copied: 'Copiado',
    copyAria: 'Copiar el código al portapapeles',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    close: 'Cerrar',
    langLabel: 'Idioma',
    github: 'GitHub',
    viewOnGithub: 'Ver en GitHub',
    liveDemo: 'Demo',
    tryDemo: 'Prueba la demo',
    readDocs: 'Leer la documentación',
    onThisPage: 'En esta página',
  },

  nav: {
    features: 'Funciones',
    screenshots: 'Capturas',
    comparison: 'Comparativa',
    docs: 'Docs',
    faq: 'Preguntas',
  },

  hero: {
    eyebrow: 'Código abierto, AGPL-3.0, self hosted',
    h1Before: 'El ',
    h1Gradient: 'editor de metadatos de música self hosted',
    h1After: ' para toda tu biblioteca',
    sub: 'Escanea tus carpetas de música y explora, filtra, reproduce y edita etiquetas de MP3, FLAC, M4A y Opus desde el navegador. Funciona en Docker. Tus archivos nunca salen de tu servidor.',
    ctaPrimary: 'Prueba la demo',
    ctaPrimaryNote: 'demo / demo, solo lectura',
    ctaSecondary: 'Desplegar con Docker',
    runCommand:
      'docker run -d -p 3000:3000 -v /ruta/a/tu/musica:/music ghcr.io/suitux/tagr:latest',
    imageAlt:
      'Tagr, un editor de metadatos de música self hosted, con su interfaz de tres paneles: el árbol de carpetas, una lista de canciones en FLAC y el editor de metadatos, con el reproductor de onda abajo a la izquierda',
  },

  trust: [
    { icon: 'scale', label: 'AGPL-3.0' },
    { icon: 'cpu', label: 'amd64 y arm64' },
    { icon: 'shield', label: 'Sin telemetría' },
    { icon: 'database', label: 'SQLite, sin base de datos externa' },
    { icon: 'smartphone', label: 'Funciona en el móvil' },
  ],

  why: {
    h2: 'Por qué usar un editor de metadatos de música self hosted',
    items: [
      {
        title: 'Tu música, tu servidor.',
        body: 'Sin nube, sin cuentas, sin subidas. Tagr escribe las etiquetas directamente en los archivos de tu NAS.',
      },
      {
        title: 'Pensado para bibliotecas grandes.',
        body: 'El scroll virtual y el índice en SQLite aguantan decenas de miles de pistas sin despeinarse.',
      },
      {
        title: 'Edita desde donde quieras.',
        body: 'Solo hace falta un navegador. Nada de Wine, nada de VNC, nada de editores de escritorio.',
      },
    ],
  },

  features: {
    h2: 'Un editor de etiquetas MP3 autoalojado que hace el trabajo entero',
    blocks: [
      {
        title: 'Edita más de 40 campos de metadatos.',
        body: 'Título, artista, álbum, año, género, compositor, BPM, letras, campos de ordenación, números de catálogo, códigos de barras. Añade tus propias etiquetas personalizadas más allá del conjunto estándar. Gestiona la carátula: verla, sustituirla, subirla. Valoración de 1 a 5 estrellas. Códec, bitrate, frecuencia de muestreo, canales y profundidad de bits en modo lectura.',
        alt: 'Editor de metadatos de Tagr con un filtro de búsqueda sobre la lista de canciones y el panel de detalle abierto en los campos de título, artista y álbum',
      },
      {
        title: 'Historial completo con reversión en un clic.',
        body: 'Cada cambio queda registrado con su valor anterior y el nuevo. Revierte una edición, o selecciona con shift y ctrl para deshacer decenas de golpe. Hay historial por canción y por carpeta.',
        alt: 'Panel de historial de Tagr con la lista de cambios de metadatos, sus valores anterior y nuevo, y una acción de revertir en cada fila',
      },
      {
        title: 'Reproductor integrado con onda.',
        body: 'Una onda de WaveSurfer.js con clic para saltar, play y pausa, anterior y siguiente, avance automático. Un reproductor lateral plegable con carátula. Escucha la pista que estás etiquetando sin salir de la página.',
        altBig: 'Reproductor lateral de Tagr expandido con carátula, título de la pista y una onda interactiva de WaveSurfer',
        altMini: 'Reproductor mini de Tagr plegado, con la pista actual y los controles de reproducción en una sola fila',
      },
      {
        title: 'Explora una biblioteca de cualquier tamaño.',
        body: 'Tres paneles redimensionables: árbol de carpetas, lista de canciones y editor de detalle. Ordena por cualquier columna. Filtra por texto, rango numérico, rango de fechas o valor booleano. Muestra u oculta cualquiera de las más de 40 columnas. Scroll virtual y paginación infinita.',
        altColumns: 'Selector de columnas de Tagr con los interruptores de las más de 40 columnas disponibles en la lista de canciones',
        altTree: 'Árbol de carpetas de Tagr con un menú contextual que ofrece reescanear la carpeta y ver su historial',
      },
      {
        title: 'Comparte la biblioteca, no la contraseña.',
        body: 'Cada persona con su propia cuenta. La de administrador sale de tu fichero de entorno; el resto se crean dentro de Tagr con un rol: un Tagger navega, escucha, edita metadatos y reescanea; un Listener solo navega y escucha. La interfaz oculta lo que el rol no puede hacer y la API lo comprueba en cada petición. El historial de escuchas y las reproducciones se guardan por usuario.',
        alt: 'Diálogo de ajustes de Tagr abierto en la sección de usuarios, con una cuenta tagger y otra listener, sus etiquetas de rol y las acciones de editar y borrar',
      },
      {
        title: 'Envía tus escuchas a ListenBrainz.',
        body: 'Pega tu token de ListenBrainz una vez y cada reproducción llega a tu perfil, además del aviso de reproduciendo ahora mientras suena la pista. Cada usuario conecta su propia cuenta, los tokens se cifran antes de tocar la base de datos y las escuchas se encolan y reintentan si ListenBrainz no responde. Puedes apuntarlo a tu propio servidor compatible si también lo autoalojas.',
        alt: 'Diálogo de ajustes de Tagr abierto en la sección de integraciones de terceros, con la conexión a ListenBrainz, el token guardado y el campo opcional de API root',
      },
    ],
    grid: [
      {
        icon: 'search',
        title: 'Búsqueda en MusicBrainz',
        body: 'Compara canciones con MusicBrainz y elige exactamente qué campos aplicar.',
      },
      {
        icon: 'layers',
        title: 'Edición masiva',
        body: 'Selecciona muchas canciones, aplica los mismos cambios o carátulas de una vez, confirma y revisa el resumen.',
      },
      {
        icon: 'smartphone',
        title: 'Interfaz mobile first',
        body: 'Paneles a pantalla completa con gestos, reproductor expandido y acciones de edición siempre visibles. Se instala como PWA.',
      },
      {
        icon: 'list-music',
        title: 'Listas personalizadas',
        body: 'Agrupa canciones al margen de la estructura de carpetas.',
      },
      {
        icon: 'audio-waveform',
        title: 'Detección de lossless',
        body: 'FLAC, WAV, AIFF y compañía reciben una insignia Lossless automática.',
      },
      {
        icon: 'link',
        title: 'Estado en la URL',
        body: 'Carpeta, canción, orden y filtros viven en la URL. Guarda o comparte cualquier vista.',
      },
      {
        icon: 'users',
        title: 'Autenticación multiusuario',
        body: 'Acceso protegido por contraseña, con gestión de usuarios incluida.',
      },
      {
        icon: 'moon',
        title: 'Oscuro por defecto',
        body: 'Porque vas a pasar un buen rato aquí dentro.',
      },
    ],
  },

  formats: {
    h2: 'Formatos de audio compatibles: MP3, FLAC, M4A, Opus y más',
    list: [
      { name: 'MP3', lossless: false },
      { name: 'FLAC', lossless: true },
      { name: 'WAV', lossless: true },
      { name: 'AAC', lossless: false },
      { name: 'OGG', lossless: false },
      { name: 'M4A', lossless: false },
      { name: 'M4B', lossless: false },
      { name: 'WMA', lossless: false },
      { name: 'AIFF', lossless: true },
      { name: 'Opus', lossless: false },
    ],
    losslessBadge: 'Lossless',
    note: 'Tagr lee y escribe etiquetas con node-taglib-sharp y extrae los metadatos con music-metadata, las mismas librerías en las que se apoyan los editores de escritorio. Los formatos sin pérdida se detectan de forma automática.',
  },

  gallery: {
    h2: 'Tagr en funcionamiento',
    tabs: { desktop: 'Escritorio', mobile: 'Móvil' },
    openAria: 'Abrir la captura a tamaño completo',
    dialogClose: 'Cerrar la captura',
    desktop: [
      {
        caption: 'El navegador de tres paneles.',
        alt: 'Interfaz de tres paneles de Tagr con el árbol de carpetas a la izquierda, una lista densa de canciones en el centro y el editor de metadatos a la derecha',
      },
      {
        caption: 'Buscar y editar en la misma vista.',
        alt: 'Tagr con una búsqueda de texto filtrando la lista de canciones mientras el editor de metadatos sigue abierto en la pista seleccionada',
      },
      {
        caption: 'Cada cambio, con su reversión al lado.',
        alt: 'Historial de cambios de Tagr mostrando cada edición de metadatos con su valor anterior, el nuevo y un botón de revertir',
      },
      {
        caption: 'Solo las columnas que usas.',
        alt: 'Menú de visibilidad de columnas de Tagr con casillas para título, artista, álbum, bitrate y decenas de columnas más',
      },
      {
        caption: 'Usuarios y roles, sin tocar ficheros de configuración.',
        alt: 'Diálogo de ajustes de Tagr en la sección de usuarios, con una cuenta tagger, otra listener y el botón de crear usuario',
      },
      {
        caption: 'Tus escuchas, en tu perfil de ListenBrainz.',
        alt: 'Diálogo de ajustes de Tagr en la sección de integraciones de terceros, con la cuenta de ListenBrainz conectada',
      },
    ],
    mobile: [
      {
        caption: 'La lista de canciones en el móvil.',
        alt: 'Lista de canciones de Tagr en móvil, con las pistas, su artista y su álbum en un panel a pantalla completa',
      },
      {
        caption: 'El reproductor expandido.',
        alt: 'Reproductor de Tagr en móvil, expandido a pantalla completa con carátula, onda y controles de reproducción',
      },
      {
        caption: 'Editar etiquetas desde el móvil.',
        alt: 'Vista de detalle de canción de Tagr en móvil, con campos de metadatos editables y acciones de edición siempre visibles',
      },
      {
        caption: 'Elegir campos de MusicBrainz.',
        alt: 'Vista de comparación con MusicBrainz de Tagr en móvil, para elegir qué campos coincidentes se aplican',
      },
    ],
  },

  comparison: {
    h2: 'Tagr frente a otros editores de etiquetas',
    intro:
      'Casi todos los editores de etiquetas son aplicaciones de escritorio que tienes que ejecutar en la misma máquina que tus archivos. Tagr se ejecuta donde ya vive tu música.',
    tableAria: 'Comparativa de funciones entre Tagr, MusicBrainz Picard, Mp3tag, beets y MetadataRemote',
    featureCol: 'Capacidad',
    cols: ['Tagr', 'MusicBrainz Picard', 'Mp3tag', 'beets', 'MetadataRemote'],
    rows: [
      {
        feature: 'Funciona en el navegador, self hosted',
        cells: ['Sí', 'No, es de escritorio', 'No, es de escritorio', 'No, es CLI', 'Sí'],
      },
      {
        feature: 'Funciona en el móvil',
        cells: ['Sí, con gestos e instalación PWA', 'No', 'No', 'No', 'Responsive, no específico para móvil'],
      },
      {
        feature: 'Docker, multiarquitectura',
        cells: ['amd64, arm64', 'n/a', 'Windows primero', 'Sí', 'amd64, arm64, armv7'],
      },
      {
        feature: 'Interfaz de edición manual',
        cells: ['Sí, más de 40 campos', 'Sí', 'Sí, muy a fondo', 'No, CLI y configuración', 'Sí, todos los campos más campos personalizados'],
      },
      {
        feature: 'Campos de metadatos personalizados',
        cells: ['Sí', 'Sí', 'Sí', 'Sí', 'Sí'],
      },
      {
        feature: 'Edición masiva',
        cells: ['Sí, selección múltiple con resumen', 'Sí', 'Sí', 'Sí', 'Sí, por archivo o carpeta entera'],
      },
      {
        feature: 'Búsqueda en MusicBrainz',
        cells: ['Sí', 'Sí, la mejor del sector', 'Con un plugin', 'Sí', 'Sí, con puntuación de confianza'],
      },
      {
        feature: 'Deshacer y revertir',
        cells: [
          'Registro persistente en SQLite, sobrevive a los reinicios, por canción y por carpeta',
          'No',
          'No',
          'No',
          'Deshacer y rehacer hasta 1.000 operaciones, en memoria, se pierde al reiniciar el contenedor',
        ],
      },
      {
        feature: 'Reproductor integrado',
        cells: ['Sí, onda con clic para saltar', 'Vista previa básica', 'No', 'No', 'Sí, streaming en el navegador'],
      },
      {
        feature: 'Gestión de carátulas',
        cells: ['Sí: ver, sustituir, subir, aplicar en masa', 'Sí', 'Sí', 'Con un plugin', 'Sí'],
      },
      {
        feature: 'Tabla ordenable y filtrable con más de 40 columnas',
        cells: ['Sí', 'No', 'Sí', 'n/a', 'No'],
      },
      {
        feature: 'Filtros avanzados: texto, número, fecha, booleano',
        cells: ['Sí', 'No', 'Parcial', 'Con consultas', 'Solo filtro de búsqueda'],
      },
      {
        feature: 'Autenticación y multiusuario',
        cells: ['Sí, incluida', 'n/a', 'n/a', 'n/a', 'Ninguna, solo LAN, necesita un proxy inverso'],
      },
      {
        feature: 'Estado en la URL, compartible y guardable',
        cells: ['Sí', 'No', 'No', 'No', 'No'],
      },
      {
        feature: 'Formatos',
        cells: [
          'MP3, FLAC, WAV, AAC, OGG, M4A, M4B, WMA, AIFF, Opus',
          'Amplios',
          'Amplios',
          'Amplios',
          'MP3, FLAC, OGG, Opus, M4A, M4B, WMA, WAV, WavPack',
        ],
      },
      {
        feature: 'Licencia',
        cells: ['AGPL-3.0', 'GPL-2.0', 'Freeware, cerrado', 'MIT', 'AGPL-3.0'],
      },
    ],
    closing:
      'Picard y beets brillan organizando bibliotecas de forma automática a partir de huellas acústicas, y Mp3tag es el editor manual más profundo de Windows. Los tres quieren ejecutarse en la máquina donde están tus archivos. Tagr deja la biblioteca donde ya está y te entrega un navegador: una vista ordenable y filtrable de cada pista, un registro persistente de cada cambio que puedes revertir, autenticación incluida y una interfaz que funciona de verdad en el móvil.',
    faqLink: 'Más sobre en qué se diferencia Tagr, en las preguntas frecuentes',
  },

  install: {
    h2: 'Instala Tagr con Docker',
    intro: 'Tres comandos y un volumen montado. El fichero compose de abajo es el del repositorio.',
    tabs: ['Docker Compose', 'Docker run', 'Manual, Node 22+'],
    steps: [
      {
        title: 'Genera el secreto de autenticación',
        body: 'Ejecuta openssl rand -hex 32 y pega el resultado en AUTH_SECRET.',
      },
      {
        title: 'Levanta el contenedor',
        body: 'Ejecuta docker compose up -d en la carpeta donde esté tu fichero compose.',
      },
      {
        title: 'Ábrelo y escanea',
        body: 'Entra en http://localhost:3000, inicia sesión y pulsa escanear para indexar tu biblioteca.',
      },
    ],
    docsLink: 'Documentación completa de instalación',
  },

  faq: {
    h2: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Qué es un editor de metadatos de música y por qué alojarlo uno mismo?',
        a: 'Un editor de metadatos lee y escribe las etiquetas que van dentro de los archivos de audio: título, artista, álbum, año, género, carátula y decenas más. Esas etiquetas son las que leen Jellyfin, Navidrome o Plex para construir tu biblioteca, así que unas etiquetas malas significan una biblioteca rota. Alojar el editor tú mismo quiere decir que los archivos se quedan en tu servidor y los arreglas desde el navegador, en vez de copiar terabytes a un portátil.',
      },
      {
        q: '¿Tagr modifica mis archivos de audio originales?',
        a: 'Sí, y de eso se trata. Tagr escribe las etiquetas en los archivos reales del disco con node-taglib-sharp, así que cualquier otro reproductor ve el cambio. El audio en sí no se vuelve a codificar nunca. Cada escritura queda anotada en el historial con su valor anterior y el nuevo, de modo que puedes revertirla.',
      },
      {
        q: '¿Qué formatos de audio admite Tagr?',
        a: 'MP3, FLAC, WAV, AAC, OGG, M4A, M4B, WMA, AIFF y Opus. Los formatos sin pérdida se detectan solos y llevan una insignia Lossless en la lista de canciones.',
      },
      {
        q: '¿Puedo ejecutar Tagr en un Synology, un Unraid o una Raspberry Pi?',
        a: 'Sí. La imagen de GHCR es multiarquitectura y cubre linux/amd64 y linux/arm64, así que funciona en NAS x86, en Apple Silicon y en una Raspberry Pi 4 o 5 con un sistema de 64 bits. Monta tu carpeta de música en /music dentro del contenedor y pon PUID y PGID al usuario que sea dueño de los archivos.',
      },
      {
        q: '¿Cómo de grande puede ser la biblioteca?',
        a: 'Decenas de miles de pistas. Los metadatos se indexan en SQLite durante el escaneo, la lista de canciones usa scroll virtual con paginación infinita, y los filtros y las ordenaciones se resuelven en la base de datos, no en el navegador. La parte lenta es el primer escaneo, porque hay que leer cada archivo una vez.',
      },
      {
        q: '¿Tagr es libre y de código abierto?',
        a: 'Sí, con licencia AGPL-3.0-only. El código está en GitHub, no hay versión de pago ni claves de licencia. Si te ahorra una tarde de etiquetado, puedes invitar a un café al autor.',
      },
      {
        q: '¿Tagr envía datos a la nube?',
        a: 'Ni telemetría, ni analítica, ni llamadas a casa. La única salida a internet que puede hacer Tagr es a la API de MusicBrainz, y solo cuando le pides explícitamente que busque una canción. Si no usas esa función, el contenedor no habla con internet.',
      },
      {
        q: '¿Puedo usar Tagr desde el móvil?',
        a: 'Sí. La interfaz es responsive y mobile first: paneles a pantalla completa con gestos para moverte entre el árbol de carpetas, la lista y el editor, un reproductor expandido, y acciones de edición siempre visibles en vez de escondidas tras el hover. Se instala como PWA desde el navegador.',
      },
      {
        q: '¿En qué se diferencia Tagr de MusicBrainz Picard o Mp3tag?',
        a: 'Picard y Mp3tag son aplicaciones de escritorio que necesitan ejecutarse en la máquina donde están tus archivos, que para la mayoría de los que autoalojan es un servidor sin pantalla. Tagr se ejecuta en ese servidor y te da una interfaz web. Además guarda un registro persistente de cada edición y funciona en el móvil, cosa que ninguno de los dos hace.',
      },
      {
        q: '¿Pueden usar la misma instancia varias personas?',
        a: 'Sí. Tagr trae acceso protegido por contraseña y gestión de usuarios, así que puedes crear una cuenta para cada persona que comparte la biblioteca, con un rol que decide lo que puede hacer: los taggers editan metadatos y reescanean, los listeners solo navegan y escuchan. El acceso es por usuario, no una única contraseña compartida.',
      },
      {
        q: '¿Puedo deshacer un cambio de metadatos?',
        a: 'Sí. Cada cambio se guarda en SQLite con su valor anterior y el nuevo, y el registro sobrevive a los reinicios del contenedor. Revierte una edición suelta desde el historial de la canción, o selecciona un rango con shift y ctrl y revierte decenas de golpe. Hay vistas de historial por canción y por carpeta.',
      },
      {
        q: '¿Necesito exponer Tagr a internet?',
        a: 'No. Lo normal es dejarlo en la red local y entrar por http://servidor:3000. Si quieres llegar desde fuera, ponlo detrás de un proxy inverso con TLS y configura AUTH_URL con la URL pública para que las sesiones y las redirecciones se resuelvan bien.',
      },
    ],
  },

  finalCta: {
    h2: 'Recupera el control de tus etiquetas',
    note: 'Libre y de código abierto. Se ejecuta en tu hardware. AGPL-3.0.',
  },

  footer: {
    tagline: 'Un editor de metadatos de música self hosted con una interfaz web moderna e intuitiva.',
    groups: [
      {
        title: 'Producto',
        links: [
          { label: 'Funciones', href: '#features' },
          { label: 'Capturas', href: '#screenshots' },
          { label: 'Comparativa', href: '#comparison' },
          { label: 'Demo', href: 'https://tagr-demo.fly.dev/', external: true },
        ],
      },
      {
        title: 'Docs',
        links: [
          { label: 'Inicio rápido', href: '/es/docs/#quick-start' },
          { label: 'Docker', href: '/es/docs/#quick-start' },
          { label: 'Configuración', href: '/es/docs/#environment-variables' },
          { label: 'Problemas comunes', href: '/es/docs/#troubleshooting' },
        ],
      },
      {
        title: 'Proyecto',
        links: [
          { label: 'GitHub', href: 'https://github.com/suitux/Tagr', external: true },
          { label: 'Versiones', href: 'https://github.com/suitux/Tagr/releases', external: true },
          { label: 'Incidencias', href: 'https://github.com/suitux/Tagr/issues', external: true },
          { label: 'Licencia', href: 'https://github.com/suitux/Tagr/blob/main/LICENSE', external: true },
        ],
      },
      {
        title: 'Apoyo',
        links: [
          { label: 'Patrocinar', href: 'https://github.com/sponsors/suitux', external: true },
          { label: 'Reportar un fallo', href: 'https://github.com/suitux/Tagr/issues/new', external: true },
        ],
      },
    ],
    bmc: 'Invítame a un café',
    rights: 'Tagr, AGPL-3.0',
  },

  notFound: {
    h1: 'Esa página no existe',
    body: 'El enlace está roto o la página se movió. Dos sitios que merece la pena probar:',
    home: 'Volver a la portada',
    docs: 'Guía de instalación y configuración',
  },

  docs: {
    h1: 'Instalar y configurar Tagr',
    intro:
      'Todo lo necesario para ejecutar Tagr, el editor de metadatos de música self hosted, en tu propio servidor. Docker Compose es el camino más rápido. Debajo tienes la instalación manual con Node.',
    sections: {
      requirements: {
        title: 'Requisitos',
        body: 'Docker y el plugin de Docker Compose, en cualquier equipo que ejecute linux/amd64 o linux/arm64. Eso cubre la mayoría de NAS, un servidor doméstico, un VPS y una Raspberry Pi 4 o 5 con un sistema de 64 bits. Si prefieres no usar Docker, necesitas Node.js 22 o superior y pnpm. También necesitas permisos de lectura y escritura sobre las carpetas de música que quieras editar, porque Tagr escribe las etiquetas dentro de los propios archivos.',
      },
      quickStart: {
        title: 'Inicio rápido con Docker Compose',
        p1: 'Descarga el fichero compose del repositorio:',
        p2: 'Genera un secreto para firmar las sesiones y pega el resultado en AUTH_SECRET:',
        p3: 'Edita el bloque de entorno, pon tu propio AUTH_USER y AUTH_PASSWORD, y apunta el segundo volumen a tu música. Después levántalo:',
        p4: 'Abre http://localhost:3000, inicia sesión con las credenciales que hayas puesto y pulsa el botón de escanear para indexar la biblioteca. El primer escaneo lee cada archivo una vez, así que en una biblioteca grande tarda un rato.',
      },
      mounting: {
        title: 'Montar las carpetas de música',
        p1: 'Tagr escanea /music de forma recursiva. Si tu música está repartida en varios sitios del anfitrión, monta cada uno como un subdirectorio dentro de /music y se recogen todos de forma automática:',
        p2: 'MUSIC_FOLDERS solo hace falta cuando quieres restringir el escaneo a subdirectorios concretos, por ejemplo indexar /music/library y saltarte /music/podcasts. Si lo dejas sin definir, se escanea todo lo que cuelgue de /music.',
        p3: 'Tagr necesita permiso de escritura sobre esas rutas. Pon PUID y PGID al usuario y al grupo que son dueños de los archivos en el anfitrión, o guardar una etiqueta fallará con un error de permisos.',
      },
      env: {
        title: 'Variables de entorno',
        cols: ['Variable', 'Obligatoria', 'Descripción', 'Ejemplo'],
        rows: [
          {
            name: 'DATABASE_URL',
            required: 'Sí',
            desc: 'Ruta de la base de datos SQLite. Mantenla en un volumen persistente.',
            example: 'file:/data/tagr.db',
          },
          {
            name: 'AUTH_SECRET',
            required: 'Sí',
            desc: 'Secreto con el que se firman las sesiones JWT. Genéralo con openssl rand -hex 32.',
            example: 'c5398a60cfd6...',
          },
          {
            name: 'AUTH_USER',
            required: 'Sí',
            desc: 'Nombre de usuario de la cuenta inicial.',
            example: 'admin',
          },
          {
            name: 'AUTH_PASSWORD',
            required: 'Sí',
            desc: 'Contraseña de la cuenta inicial.',
            example: 'una-contrasena-larga',
          },
          {
            name: 'AUTH_URL',
            required: 'No',
            desc: 'URL pública de la instancia. Hace falta cuando Tagr está detrás de un proxy inverso, para que las redirecciones y las cookies de sesión apunten al origen correcto.',
            example: 'https://tagr.ejemplo.com',
          },
          {
            name: 'MUSIC_FOLDERS',
            required: 'No',
            desc: 'Lista de rutas a escanear, separadas por comas. Por defecto, /music. Ponlo solo para restringir el escaneo a subdirectorios concretos.',
            example: '/music/library,/music/nas',
          },
          {
            name: 'PUID',
            required: 'No',
            desc: 'ID de usuario con el que corre el proceso del contenedor. Que coincida con el dueño de tus archivos. Solo en Docker.',
            example: '1000',
          },
          {
            name: 'PGID',
            required: 'No',
            desc: 'ID de grupo con el que corre el proceso del contenedor. Solo en Docker.',
            example: '1000',
          },
          {
            name: 'NODE_ENV',
            required: 'No',
            desc: 'Modo de ejecución. Usa production en un despliegue normal.',
            example: 'production',
          },
        ],
      },
      manual: {
        title: 'Instalación manual',
        p1: 'Necesita Node.js 22 o superior.',
        p2: 'Crea un fichero .env en la raíz del proyecto:',
        p3: 'Después compila y arranca:',
      },
      scanning: {
        title: 'Escanear la biblioteca',
        p1: 'Un escaneo recorre las carpetas configuradas, lee las etiquetas de cada archivo de audio con music-metadata e inserta o actualiza una fila por pista en SQLite. No se copia nada, no se mueve nada y no se recodifica ningún audio. La base de datos es un índice de tus archivos, no un sustituto.',
        p2: 'Reescanear es seguro y se puede repetir. Los archivos nuevos se añaden, los que han desaparecido del disco se quitan del índice, y las filas existentes se actualizan en su sitio, así que tu historial de cambios sobrevive. Al terminar, un diálogo resume cuántos archivos se añadieron, se actualizaron y se eliminaron.',
        p3: 'Desde el menú contextual del árbol de carpetas puedes reindexar una sola carpeta en vez de la biblioteca entera.',
      },
      updating: {
        title: 'Actualizar',
        p1: 'Descarga la nueva imagen y recrea el contenedor. El volumen de la base de datos no se toca, así que no se reescanea nada:',
      },
      backups: {
        title: 'Copias de seguridad',
        p1: 'Hay dos cosas que conviene respaldar, y solo una es de Tagr. Tus etiquetas viven dentro de los propios archivos de audio, así que tu copia de seguridad de la música ya las cubre. Lo que es de Tagr es la base de datos SQLite del volumen sqlite_data, que guarda el índice, tus filtros guardados, tus listas y el historial completo de cambios.',
        p2: 'Copia la base de datos fuera del volumen con el contenedor parado, o haz una instantánea del volumen:',
      },
      troubleshooting: {
        title: 'Problemas comunes',
        items: [
          {
            q: 'Guardar una etiqueta falla con un error de permisos',
            a: 'El proceso del contenedor no puede escribir en el archivo. Mira quién es el dueño de la música en el anfitrión con ls -ln, pon PUID y PGID a ese usuario y grupo, y recrea el contenedor. Un bind mount de solo lectura da el mismo síntoma, así que comprueba que el volumen no lleve :ro.',
          },
          {
            q: 'El escaneo termina pero no aparece ningún archivo',
            a: 'Lo más probable es que la música no esté bajo /music dentro del contenedor. Entra y míralo: docker exec -it tagr ls /music. Si la carpeta está vacía, la parte izquierda de los dos puntos del volumen apunta a una ruta equivocada del anfitrión. Si has puesto MUSIC_FOLDERS, confirma que sus rutas son rutas del contenedor, no del anfitrión.',
          },
          {
            q: 'El login redirige al host equivocado detrás de un proxy inverso',
            a: 'Pon AUTH_URL con la URL pública por la que navegas de verdad, incluido el esquema, por ejemplo https://tagr.ejemplo.com. Después asegúrate de que el proxy reenvía las cabeceras Host, X-Forwarded-Proto y X-Forwarded-For.',
          },
          {
            q: 'Notas sobre arm64 y Raspberry Pi',
            a: 'La imagen cubre linux/arm64, así que una Pi 4 o una Pi 5 valen, pero tienen que ir con un sistema de 64 bits. Con una Raspberry Pi OS de 32 bits no se puede descargar la imagen. En una Pi, cuenta con que el primer escaneo de una biblioteca grande sea lento, porque el límite está en leer cada archivo de la tarjeta SD o del disco USB.',
          },
        ],
      },
      proxy: {
        title: 'Ejemplos de proxy inverso',
        p1: 'Caddy, que se encarga del TLS por ti:',
        p2: 'Nginx:',
        p3: 'En los dos casos, pon AUTH_URL con la URL pública para que las redirecciones de sesión acaben en el origen correcto.',
      },
    },
  },
};

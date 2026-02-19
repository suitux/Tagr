import { prisma } from './client'

/**
 * Ejecuta optimizaciones de SQLite usando PRAGMA statements.
 * Llamar esta función al iniciar la aplicación para mejor rendimiento.
 */
export async function optimizeSQLite() {
  // WAL mode para mejor concurrencia
  await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;')

  // Modo de sincronización normal (balance entre seguridad y velocidad)
  await prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;')

  // Aumentar cache size (en páginas de 4KB, -64000 = ~256MB)
  await prisma.$executeRawUnsafe('PRAGMA cache_size = -64000;')

  // Habilitar foreign keys
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;')

  // Almacenar temp tables en memoria
  await prisma.$executeRawUnsafe('PRAGMA temp_store = MEMORY;')

  // Habilitar memory-mapped I/O (256MB)
  await prisma.$executeRawUnsafe('PRAGMA mmap_size = 268435456;')
}

/**
 * Ejecuta VACUUM para optimizar el archivo de la base de datos.
 * Llamar periódicamente o después de eliminar muchos registros.
 */
export async function vacuumDatabase() {
  await prisma.$executeRawUnsafe('VACUUM;')
}

/**
 * Analiza las tablas para optimizar las consultas.
 * Llamar después de insertar/actualizar muchos registros.
 */
export async function analyzeDatabase() {
  await prisma.$executeRawUnsafe('ANALYZE;')
}

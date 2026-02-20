import { prisma } from './dbClient'

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

export async function analyzeDatabase() {
  await prisma.$executeRawUnsafe('ANALYZE;')
}

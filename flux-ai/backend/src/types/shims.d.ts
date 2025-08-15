declare module 'express' {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  const e: any;
  export function json(...args: any[]): any;
  export default e;
}
declare module 'cors' { const anyExport: any; export default anyExport; }
declare module 'http' { export const createServer: any; }
declare module 'socket.io' { export class Server { constructor(...args: any[]); on: any; emit: any; } }
declare module '@prisma/client' { export class PrismaClient { [key: string]: any } }
declare module 'bcryptjs' { const anyExport: any; export default anyExport; export function hash(...args: any[]): any; export function compare(...args: any[]): any; }
declare module 'jsonwebtoken' { const anyExport: any; export default anyExport; export function sign(...args: any[]): any; export function verify(...args: any[]): any; }
declare module 'zod' { export const z: any; export default z; }
declare module 'archiver' { const anyExport: any; export default anyExport; }
declare var process: any;


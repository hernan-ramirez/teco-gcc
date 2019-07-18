/**
 * Tipo Contratista
 * Proviene del listado de 'Contratistas' en el sitio GCC
 */
export interface IContratista {

    /**
     * Básicos requeridos
     */
    ID: number;
    Title: string;

    /**
     * Contatista
     */
    Region: string;
    Subregion: string;
    Email: string;
    EmailDevolucion: string;

}
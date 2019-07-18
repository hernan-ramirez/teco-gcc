/**
 * Tipo Evento
 * Proviene del listado de 'Eventos' en el sitio GCC
 */
export interface IEvento {
    /**
     * Básicos requeridos
     */
    ID: number;
    Identificador: number;
    Title: string;
    Cuerpo: string;

    /**
     * Ternarios
     * Región - Subregión - Contratista
     */
    Region: string;
    Subregion: string;
    ContratistaID: number;
    ContratistaNombre: string;

    /**
     * Tipos y Estados
     */
    TipoEvento: string;
    Estado: string;

    /**
     * Estampas de SP
     */
    Created?: string;
    Modified?: string;
    DisplayFecha?: string;
}
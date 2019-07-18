import { IListItemAttachmentFile } from "@pnp/spfx-controls-react/lib/ListItemAttachments";

/**
 * Tipo Comunicación
 * Proviene del listado de 'Comunicaciones' en el sitio GCC
 */
export interface IComunicacion {
    /**
     * Básicos requeridos
     */
    ID?: number;
    Identificador?: number;
    Title: string;
    Cuerpo: string;

    /**
     * Tipo de Evento General
     */
    NPA?: string;
    Plazo?: string;

    /**
     * Tipo de Evento Tarea
     */
    PEP?: string;
    Grafo?: string;
    Reserva?: string;
    OE?: string;

    /**
     * Ternarios
     * Región - Subregión - Contratista
     */
    Region?: string;
    Subregion?: string;
    Contratista?: string;
    ContratistaID?: number;

    /**
     * Relaciones
     */
    Evento?: string;
    EventoID?: number;
    EventoId?: number;
    EventoTipo?: string;
    RelacionadaId?: number;

    /**
     * Tipos y estados
     */
    TipoComunicacion?: string;
    EstadoTeco?: string;
    EstadoContratista?: string;
    FechaEnvio?: string;
    DisplayEnvio?: string;
    Email?: string;

    /**
     * Estampas de SP
     */
    Modified?: string;
    Created?: string;
    AttachmentFiles?: IListItemAttachmentFile[];
}
import { WebPartContext } from "@microsoft/sp-webpart-base";

/**
 * Propiedades generales de la aplicación
 */
export interface IgccProps {

  /**
   * Descripción de la aplicación
   */
  description: string;

  /**
   * Contexto
   */
  contexto: WebPartContext;

}
import * as React from 'react';
import { sp } from "@pnp/sp";
import { CurrentUser } from '@pnp/sp/src/siteusers';
import styles from './ComunicacionesDeContratistas.module.scss';

/**
 * Componentes REACT
 */
import Comunicaciones from './Comunicaciones/Comunicaciones';
import Eventos from './Eventos/Eventos';
import PanelNuevaNP from "./Formularios/PanelNuevaNP";
import PanelVerOS from "./Formularios/PanelVerOS";


/**
 * Tipos de datos (interfaces)
 */
import { IEvento } from './Eventos/IEvento';
import { IComunicacion } from './Comunicaciones/IComunicacion';
import { IgccProps } from "./IgccProps";
import { IContratista } from './IContratista';

/**
 * Estado General de la Aplicación
 */
interface IgccState {

  /**
   * Contratista Actual seleccionado o logueado
   */
  contratistaActual: string;

  /**
   * Envia A es a quien debe escribir las nuevas NP o las respuestas
   */
  enviaA: string;

  /**
   * Evento actual seleccionado
   */
  eventoActual: IEvento;

  /**
   * Comunicación actual seleccionada
   */
  comunicacionActual: IComunicacion;

  /**
   * Estado del panel donde se ve la info de la comunicacion seleccionada, 
   * se puede dar por notificado y/o responder a la comunicación
   */
  verOresponder: boolean;

  /**
   * Estado del panel para cerar una nueva nota de pedido
   */
  crearNota: boolean;

}

/**
 * Esta aplicación consta de dos listas vinculadas.
 * Los objetos principales son los eventos y las comunicaciones.
 * Un evento contiene varias comunicaciones y son filtradas por su seleccion.
 * Al seleccionar una comunicación se muestra un panel de propiedades y acciones.
 */
export default class ComunicacionesDeContratistas extends React.Component<IgccProps, IgccState> {

  private ListaCom: React.RefObject<Comunicaciones>;

  constructor(props: IgccProps) {
    super(props);

    this.state = {
      contratistaActual: null,
      enviaA: null,
      eventoActual: null,
      comunicacionActual: null,
      verOresponder: false,
      crearNota: false,
    };

    this.ListaCom = React.createRef();

  }

  /**
   * Al seleccionar un evento 
   * lo capturo y actualizo el evento actual
   */
  private _eventoSeleccionado = (eventoSeleccionado: IEvento): void => {
    this.setState({
      eventoActual: eventoSeleccionado
    });
  }

  /**
   * Al seleccionar una comunicación
   * la capturo y actualizo la comunicación actual
   * asi como tambien pongo visible el panel de las propiedades
   */
  private _comSeleccionada = (comSeleccionada: IComunicacion): void => {
    this.setState({
      comunicacionActual: comSeleccionada,
      verOresponder: true,
    });
  }

  /**
   * Ocualta el panel
   */
  private _ocultarPaneles = (): void => {
    this.setState({
      verOresponder: false,
      crearNota: false,
    });
  }

  /**
   * Llama a crear la Nueva Nota de Pedido
   */
  private _nuevaNP = (): void => {
    this.setState({
      crearNota: true,
    });
  }

  /**
   * Agrega la nueva Nota de Pedido a la coleccion de la lista 
   */
  private _agregarNuevaNP = (np: IComunicacion): void => {
    this.ListaCom.current.setState({ comunicaciones: [...this.ListaCom.current.state.comunicaciones, np] });
  }

  /**
   * Al montarse la aplicación voy a obtener el usuario -> su mail -> nombre contratista
   */
  public componentDidMount(): void {

    sp.web.currentUser.get().then((usuario: CurrentUser) => {

      sp.web.lists
        .getByTitle("Contratistas").items
        .filter("Email eq '" + usuario['Email'] + "'")
        .get()
        .then((items: IContratista[]): void => {

          this.setState({
            contratistaActual: items[0].Title,
            enviaA: items[0].EmailDevolucion
          });

        });

    });

  }

  /**
   * Render general de la aplicación
   */
  public render(): React.ReactElement<IgccProps> {
    const { contratistaActual, eventoActual, comunicacionActual } = this.state;

    return (
      <div className={styles.comunicacionesDeContratistas}>
        {contratistaActual &&
          <div>
            {/* <div className={styles.container}>
              <div className={styles.row}>
                <div className={styles.column}>
                  <span className={styles.title}>¡Bienvenido {contratistaActual}!</span>
                </div>
              </div>
            </div> */}

            <div className="ms-Grid" dir="ltr">
              <div className="ms-Grid-row">
                <div className={styles.eventos}>
                  <Eventos
                    delContratista={contratistaActual}
                    onSelected={this._eventoSeleccionado}
                  />
                </div>
                <div className={styles.comunicaciones}>
                  {eventoActual &&
                    <Comunicaciones ref={this.ListaCom}
                      delEvento={eventoActual}
                      onSelected={this._comSeleccionada}
                      onNuevaNP={this._nuevaNP}
                    />}
                </div>
              </div>
            </div>
            <PanelVerOS
              evento={eventoActual}
              comunicacion={comunicacionActual}
              enviarA={this.state.enviaA}
              visible={this.state.verOresponder}
              ocultar={this._ocultarPaneles}
              contexto={this.props.contexto}
              onEnviada={this._agregarNuevaNP}
            />
            <PanelNuevaNP
              evento={eventoActual}
              enviarA={this.state.enviaA}
              visible={this.state.crearNota}
              ocultar={this._ocultarPaneles}
              onEnviada={this._agregarNuevaNP}
            />
          </div>}
      </div>
    );
  }
}

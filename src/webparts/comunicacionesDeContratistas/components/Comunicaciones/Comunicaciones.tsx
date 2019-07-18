import * as React from 'react';
import { sp, Item } from "@pnp/sp";
import styles from './Comunicaciones.module.scss';

import { ListView, SelectionMode } from "@pnp/spfx-controls-react/lib/ListView";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DefaultButton, PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';

import { IEvento } from "../Eventos/IEvento";
import { IComunicacion } from './IComunicacion';


/**
 * Propiedades de las Comunicaciones
 */
interface IComunicacionesProps {

  /**
   * Filtra las comunicaciones por este evento
   */
  delEvento: IEvento;

  /**
   * Comunicación seleccionada
   */
  onSelected: (comunicacion: IComunicacion) => void;

  /**
   * Evento cuando selecciona crear una nueva NP
   */
  onNuevaNP: () => void;

}

/**
 * Estado Comunicaciones
 */
interface IComunicacionesState {

  /**
   * Listado de Comunicaciones
   */
  comunicaciones: IComunicacion[];

  /**
   * Estado de carga del listado
   */
  loading: boolean;

  /**
   * Indica la respuesta a un error
   */
  error: string;

}

/**
 * Comunicaciones
 */
export default class Comunicaciones extends React.Component<IComunicacionesProps, IComunicacionesState> {
  constructor(props: IComunicacionesProps) {
    super(props);

    this.state = {
      comunicaciones: [],
      loading: false,
      error: undefined
    };
  }

  /**
   * Obtiene la comunicaciones via REST con PNPJS
   * https://pnp.github.io/pnpjs/
   */
  private _getItems() {

    this.setState({
      loading: true
    });

    let filtro = "EventoID eq '" + this.props.delEvento.ID + "' and EstadoTeco ne 'Borrador' and EstadoTeco ne 'Cancelada'";

    sp.web.lists
      .getByTitle("Comunicaciones")
      .items.filter(filtro)
      //.expand("AttachmentFiles")
      .get()
      .then((items: IComunicacion[]): void => {

        this.setState({
          loading: false,
          comunicaciones: items.map(i => {
            i.DisplayEnvio = new Date(i.FechaEnvio).toLocaleString();
            return i;
          })
        });

      }, (error: any): void => {
        this.setState({
          loading: false,
          error: error
        });
      });

  }

  /**
   * Al montarse el componente y al cambiar las propiedades poluciono las comunicaciones
   */
  public componentDidMount(): void {
    this._getItems();
  }
  public componentDidUpdate(prevProps: IComunicacionesProps, prevState: IComunicacionesState) {
    if (prevProps.delEvento != this.props.delEvento) {
      this._getItems();
    }
  }

  /**
   * Impresión de la lista usa un control de 
   * https://sharepoint.github.io/sp-dev-fx-controls-react/controls/ListView/
   */
  public render(): React.ReactElement<IComunicacionesProps> {
    const { loading, error, comunicaciones } = this.state;

    if (this.props.delEvento) { //si tengo seleccionado el evento..
      let evento = this.props.delEvento;
      return (
        <div className={styles.comunicaciones}>

          <div className={styles.cabecera}>
            <div className={styles.titulo}>
              <span>{evento.Identificador}</span>
              <Icon iconName="WorkItem" style={{ margin: '5px' }} />
              <span>{evento.Title}</span>
            </div>
            <div className={styles.tipo}>{evento.TipoEvento}</div>
            <div className={styles.fecha}>{evento.DisplayFecha}</div>
            <div className={styles.cuerpo}>{evento.Cuerpo}</div>
          </div>

          {this.props.delEvento.TipoEvento != 'Tarea' &&
            <div style={{ textAlign: 'right' }}>
              <PrimaryButton iconProps={{ iconName: 'Add' }} onClick={this.props.onNuevaNP}>Nueva NP</PrimaryButton>
            </div>
          }
          {
            loading &&
            <Spinner size={SpinnerSize.large} label='Cargando comunicaciones...' />
          }
          {
            !loading &&
            error &&
            <div className={styles.error}>El siguiente error se produjo mientras se intentaba cargar las comunicaciones: <span className={styles.msg}>{error}</span></div>
          }
          {
            !loading &&
            !error &&
            comunicaciones.length === 0 &&
            <div className={styles.info}>Sin comunicaciones</div>
          }
          {
            !loading &&
            comunicaciones.length > 0 &&
            <ListView
              items={comunicaciones}
              viewFields={[
                {
                  name: 'TipoComunicacion',
                  displayName: 'Tipo',
                  sorting: true,
                  minWidth: 35,
                  maxWidth: 40,
                },
                {
                  name: 'Identificador',
                  displayName: 'N°',
                  sorting: true,
                  minWidth: 35,
                  maxWidth: 40,
                },
                {
                  name: 'Title',
                  displayName: 'Asunto',
                  sorting: true,
                  minWidth: 180,
                  isResizable: true
                },
                {
                  name: 'EstadoContratista',
                  displayName: 'Estado',
                  sorting: true,
                  minWidth: 100,
                  maxWidth: 100,
                },
                {
                  name: 'DisplayEnvio',
                  displayName: 'Enviada',
                  sorting: true,
                  minWidth: 110,
                  maxWidth: 110,
                }
              ]}
              compact={false}
              selectionMode={SelectionMode.single}
              selection={this._getSelection}
            />
          }
        </div >
      );
    }
    return (
      <div className={styles.comunicaciones}>
        <div className={styles.cabecera}>
          <div className={styles.titulo}>
            <span>Seleccione un Evento</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Cuando seleccione un item, elevo el objeto como propiedad
   */
  private _getSelection = (comunicacion: IComunicacion[]): void => {
    this.props.onSelected(comunicacion[0]);
  }

}